import Axios, { type AxiosAdapter, type AxiosError, type AxiosResponse } from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  attachRetryInterceptor,
  computeBackoffDelayMs,
  isIdempotentMethod,
  isRetryableAxiosError,
  MAX_RETRIES,
  type ScheduleRetry,
  scheduleWithTimeout,
} from './retry'

type Attempt = { status?: number; headers?: Record<string, string>; error?: unknown }

/** Hand-rolled adapter: one entry per attempt, so retries are observable without a network mock. */
function adapterFor(attempts: Attempt[]) {
  let call = 0
  const adapter: AxiosAdapter = (config) => {
    const attempt = attempts[Math.min(call, attempts.length - 1)]
    call += 1
    if (attempt?.error) return Promise.reject(attempt.error)
    const status = attempt?.status ?? 200
    const response = {
      status,
      statusText: '',
      data: { call },
      headers: attempt?.headers ?? {},
      config,
    } as AxiosResponse
    if (status < 400) return Promise.resolve(response)
    const error = new Error(`Request failed with status code ${status}`) as AxiosError
    error.isAxiosError = true
    error.config = config
    error.response = response
    return Promise.reject(error)
  }
  return { adapter, calls: () => call }
}

function clientFor(attempts: Attempt[], scheduleRetry: ScheduleRetry, maxRetries?: number) {
  const { adapter, calls } = adapterFor(attempts)
  const instance = Axios.create({ adapter })
  attachRetryInterceptor(instance, { scheduleRetry, maxRetries })
  return { instance, calls }
}

const immediate: ScheduleRetry = (callback) => {
  callback()
}

afterEach(() => {
  vi.useRealTimers()
})

describe('retry predicates', () => {
  it('treats missing, get, head and options as idempotent', () => {
    expect(isIdempotentMethod({})).toBe(true)
    expect(isIdempotentMethod({ method: 'HEAD' })).toBe(true)
    expect(isIdempotentMethod({ method: 'options' })).toBe(true)
    expect(isIdempotentMethod({ method: 'post' })).toBe(false)
  })

  it('retries network failures, 5xx, 408 and 429 only', () => {
    const withStatus = (status: number) => ({ response: { status } }) as AxiosError

    expect(isRetryableAxiosError({} as AxiosError)).toBe(true)
    expect(isRetryableAxiosError(withStatus(500))).toBe(true)
    expect(isRetryableAxiosError(withStatus(408))).toBe(true)
    expect(isRetryableAxiosError(withStatus(429))).toBe(true)
    expect(isRetryableAxiosError(withStatus(400))).toBe(false)
  })
})

describe('computeBackoffDelayMs', () => {
  it('grows exponentially with equal jitter, capped at 3s', () => {
    expect(computeBackoffDelayMs(0)).toBeGreaterThanOrEqual(300)
    expect(computeBackoffDelayMs(0)).toBeLessThanOrEqual(450)
    expect(computeBackoffDelayMs(1)).toBeGreaterThanOrEqual(600)
    expect(computeBackoffDelayMs(1)).toBeLessThanOrEqual(900)
    expect(computeBackoffDelayMs(20)).toBeLessThanOrEqual(4500)
    expect(computeBackoffDelayMs(20)).toBeGreaterThanOrEqual(3000)
  })
})

describe('attachRetryInterceptor', () => {
  it('re-dispatches an idempotent 5xx until it succeeds', async () => {
    const { instance, calls } = clientFor([{ status: 500 }, { status: 200 }], immediate)

    await expect(instance.get('/things')).resolves.toMatchObject({ status: 200 })
    expect(calls()).toBe(2)
  })

  it('gives up after MAX_RETRIES', async () => {
    const { instance, calls } = clientFor([{ status: 500 }], immediate)

    await expect(instance.get('/things')).rejects.toThrow('status code 500')
    expect(calls()).toBe(MAX_RETRIES + 1)
  })

  it('honors a configured retry budget', async () => {
    const { instance, calls } = clientFor([{ status: 503 }], immediate, 1)

    await expect(instance.get('/things')).rejects.toThrow('status code 503')
    expect(calls()).toBe(2)
  })

  it('never retries a non-idempotent method', async () => {
    const { instance, calls } = clientFor([{ status: 500 }], immediate)

    await expect(instance.post('/things', {})).rejects.toThrow('status code 500')
    expect(calls()).toBe(1)
  })

  it('never retries a deterministic 4xx', async () => {
    const { instance, calls } = clientFor([{ status: 400 }], immediate)

    await expect(instance.get('/things')).rejects.toThrow('status code 400')
    expect(calls()).toBe(1)
  })

  it('never retries a canceled request', async () => {
    const canceled = Object.assign(new Error('canceled'), { code: 'ERR_CANCELED', config: {} })
    const { instance, calls } = clientFor([{ error: canceled }], immediate)

    await expect(instance.get('/things')).rejects.toBe(canceled)
    expect(calls()).toBe(1)
  })

  it('rejects an error that carries no request config', async () => {
    const bare = new Error('no config at all')
    const { instance, calls } = clientFor([{ error: bare }], immediate)

    await expect(instance.get('/things')).rejects.toBe(bare)
    expect(calls()).toBe(1)
  })

  it('waits out a 429 Retry-After instead of the backoff, capped at 10s', async () => {
    const delays: number[] = []
    const schedule: ScheduleRetry = (callback, delayMs) => {
      delays.push(delayMs)
      callback()
    }
    const { instance } = clientFor(
      [
        { status: 429, headers: { 'retry-after': '2' } },
        { status: 429, headers: { 'retry-after': '600' } },
        { status: 200 },
      ],
      schedule,
    )

    await expect(instance.get('/things')).resolves.toMatchObject({ status: 200 })
    expect(delays).toEqual([2000, 10_000])
  })

  it('backs off when a 429 carries no Retry-After', async () => {
    const delays: number[] = []
    const schedule: ScheduleRetry = (callback, delayMs) => {
      delays.push(delayMs)
      callback()
    }
    const { instance } = clientFor([{ status: 429 }, { status: 200 }], schedule)

    await expect(instance.get('/things')).resolves.toMatchObject({ status: 200 })
    expect(delays[0]).toBeGreaterThanOrEqual(300)
  })

  it('defaults to a setTimeout scheduler', async () => {
    vi.useFakeTimers()
    const { adapter } = adapterFor([{ status: 500 }, { status: 200 }])
    const instance = Axios.create({ adapter })
    attachRetryInterceptor(instance)

    const pending = instance.get('/things')
    await vi.advanceTimersByTimeAsync(1000)

    await expect(pending).resolves.toMatchObject({ status: 200 })
  })

  it('exposes the setTimeout scheduler directly', async () => {
    vi.useFakeTimers()
    const callback = vi.fn()

    scheduleWithTimeout(callback, 50)
    await vi.advanceTimersByTimeAsync(50)

    expect(callback).toHaveBeenCalledTimes(1)
  })
})

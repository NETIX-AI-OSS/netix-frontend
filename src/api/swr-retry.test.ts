import type { SWRConfiguration } from 'swr'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from './errors'
import type { ScheduleRetry } from './retry'
import {
  computeSwrBackoffDelayMs,
  createSwrOnErrorRetry,
  isRetryableSwrError,
  SWR_MAX_RETRIES,
  type SwrOnErrorRetry,
  type SwrRetryOptions,
} from './swr-retry'

/** Reproduces swr's own loop: it hands the handler an already-incremented retryCount. */
function drive(handler: SwrOnErrorRetry, error: unknown, rounds = 10) {
  let retryCount = 0
  let revalidations = 0

  for (let round = 0; round < rounds; round += 1) {
    const before = revalidations
    retryCount += 1
    handler(error, '/things', {}, () => (revalidations += 1), { retryCount, dedupe: true })
    if (revalidations === before) break
  }

  return { revalidations }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('the swr onErrorRetry contract', () => {
  it('is assignable to the installed swr configuration type', () => {
    const config: SWRConfiguration = { onErrorRetry: createSwrOnErrorRetry() }

    expect(config.onErrorRetry).toBeTypeOf('function')
  })

  it('stops after exactly SWR_MAX_RETRIES revalidations', () => {
    const handler = createSwrOnErrorRetry({ scheduleRetry: (callback) => callback() })

    expect(drive(handler, new ApiError(500, ['Boom'])).revalidations).toBe(SWR_MAX_RETRIES)
  })

  it('honors a configured retry budget', () => {
    const handler = createSwrOnErrorRetry({
      maxRetries: 1,
      scheduleRetry: (callback) => callback(),
    })

    expect(drive(handler, new ApiError(0, ['Offline'])).revalidations).toBe(1)
  })

  it('passes the revalidator options straight back so swr keeps counting', () => {
    const revalidate = vi.fn()
    const handler = createSwrOnErrorRetry({ scheduleRetry: (callback) => callback() })
    const options = { retryCount: 2, dedupe: true }

    handler(new ApiError(500, ['Boom']), '/things', {}, revalidate, options)

    expect(revalidate).toHaveBeenCalledWith(options)
  })

  it('treats a missing retryCount as the first attempt', () => {
    const delays: number[] = []
    const scheduleRetry: ScheduleRetry = (callback, delayMs) => {
      delays.push(delayMs)
      callback()
    }
    const handler = createSwrOnErrorRetry({ scheduleRetry })

    handler(new ApiError(500, ['Boom']), '/things', {}, vi.fn(), {})

    expect(delays[0]).toBeGreaterThanOrEqual(250)
    expect(delays[0]).toBeLessThanOrEqual(500)
  })

  it('does not retry a deterministic 4xx or a canceled request', () => {
    const revalidate = vi.fn()
    const handler = createSwrOnErrorRetry({ scheduleRetry: (callback) => callback() })

    handler(new ApiError(403, ['Nope']), '/things', {}, revalidate, { retryCount: 1 })
    handler({ code: 'ERR_CANCELED' }, '/things', {}, revalidate, { retryCount: 1 })

    expect(revalidate).not.toHaveBeenCalled()
  })

  it('takes a custom retryability predicate', () => {
    const revalidate = vi.fn()
    const options: SwrRetryOptions = {
      isRetryable: () => true,
      scheduleRetry: (callback) => callback(),
    }

    createSwrOnErrorRetry(options)(new Error('anything'), '/things', {}, revalidate, {
      retryCount: 1,
    })

    expect(revalidate).toHaveBeenCalledTimes(1)
  })

  it('waits out a server-provided Retry-After', () => {
    const delays: number[] = []
    const handler = createSwrOnErrorRetry({
      scheduleRetry: (callback, delayMs) => {
        delays.push(delayMs)
        callback()
      },
    })

    handler(new ApiError(429, ['Slow down'], { retryAfterMs: 2500 }), '/things', {}, vi.fn(), {
      retryCount: 1,
    })

    expect(delays).toEqual([2500])
  })

  it('defaults to a setTimeout scheduler', async () => {
    vi.useFakeTimers()
    const revalidate = vi.fn()

    createSwrOnErrorRetry()(new ApiError(500, ['Boom']), '/things', {}, revalidate, {
      retryCount: 1,
    })
    await vi.advanceTimersByTimeAsync(1000)

    expect(revalidate).toHaveBeenCalledTimes(1)
  })
})

describe('isRetryableSwrError', () => {
  it('keys off the ApiError status, and still reads raw axios errors', () => {
    expect(isRetryableSwrError(new ApiError(0, ['Offline']))).toBe(true)
    expect(isRetryableSwrError(new ApiError(429, ['Slow down']))).toBe(true)
    expect(isRetryableSwrError(new ApiError(404, ['Gone']))).toBe(false)
    expect(isRetryableSwrError({ isAxiosError: true, response: { status: 502 } })).toBe(true)
    expect(isRetryableSwrError(new Error('boom'))).toBe(false)
  })
})

describe('computeSwrBackoffDelayMs', () => {
  it('grows from 500ms with equal jitter, capped at 4s', () => {
    expect(computeSwrBackoffDelayMs(0)).toBeGreaterThanOrEqual(250)
    expect(computeSwrBackoffDelayMs(0)).toBeLessThanOrEqual(500)
    expect(computeSwrBackoffDelayMs(-1)).toBeLessThanOrEqual(500)
    expect(computeSwrBackoffDelayMs(20)).toBeGreaterThanOrEqual(2000)
    expect(computeSwrBackoffDelayMs(20)).toBeLessThanOrEqual(4000)
  })
})

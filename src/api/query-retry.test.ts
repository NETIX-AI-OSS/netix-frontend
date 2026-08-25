import { describe, expect, it } from 'vitest'

import { ApiError } from './errors'
import {
  createQueryRetryPolicy,
  MAX_QUERY_RETRIES,
  queryRetryDelay,
  shouldRetryQuery,
} from './query-retry'

describe('shouldRetryQuery', () => {
  it('retries transient failures within the budget', () => {
    expect(shouldRetryQuery(0, new ApiError(500, ['Boom']))).toBe(true)
    expect(shouldRetryQuery(1, new ApiError(0, ['Offline']))).toBe(true)
    expect(shouldRetryQuery(0, { isAxiosError: true, response: { status: 429 } })).toBe(true)
  })

  it('stops at the retry budget', () => {
    expect(shouldRetryQuery(MAX_QUERY_RETRIES, new ApiError(500, ['Boom']))).toBe(false)
    expect(shouldRetryQuery(1, new ApiError(500, ['Boom']), 1)).toBe(false)
  })

  it('never retries deterministic, canceled or unknown failures', () => {
    expect(shouldRetryQuery(0, new ApiError(403, ['Nope']))).toBe(false)
    expect(shouldRetryQuery(0, { name: 'AbortError' })).toBe(false)
    expect(shouldRetryQuery(0, new Error('boom'))).toBe(false)
  })
})

describe('queryRetryDelay', () => {
  it('grows from 1s with 25% jitter, capped at 4s', () => {
    expect(queryRetryDelay(0, new ApiError(500, ['Boom']))).toBeGreaterThanOrEqual(1000)
    expect(queryRetryDelay(0, new ApiError(500, ['Boom']))).toBeLessThanOrEqual(1250)
    expect(queryRetryDelay(10, new ApiError(500, ['Boom']))).toBeLessThanOrEqual(5000)
    expect(queryRetryDelay(10, new ApiError(500, ['Boom']))).toBeGreaterThanOrEqual(4000)
  })

  it('never backs off less than a server-provided Retry-After', () => {
    const error = new ApiError(429, ['Slow down'], { retryAfterMs: 8000 })

    expect(queryRetryDelay(0, error)).toBe(8000)
  })
})

describe('createQueryRetryPolicy', () => {
  it('produces a QueryClient defaults fragment', () => {
    const { retry, retryDelay } = createQueryRetryPolicy()

    expect(retry(0, new ApiError(503, ['Down']))).toBe(true)
    expect(retry(MAX_QUERY_RETRIES, new ApiError(503, ['Down']))).toBe(false)
    expect(retryDelay).toBe(queryRetryDelay)
  })

  it('honors a configured retry budget', () => {
    const { retry } = createQueryRetryPolicy({ maxRetries: 4 })

    expect(retry(3, new ApiError(503, ['Down']))).toBe(true)
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from './errors'
import { getErrorRetryAfterMs, parseRetryAfterMs, readRetryAfterMs } from './retry-after'

afterEach(() => {
  vi.useRealTimers()
})

describe('parseRetryAfterMs', () => {
  it('reads a seconds value, including a legitimate zero', () => {
    expect(parseRetryAfterMs('2')).toBe(2000)
    expect(parseRetryAfterMs('0')).toBe(0)
    expect(parseRetryAfterMs(3)).toBe(3000)
    expect(parseRetryAfterMs('-5')).toBe(0)
  })

  it('reads the first entry of an array-valued header', () => {
    expect(parseRetryAfterMs(['4', '9'])).toBe(4000)
    expect(parseRetryAfterMs([])).toBeUndefined()
  })

  it('reads an HTTP-date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-25T12:00:00Z'))

    expect(parseRetryAfterMs('Tue, 25 Aug 2026 12:00:30 GMT')).toBe(30_000)
    expect(parseRetryAfterMs('Tue, 25 Aug 2026 11:59:30 GMT')).toBe(0)
  })

  it('returns undefined for missing or unparseable values', () => {
    expect(parseRetryAfterMs(undefined)).toBeUndefined()
    expect(parseRetryAfterMs(null)).toBeUndefined()
    expect(parseRetryAfterMs('')).toBeUndefined()
    expect(parseRetryAfterMs('   ')).toBeUndefined()
    expect(parseRetryAfterMs('soon')).toBeUndefined()
    expect(parseRetryAfterMs(Infinity)).toBeUndefined()
  })
})

describe('readRetryAfterMs', () => {
  it('reads a plain headers record, either casing', () => {
    expect(readRetryAfterMs({ 'retry-after': '1' })).toBe(1000)
    expect(readRetryAfterMs({ 'Retry-After': '1' })).toBe(1000)
    expect(readRetryAfterMs({})).toBeUndefined()
  })

  it('reads an AxiosHeaders-style bag through get()', () => {
    const headers = { get: (name: string) => (name === 'retry-after' ? '5' : undefined) }

    expect(readRetryAfterMs(headers)).toBe(5000)
  })

  it('returns undefined for a non-record', () => {
    expect(readRetryAfterMs(undefined)).toBeUndefined()
  })
})

describe('getErrorRetryAfterMs', () => {
  it('prefers the ApiError field', () => {
    expect(getErrorRetryAfterMs(new ApiError(429, ['Slow down'], { retryAfterMs: 2000 }))).toBe(
      2000,
    )
  })

  it('falls back to the raw axios response headers', () => {
    expect(getErrorRetryAfterMs({ response: { headers: { 'retry-after': '2' } } })).toBe(2000)
  })

  it('caps at the maximum honored wait', () => {
    expect(getErrorRetryAfterMs(new ApiError(429, ['Slow down'], { retryAfterMs: 60_000 }))).toBe(
      10_000,
    )
  })

  it('returns undefined when there is nothing to read', () => {
    expect(getErrorRetryAfterMs(new ApiError(500, ['Boom']))).toBeUndefined()
    expect(getErrorRetryAfterMs({ response: 'nope' })).toBeUndefined()
    expect(getErrorRetryAfterMs('boom')).toBeUndefined()
  })
})

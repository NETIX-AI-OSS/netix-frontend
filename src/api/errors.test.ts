import { describe, expect, it } from 'vitest'

import { ApiError, getErrorStatusCode, isApiError, isRetryableStatus } from './errors'

describe('ApiError', () => {
  it('joins messages into the Error message and the compat aliases', () => {
    const error = new ApiError(400, ['Name is required.', 'Email is invalid.'])

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('ApiError')
    expect(error.message).toBe('Name is required., Email is invalid.')
    expect(error.errorMessage).toBe('Name is required., Email is invalid.')
    expect(error.status).toBe(400)
    expect(error.statusCode).toBe(400)
    expect(error.retryAfterMs).toBeUndefined()
    expect(error.context).toBeUndefined()
  })

  it('falls back to the status when there are no messages', () => {
    const error = new ApiError(500, [])

    expect(error.message).toBe('HTTP 500')
    expect(error.errorMessage).toBe('')
  })

  it('carries retryAfterMs and context', () => {
    const error = new ApiError(429, ['Too many requests'], {
      retryAfterMs: 1500,
      context: { client: 'cafm' },
    })

    expect(error.retryAfterMs).toBe(1500)
    expect(error.context).toEqual({ client: 'cafm' })
  })
})

describe('isApiError', () => {
  it('guards on the class, not a brand', () => {
    expect(isApiError(new ApiError(404, ['Nope']))).toBe(true)
    expect(isApiError(new Error('Nope'))).toBe(false)
    expect(isApiError({ statusCode: 404, messages: [] })).toBe(false)
  })
})

describe('getErrorStatusCode', () => {
  it('reads an ApiError directly', () => {
    expect(getErrorStatusCode(new ApiError(404, ['Nope']))).toBe(404)
  })

  it('reads a raw axios response', () => {
    expect(getErrorStatusCode({ isAxiosError: true, response: { status: 503 } })).toBe(503)
  })

  it('treats a response-less axios error as the network sentinel', () => {
    expect(getErrorStatusCode({ isAxiosError: true, code: 'ERR_NETWORK' })).toBe(0)
    expect(getErrorStatusCode({ isAxiosError: true, response: { status: '503' } })).toBe(0)
  })

  it('returns null for anything else', () => {
    expect(getErrorStatusCode(new Error('boom'))).toBeNull()
    expect(getErrorStatusCode('boom')).toBeNull()
    expect(getErrorStatusCode({ response: { status: 500 } })).toBe(500)
  })
})

describe('isRetryableStatus', () => {
  it.each([0, 408, 429, 500, 504])('retries %s', (status) => {
    expect(isRetryableStatus(status)).toBe(true)
  })

  it.each([null, 400, 401, 403, 404, 422, 499])('does not retry %s', (status) => {
    expect(isRetryableStatus(status)).toBe(false)
  })
})

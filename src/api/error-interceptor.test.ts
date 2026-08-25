import type { AxiosError, AxiosResponse } from 'axios'
import { describe, expect, it, vi } from 'vitest'

import { createErrorInterceptor } from './error-interceptor'
import { ApiError, isApiError } from './errors'

type ResponseInit = {
  status: number
  data?: unknown
  statusText?: string
  headers?: Record<string, string>
}

function axiosError(response?: ResponseInit, overrides: Partial<AxiosError> = {}): AxiosError {
  const error = new Error('Request failed') as AxiosError
  error.isAxiosError = true
  if (response) {
    error.response = {
      status: response.status,
      statusText: response.statusText ?? '',
      data: response.data,
      headers: response.headers ?? {},
      config: {},
    } as AxiosResponse
  }
  return Object.assign(error, overrides)
}

function capture(error: AxiosError, config: Parameters<typeof createErrorInterceptor>[0] = {}) {
  const { onError } = createErrorInterceptor(config)
  try {
    onError(error)
  } catch (thrown) {
    return thrown
  }
  throw new Error('the interceptor must always throw')
}

describe('createErrorInterceptor', () => {
  it('passes successful responses through', () => {
    const response = { status: 200 } as AxiosResponse

    expect(createErrorInterceptor().onSuccess(response)).toBe(response)
  })

  it('maps a response-less failure to the status-0 sentinel', () => {
    const thrown = capture(axiosError())

    expect(isApiError(thrown)).toBe(true)
    expect(thrown).toMatchObject({ statusCode: 0, messages: ['Network error occurred'] })
  })

  it('captures a response-less failure only when it is not transient', () => {
    const captureException = vi.fn()

    capture(axiosError(), { captureException })
    expect(captureException).toHaveBeenCalledTimes(1)

    capture(axiosError(undefined, { code: 'ERR_NETWORK' } as Partial<AxiosError>), {
      captureException,
    })
    expect(captureException).toHaveBeenCalledTimes(1)
  })

  it('takes a custom network message', () => {
    expect(capture(axiosError(), { networkErrorMessage: 'Offline' })).toMatchObject({
      messages: ['Offline'],
    })
  })

  it('normalizes the error envelope', () => {
    const thrown = capture(
      axiosError({ status: 400, data: { messages: "['Name is required.']" } }),
    ) as ApiError

    expect(thrown.statusCode).toBe(400)
    expect(thrown.messages).toEqual(['Name is required.'])
    expect(thrown.errorMessage).toBe('Name is required.')
  })

  it('falls back to statusText, ignoring a non-record body', () => {
    const thrown = capture(
      axiosError({ status: 502, data: '<html>Bad Gateway</html>', statusText: 'Bad Gateway' }),
    )

    expect(thrown).toMatchObject({ messages: ['Bad Gateway'] })
  })

  it('never logs out on 403 and uses the permission message', () => {
    const onAuthError = vi.fn()

    const thrown = capture(axiosError({ status: 403, statusText: 'Forbidden' }), { onAuthError })

    expect(onAuthError).not.toHaveBeenCalled()
    expect(thrown).toMatchObject({
      statusCode: 403,
      messages: ['You do not have permission to perform this action'],
    })
  })

  it('keeps a server-provided 403 message and honors a custom default', () => {
    expect(capture(axiosError({ status: 403, data: { messages: 'Ask an admin.' } }))).toMatchObject(
      {
        messages: ['Ask an admin.'],
      },
    )
    expect(capture(axiosError({ status: 403 }), { forbiddenMessage: 'Nope.' })).toMatchObject({
      messages: ['Nope.'],
    })
  })

  it('calls onAuthError on 401 and still throws', () => {
    const onAuthError = vi.fn()

    const thrown = capture(axiosError({ status: 401, data: { messages: 'Expired.' } }), {
      onAuthError,
    })

    expect(onAuthError).toHaveBeenCalledWith(thrown)
    expect(thrown).toBeInstanceOf(ApiError)
  })

  it('captures unhandled 4xx, but not handled or excluded ones', () => {
    const captureException = vi.fn()

    capture(axiosError({ status: 405 }), { captureException, clientName: 'cafm' })
    expect(captureException).toHaveBeenCalledWith(expect.any(Error), {
      statusCode: 405,
      messages: ['Unknown error'],
      client: 'cafm',
    })

    captureException.mockClear()
    capture(axiosError({ status: 404 }), { captureException })
    capture(axiosError({ status: 403 }), { captureException })
    capture(axiosError({ status: 503 }), { captureException })
    expect(captureException).not.toHaveBeenCalled()
  })

  it('takes a custom capture predicate and exclusion list', () => {
    const captureException = vi.fn()

    capture(axiosError({ status: 500 }), { captureException, shouldCapture: () => true })
    expect(captureException).toHaveBeenCalledTimes(1)

    capture(axiosError({ status: 500 }), {
      captureException,
      shouldCapture: () => true,
      excludedErrorCodes: [500],
    })
    expect(captureException).toHaveBeenCalledTimes(1)
  })

  it('carries Retry-After through for the retry policies', () => {
    const thrown = capture(axiosError({ status: 429, headers: { 'retry-after': '3' } }))

    expect(thrown).toMatchObject({ statusCode: 429, retryAfterMs: 3000 })
  })

  it('tags the client in the error context when one is named', () => {
    expect(capture(axiosError({ status: 404 }), { clientName: 'asset' })).toMatchObject({
      context: { client: 'asset' },
    })
    expect((capture(axiosError({ status: 404 })) as ApiError).context).toBeUndefined()
  })

  it('feeds every failure to the display sink', () => {
    const onDisplayError = vi.fn()

    const thrown = capture(axiosError({ status: 500 }), { onDisplayError })

    expect(onDisplayError).toHaveBeenCalledWith(thrown)
  })
})

describe('request cancellation', () => {
  it('re-throws a canceled request untouched, bypassing every sink', () => {
    const captureException = vi.fn()
    const onDisplayError = vi.fn()
    const error = axiosError(undefined, { code: 'ERR_CANCELED' } as Partial<AxiosError>)

    const thrown = capture(error, { captureException, onDisplayError })

    expect(thrown).toBe(error)
    expect(isApiError(thrown)).toBe(false)
    expect(captureException).not.toHaveBeenCalled()
    expect(onDisplayError).not.toHaveBeenCalled()
  })

  it('recognises an abort by error name too', () => {
    const error = axiosError(undefined, { name: 'CanceledError' } as Partial<AxiosError>)

    expect(capture(error)).toBe(error)
  })
})

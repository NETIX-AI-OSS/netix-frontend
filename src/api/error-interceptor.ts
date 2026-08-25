import type { AxiosError, AxiosResponse } from 'axios'

import { parseEnvelope } from './envelope'
import { ApiError } from './errors'
import { isCanceledRequest, isRecord, isTransientNetworkError } from './predicates'
import { readRetryAfterMs } from './retry-after'
import { shouldCaptureHttpStatus } from './sentry'

export type ErrorCaptureMeta = { statusCode: number; messages: string[]; client?: string }

export type ErrorInterceptorConfig = {
  /** Tags every captured event so a Sentry issue names the failing service. */
  clientName?: string
  excludedErrorCodes?: number[]
  /** Sink for the Sentry capture; the package never imports a Sentry SDK itself. */
  captureException?: (error: unknown, meta: ErrorCaptureMeta) => void
  shouldCapture?: (statusCode: number) => boolean
  /** 401 hook: envoy-ts-auth owns refresh, so the default is to do nothing. */
  onAuthError?: (error: ApiError) => void
  /** Optional toast/banner sink; every app that has none keeps surfacing errors at the call site. */
  onDisplayError?: (error: ApiError) => void
  forbiddenMessage?: string
  networkErrorMessage?: string
}

/**
 * Unified response error handler. Every branch throws an ApiError — never returns — so the
 * react-query / SWR retry predicates still run, and a 403 never logs out.
 */
export function createErrorInterceptor(config: ErrorInterceptorConfig = {}) {
  const {
    clientName,
    excludedErrorCodes = [403, 503],
    captureException,
    shouldCapture = shouldCaptureHttpStatus,
    onAuthError,
    onDisplayError,
    forbiddenMessage = 'You do not have permission to perform this action',
    networkErrorMessage = 'Network error occurred',
  } = config

  const onError = (error: AxiosError): never => {
    // A caller-aborted request keeps its raw shape so retry predicates can recognise it.
    if (isCanceledRequest(error)) throw error
    const response = error.response
    const statusCode = response?.status ?? 0
    const messages =
      statusCode === 0
        ? [networkErrorMessage]
        : parseEnvelope(
            isRecord(response?.data) ? response.data : undefined,
            statusCode === 403 ? forbiddenMessage : response?.statusText,
          )

    const capture =
      statusCode === 0
        ? // Transient connectivity failures are expected noise, not defects.
          !isTransientNetworkError(error)
        : shouldCapture(statusCode) && !excludedErrorCodes.includes(statusCode)
    if (capture) captureException?.(error, { statusCode, messages, client: clientName })

    const apiError = new ApiError(statusCode, messages, {
      retryAfterMs: readRetryAfterMs(response?.headers),
      context: clientName === undefined ? undefined : { client: clientName },
    })

    if (statusCode === 401) onAuthError?.(apiError)
    onDisplayError?.(apiError)
    throw apiError
  }

  return { onSuccess: (response: AxiosResponse) => response, onError }
}

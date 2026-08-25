import { isRecord } from './predicates'

export type ApiErrorOptions = {
  retryAfterMs?: number
  context?: Record<string, unknown>
}

/** The one error every NETIX client throws; `messages` is always normalized to a flat string[]. */
export class ApiError extends Error {
  readonly statusCode: number
  readonly messages: string[]
  readonly retryAfterMs?: number
  readonly context?: Record<string, unknown>

  constructor(statusCode: number, messages: string[], options: ApiErrorOptions = {}) {
    super(messages.join(', ') || `HTTP ${statusCode}`)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.messages = messages
    this.retryAfterMs = options.retryAfterMs
    this.context = options.context
  }

  /** Compat alias for the pre-library `{ status }` error shape. */
  get status(): number {
    return this.statusCode
  }

  /** Compat alias for the pre-library `{ errorMessage }` error shape. */
  get errorMessage(): string {
    return this.messages.join(', ')
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/** Status from an ApiError, or from a raw axios error for clients not yet on the shared interceptor. */
export function getErrorStatusCode(error: unknown): number | null {
  if (isApiError(error)) return error.statusCode
  if (!isRecord(error)) return null
  const response = error.response
  if (isRecord(response) && typeof response.status === 'number') return response.status
  // An axios error with no response is a network failure; 0 is the fleet's sentinel for it.
  if (error.isAxiosError === true) return 0
  return null
}

/** Statuses worth re-dispatching: the network sentinel, request timeout, rate limit, and 5xx. */
export function isRetryableStatus(statusCode: number | null): boolean {
  if (statusCode === null) return false
  if (statusCode === 0 || statusCode === 408 || statusCode === 429) return true
  return statusCode >= 500
}

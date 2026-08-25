import type { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'

import { isCanceledRequest } from './predicates'
import { MAX_RETRY_AFTER_MS, readRetryAfterMs } from './retry-after'

export const MAX_RETRIES = 2
const BASE_DELAY_MS = 300
const MAX_BACKOFF_DELAY_MS = 3000

const IDEMPOTENT_METHODS = new Set(['get', 'head', 'options'])
const RETRYABLE_STATUSES = new Set([408, 429])

export type ScheduleRetry = (callback: () => void, delayMs: number) => void
export type RetryOptions = {
  maxRetries?: number
  scheduleRetry?: ScheduleRetry
  // Off by default: no donor app family retried 5xx, and one-shot error mocks rely on that.
  retryServerErrors?: boolean
}

type RetryableConfig = AxiosRequestConfig & { __retryCount?: number }

export const scheduleWithTimeout: ScheduleRetry = (callback, delayMs) => {
  setTimeout(callback, delayMs)
}

export function isIdempotentMethod(config: AxiosRequestConfig): boolean {
  return IDEMPOTENT_METHODS.has((config.method || 'get').toLowerCase())
}

export function isRetryableAxiosError(error: AxiosError, retryServerErrors = false): boolean {
  // No HTTP response at all — network error or timeout.
  if (!error.response) return true
  const status = error.response.status
  return RETRYABLE_STATUSES.has(status) || (retryServerErrors && status >= 500)
}

/** Capped exponential backoff with equal jitter. */
export function computeBackoffDelayMs(attempt: number): number {
  const exponential = Math.min(BASE_DELAY_MS * 2 ** attempt, MAX_BACKOFF_DELAY_MS)
  return exponential + Math.random() * exponential * 0.5
}

/**
 * Idempotent-only transport retry. Re-dispatches through the instance so the whole interceptor
 * chain (token refresh included) re-runs; must be attached before the error interceptor so it
 * still sees a raw AxiosError.
 */
export function attachRetryInterceptor(instance: AxiosInstance, options: RetryOptions = {}): void {
  const {
    maxRetries = MAX_RETRIES,
    scheduleRetry = scheduleWithTimeout,
    retryServerErrors = false,
  } = options

  instance.interceptors.response.use(undefined, (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined

    if (
      !config ||
      isCanceledRequest(error) ||
      !isIdempotentMethod(config) ||
      !isRetryableAxiosError(error, retryServerErrors)
    ) {
      return Promise.reject(error)
    }

    const attempt = config.__retryCount ?? 0
    if (attempt >= maxRetries) return Promise.reject(error)
    config.__retryCount = attempt + 1

    const retryAfterMs =
      error.response?.status === 429 ? readRetryAfterMs(error.response.headers) : undefined
    const delayMs =
      retryAfterMs === undefined
        ? computeBackoffDelayMs(attempt)
        : Math.min(retryAfterMs, MAX_RETRY_AFTER_MS)

    return new Promise<void>((resolve) => {
      scheduleRetry(() => resolve(), delayMs)
    }).then(() => instance(config))
  })
}

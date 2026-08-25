import { getErrorStatusCode, isRetryableStatus } from './errors'
import { isCanceledRequest } from './predicates'
import { getErrorRetryAfterMs } from './retry-after'

/** Retries after the first attempt; react-query hands the predicate a 0-based failure count. */
export const MAX_QUERY_RETRIES = 2
const BASE_DELAY_MS = 1000
const MAX_DELAY_MS = 4000

export function shouldRetryQuery(
  failureCount: number,
  error: unknown,
  maxRetries: number = MAX_QUERY_RETRIES,
): boolean {
  if (failureCount >= maxRetries) return false
  if (isCanceledRequest(error)) return false
  return isRetryableStatus(getErrorStatusCode(error))
}

/** Capped exponential backoff with 25% jitter, never shorter than a server-provided Retry-After. */
export function queryRetryDelay(attemptIndex: number, error: unknown): number {
  const base = Math.min(BASE_DELAY_MS * 2 ** attemptIndex, MAX_DELAY_MS)
  const backoff = base + Math.random() * base * 0.25
  const retryAfterMs = getErrorRetryAfterMs(error)
  return retryAfterMs === undefined ? backoff : Math.max(retryAfterMs, backoff)
}

/** Drop-in `defaultOptions.queries` fragment for a QueryClient. */
export function createQueryRetryPolicy(options: { maxRetries?: number } = {}) {
  const { maxRetries = MAX_QUERY_RETRIES } = options
  return {
    retry: (failureCount: number, error: unknown) =>
      shouldRetryQuery(failureCount, error, maxRetries),
    retryDelay: queryRetryDelay,
  }
}

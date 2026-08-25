import { getErrorStatusCode, isRetryableStatus } from './errors'
import { isCanceledRequest } from './predicates'
import { type ScheduleRetry, scheduleWithTimeout } from './retry'
import { getErrorRetryAfterMs } from './retry-after'

/** Retries after the first attempt, not total attempts. */
export const SWR_MAX_RETRIES = 3
const BASE_DELAY_MS = 500
const MAX_DELAY_MS = 4000

export type SwrRevalidatorOptions = { retryCount?: number; dedupe?: boolean }
export type SwrOnErrorRetry = (
  error: unknown,
  key: string,
  config: unknown,
  revalidate: (options?: SwrRevalidatorOptions) => void,
  options: SwrRevalidatorOptions,
) => void

export type SwrRetryOptions = {
  maxRetries?: number
  scheduleRetry?: ScheduleRetry
  isRetryable?: (error: unknown) => boolean
}

/** Capped exponential backoff with equal jitter, over a 0-based attempt index. */
export function computeSwrBackoffDelayMs(attempt: number): number {
  const capped = Math.min(BASE_DELAY_MS * 2 ** Math.max(0, attempt), MAX_DELAY_MS)
  return Math.round(capped * (0.5 + Math.random() * 0.5))
}

export function isRetryableSwrError(error: unknown): boolean {
  if (isCanceledRequest(error)) return false
  return isRetryableStatus(getErrorStatusCode(error))
}

/**
 * `onErrorRetry` for `<SWRConfig>`. SWR hands the handler an already-incremented `retryCount`
 * (1 on the first failure), so it is normalized to a 0-based attempt before the cap and backoff.
 */
export function createSwrOnErrorRetry(options: SwrRetryOptions = {}): SwrOnErrorRetry {
  const {
    maxRetries = SWR_MAX_RETRIES,
    scheduleRetry = scheduleWithTimeout,
    isRetryable = isRetryableSwrError,
  } = options

  return (error, _key, _config, revalidate, revalidateOptions) => {
    const attempt = Math.max(0, (revalidateOptions.retryCount ?? 1) - 1)
    if (attempt >= maxRetries) return
    if (!isRetryable(error)) return

    const delayMs = getErrorRetryAfterMs(error) ?? computeSwrBackoffDelayMs(attempt)
    // Pass the options straight back through; SWR increments retryCount itself on the next failure.
    scheduleRetry(() => revalidate(revalidateOptions), delayMs)
  }
}

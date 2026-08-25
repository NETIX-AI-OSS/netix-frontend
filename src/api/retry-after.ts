import { isApiError } from './errors'
import { isRecord } from './predicates'

/** Beyond this a server-provided Retry-After is not worth blocking a retry on. */
export const MAX_RETRY_AFTER_MS = 10_000

/** `Retry-After` is a number of seconds or an HTTP-date; array-valued headers take the first entry. */
export function parseRetryAfterMs(headerValue: unknown): number | undefined {
  const raw = Array.isArray(headerValue) ? headerValue[0] : headerValue
  if (raw === undefined || raw === null) return undefined

  const value = String(raw).trim()
  if (value === '') return undefined

  const seconds = Number(value)
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000)

  const dateMs = Date.parse(value)
  if (!Number.isNaN(dateMs)) return Math.max(0, dateMs - Date.now())

  return undefined
}

/** Reads Retry-After off an axios headers bag, which is either an AxiosHeaders or a plain record. */
export function readRetryAfterMs(headers: unknown): number | undefined {
  if (!isRecord(headers)) return undefined
  const get = headers.get
  const raw =
    typeof get === 'function'
      ? (get as (name: string) => unknown).call(headers, 'retry-after')
      : (headers['retry-after'] ?? headers['Retry-After'])
  return parseRetryAfterMs(raw)
}

/** Capped Retry-After for a thrown error, from ApiError first and the raw axios response second. */
export function getErrorRetryAfterMs(error: unknown): number | undefined {
  const fromApiError = isApiError(error) ? error.retryAfterMs : undefined
  const raw =
    fromApiError ??
    (isRecord(error) && isRecord(error.response)
      ? readRetryAfterMs(error.response.headers)
      : undefined)
  return raw === undefined ? undefined : Math.min(raw, MAX_RETRY_AFTER_MS)
}

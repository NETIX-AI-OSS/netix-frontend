export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// Status-less transient network failures raised by axios, fetch and RN's networking stack.
const TRANSIENT_NETWORK_MESSAGE =
  /Failed to fetch|^Load failed$|NetworkError when attempting to fetch|Network request failed|Network Error|ERR_CONN/i

export function isCanceledRequest(exception: unknown): boolean {
  if (!isRecord(exception)) return false
  if (exception.__CANCEL__ === true || exception.code === 'ERR_CANCELED') return true
  if (exception.name === 'CanceledError' || exception.name === 'AbortError') return true
  // Both spellings, case-insensitive.
  if (typeof exception.message === 'string' && /cancell?ed/i.test(exception.message)) return true
  // Browser-triggered XHR abort.
  return exception.message === 'Request aborted'
}

export function isTransientNetworkError(exception: unknown): boolean {
  if (!isRecord(exception)) return false
  if (exception.code === 'ERR_NETWORK') return true
  return typeof exception.message === 'string' && TRANSIENT_NETWORK_MESSAGE.test(exception.message)
}

export function isCanceledOrNetworkError(exception: unknown): boolean {
  return isCanceledRequest(exception) || isTransientNetworkError(exception)
}

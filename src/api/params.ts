/**
 * `repeat` (?a=1&a=2) is what most backends' DRF filters expect; `comma` (?a=1,2) is what
 * django-filter's BaseInFilter needs — axios's default bracketed keys are silently dropped by both.
 */
export type ParamsSerializerStrategy = 'repeat' | 'comma' | 'default'

/** Backends expect ISO 8601; Date.toString() yields a local, non-standard string. */
function encodeValue(value: unknown): string {
  return encodeURIComponent(value instanceof Date ? value.toISOString() : String(value))
}

function serialize(params: Record<string, unknown>, joinArrays: boolean): string {
  const parts: string[] = []
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    const encodedKey = encodeURIComponent(key)
    if (!Array.isArray(value)) {
      parts.push(`${encodedKey}=${encodeValue(value)}`)
      continue
    }
    if (value.length === 0) continue
    if (joinArrays) {
      parts.push(`${encodedKey}=${value.map(encodeValue).join(',')}`)
    } else {
      for (const entry of value) parts.push(`${encodedKey}=${encodeValue(entry)}`)
    }
  }
  return parts.join('&')
}

export function serializeParamsRepeat(params: Record<string, unknown>): string {
  return serialize(params, false)
}

export function serializeParamsComma(params: Record<string, unknown>): string {
  return serialize(params, true)
}

export function createParamsSerializer(strategy: ParamsSerializerStrategy = 'default') {
  if (strategy === 'default') return undefined
  return { serialize: strategy === 'comma' ? serializeParamsComma : serializeParamsRepeat }
}

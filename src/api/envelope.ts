import { isRecord } from './predicates'

const DEFAULT_FALLBACK = 'Unknown error'
const ERROR_DETAIL_MARKER = `[ErrorDetail(string='`

/** Pulls "field : message" out of a DRF repr like "{'field': [ErrorDetail(string='Required.', code='x')]}". */
function stripErrorDetail(value: string): string | undefined {
  const message = value.split(ERROR_DETAIL_MARKER)[1]?.split(`',`)[0]?.split('\\n')[0]
  if (!message) return undefined
  const key = value.split(`{'`)[1]?.split(`'`)[0]
  return key ? `${key} : ${message}` : message
}

/** "['a', 'b']" is the NETIX_ERRORS_STRINGIFIED artifact — a Python list repr, not always JSON. */
function parseStringifiedArray(value: string): string[] | undefined {
  try {
    // The value starts with '[', so anything that parses as JSON here is an array.
    return (JSON.parse(value) as unknown[]).map(String)
  } catch {
    const inner = /^\[\s*'([\s\S]*)'\s*\]$/.exec(value)?.[1]
    return inner === undefined ? undefined : inner.split(/',\s*'/)
  }
}

function normalizeString(value: string): string[] {
  const trimmed = value.trim()
  if (trimmed === '') return []
  if (trimmed.includes(ERROR_DETAIL_MARKER)) {
    const stripped = stripErrorDetail(trimmed)
    if (stripped) return [stripped]
  }
  if (trimmed.startsWith('[')) {
    const parsed = parseStringifiedArray(trimmed)
    if (parsed) return parsed.filter((message) => message !== '')
  }
  return [trimmed]
}

function normalizeValue(value: unknown): string[] {
  if (value === null || value === undefined) return []
  if (typeof value === 'string') return normalizeString(value)
  if (Array.isArray(value)) return value.flatMap(normalizeValue)
  if (isRecord(value)) {
    return Object.entries(value).flatMap(([key, entry]) =>
      normalizeValue(entry).map((message) => `${key} : ${message}`),
    )
  }
  return [String(value)]
}

/** Normalizes the `{status_code, messages}` error envelope (plus DRF `detail`/`error`) to a flat string[]. */
export function parseEnvelope(data: unknown, fallback?: string): string[] {
  const source = isRecord(data)
    ? (data.messages ?? data.message ?? data.detail ?? data.error)
    : data
  const messages = normalizeValue(source)
  return messages.length > 0 ? messages : [fallback || DEFAULT_FALLBACK]
}

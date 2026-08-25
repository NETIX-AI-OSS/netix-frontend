import { isApiError } from './errors'
import { isCanceledOrNetworkError, isRecord } from './predicates'

export type SentryEvent = {
  exception?: unknown
  tags?: unknown
  request?: unknown
  contexts?: unknown
  extra?: Record<string, unknown>
  fingerprint?: string[]
}

export type SentryEventHint = { originalException?: unknown }

/** 403 is an expected in-app condition, not a defect: the whole fleet converges on dropping it. */
export const HANDLED_HTTP_STATUSES: ReadonlySet<number> = new Set([400, 403, 404])

export function asStatusCode(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 100 && value <= 999) {
    return value
  }
  if (typeof value === 'string' && /^\d{3}$/.test(value.trim())) {
    return Number.parseInt(value.trim(), 10)
  }
  return null
}

export function extractStatusFromMessage(value: unknown): number | null {
  if (typeof value !== 'string') return null
  const match = /status code (\d{3})/i.exec(value)
  return match ? asStatusCode(match[1]) : null
}

function extractStatusFromEvent(event: SentryEvent): number | null {
  const tags = isRecord(event.tags) ? event.tags : undefined
  const statusFromTags = asStatusCode(tags?.statusCode ?? tags?.status_code ?? tags?.http_status)
  if (statusFromTags !== null) return statusFromTags

  const request = isRecord(event.request) ? event.request : undefined
  const statusFromRequest = asStatusCode(request?.status_code ?? request?.statusCode)
  if (statusFromRequest !== null) return statusFromRequest

  const contexts = isRecord(event.contexts) ? event.contexts : undefined
  const responseContext = contexts?.response
  if (isRecord(responseContext)) {
    const statusFromContext = asStatusCode(
      responseContext.status_code ?? responseContext.statusCode,
    )
    if (statusFromContext !== null) return statusFromContext
  }

  const exception = isRecord(event.exception) ? event.exception : undefined
  const values = Array.isArray(exception?.values) ? exception.values : []
  for (const value of values) {
    if (!isRecord(value)) continue
    const statusFromException = extractStatusFromMessage(value.value)
    if (statusFromException !== null) return statusFromException
  }

  return null
}

function extractStatusFromHint(hint?: SentryEventHint): number | null {
  const original = hint?.originalException
  if (!original) return null

  const statusFromMessage = extractStatusFromMessage(original)
  if (statusFromMessage !== null) return statusFromMessage

  if (!isRecord(original)) return null

  const statusFromObjMessage = extractStatusFromMessage(original.message)
  if (statusFromObjMessage !== null) return statusFromObjMessage

  const directStatus = asStatusCode(original.statusCode ?? original.status)
  if (directStatus !== null) return directStatus

  const response = original.response
  if (!isRecord(response)) return null

  return asStatusCode(response.status ?? response.statusCode)
}

export function extractHttpStatus(event: SentryEvent, hint?: SentryEventHint): number | null {
  return extractStatusFromEvent(event) ?? extractStatusFromHint(hint)
}

export function isHandledHttpStatus(
  statusCode: number | null | undefined,
  handled: ReadonlySet<number> = HANDLED_HTTP_STATUSES,
): boolean {
  return statusCode != null && (handled.has(statusCode) || (statusCode >= 500 && statusCode <= 599))
}

export function shouldCaptureHttpStatus(
  statusCode: number | null | undefined,
  handled?: ReadonlySet<number>,
): boolean {
  return !isHandledHttpStatus(statusCode, handled)
}

/** Backstop for non-Error captures: gives GlitchTip a message and a shape-based fingerprint to group on. */
export function coerceNonErrorEvent<TEvent extends SentryEvent>(
  event: TEvent,
  hint?: SentryEventHint,
): TEvent {
  const original = hint?.originalException
  // Errors, strings and primitives already group; only plain objects need rewriting.
  if (
    original === null ||
    typeof original !== 'object' ||
    original instanceof Error ||
    Array.isArray(original)
  ) {
    return event
  }

  const object = original as Record<string, unknown>
  const keys = Object.keys(object).sort()
  const messageField =
    (typeof object.errorMessage === 'string' && object.errorMessage) ||
    (typeof object.message === 'string' && object.message) ||
    (typeof object.detail === 'string' && object.detail) ||
    ''
  const value = messageField
    ? `Non-Error captured: ${messageField}`
    : `Non-Error captured with keys: ${keys.join(', ')}`

  const exception = isRecord(event.exception) ? event.exception : undefined
  const first = Array.isArray(exception?.values) ? exception.values[0] : undefined
  if (isRecord(first)) {
    first.type = 'NonError'
    first.value = value
  } else {
    event.exception = { values: [{ type: 'NonError', value }] }
  }

  // Dynamic keys (UUIDs) would explode the issue list, so fingerprint on identifier-shaped ones only.
  const stableKeys = keys.filter((key) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key))
  event.fingerprint = ['non-error-capture', stableKeys.join(',')]
  event.extra = { ...event.extra, non_error_captured: object }

  return event
}

export type SentryBeforeSendOptions = {
  handledStatuses?: ReadonlySet<number>
  /** Extra drop predicates, e.g. viz-ui's meta2d vendor-bug filter. */
  drop?: Array<(event: SentryEvent, hint?: SentryEventHint) => boolean>
  dropCanceledOrNetworkErrors?: boolean
  /** Drops 4xx ApiErrors already surfaced in-app (their unhandled-rejection shadow is noise). */
  dropHandledApiErrors?: boolean
  coerceNonErrors?: boolean
}

/** The shared `beforeSend` chain: drop filters first, then the handled-status filter, then coercion. */
export function createSentryBeforeSend(options: SentryBeforeSendOptions = {}) {
  const {
    handledStatuses,
    drop = [],
    dropCanceledOrNetworkErrors = true,
    dropHandledApiErrors = false,
    coerceNonErrors = true,
  } = options

  return <TEvent extends SentryEvent>(event: TEvent, hint?: SentryEventHint): TEvent | null => {
    if (drop.some((predicate) => predicate(event, hint))) return null
    if (dropCanceledOrNetworkErrors && isCanceledOrNetworkError(hint?.originalException))
      return null

    const original = hint?.originalException
    if (
      dropHandledApiErrors &&
      isApiError(original) &&
      original.statusCode >= 400 &&
      original.statusCode < 500
    ) {
      return null
    }

    if (isHandledHttpStatus(extractHttpStatus(event, hint), handledStatuses)) return null
    return coerceNonErrors ? coerceNonErrorEvent(event, hint) : event
  }
}

/** Zero-config `beforeSend` for the web apps. */
export const sentryBeforeSendDropHandledHttpErrors = createSentryBeforeSend()

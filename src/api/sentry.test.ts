import { describe, expect, it, vi } from 'vitest'

import { ApiError } from './errors'
import {
  asStatusCode,
  coerceNonErrorEvent,
  createSentryBeforeSend,
  extractHttpStatus,
  extractStatusFromMessage,
  HANDLED_HTTP_STATUSES,
  isHandledHttpStatus,
  sentryBeforeSendDropHandledHttpErrors,
  type SentryEvent,
  shouldCaptureHttpStatus,
} from './sentry'

describe('asStatusCode', () => {
  it('accepts three-digit integers and their string form', () => {
    expect(asStatusCode(404)).toBe(404)
    expect(asStatusCode('404')).toBe(404)
    expect(asStatusCode(' 404 ')).toBe(404)
  })

  it('rejects out-of-range and non-status values', () => {
    expect(asStatusCode(99)).toBeNull()
    expect(asStatusCode(1000)).toBeNull()
    expect(asStatusCode(404.5)).toBeNull()
    expect(asStatusCode('4040')).toBeNull()
    expect(asStatusCode(null)).toBeNull()
  })
})

describe('extractStatusFromMessage', () => {
  it('reads axios’ "Request failed with status code NNN"', () => {
    expect(extractStatusFromMessage('Request failed with status code 404')).toBe(404)
    expect(extractStatusFromMessage('nothing here')).toBeNull()
    expect(extractStatusFromMessage(404)).toBeNull()
  })
})

describe('extractHttpStatus', () => {
  it.each([
    ['tags.statusCode', { tags: { statusCode: 401 } }],
    ['tags.status_code', { tags: { status_code: 401 } }],
    ['tags.http_status', { tags: { http_status: 401 } }],
    ['request.status_code', { request: { status_code: 401 } }],
    ['request.statusCode', { request: { statusCode: 401 } }],
    ['contexts.response.status_code', { contexts: { response: { status_code: 401 } } }],
    ['contexts.response.statusCode', { contexts: { response: { statusCode: 401 } } }],
    [
      'exception values',
      { exception: { values: ['skipped', { value: 'Request failed with status code 401' }] } },
    ],
  ])('reads %s off the event', (_label, event: SentryEvent) => {
    expect(extractHttpStatus(event)).toBe(401)
  })

  it('ignores unusable event shapes', () => {
    expect(extractHttpStatus({ tags: 'nope', request: 'nope', contexts: 'nope' })).toBeNull()
    expect(extractHttpStatus({ contexts: { response: 'nope' } })).toBeNull()
    expect(extractHttpStatus({ contexts: { response: { latency: 12 } } })).toBeNull()
    expect(extractHttpStatus({ exception: { values: 'nope' } })).toBeNull()
    expect(extractHttpStatus({ exception: { values: [{ value: 'no status here' }] } })).toBeNull()
  })

  it.each([
    ['a string exception', 'Request failed with status code 500'],
    ['an object message', { message: 'Request failed with status code 500' }],
    ['a statusCode field', { statusCode: 500 }],
    ['a status field', { status: 500 }],
    ['a nested response.status', { response: { status: 500 } }],
    ['a nested response.statusCode', { response: { statusCode: 500 } }],
  ])('falls back to %s on the hint', (_label, originalException) => {
    expect(extractHttpStatus({}, { originalException })).toBe(500)
  })

  it('returns null when the hint carries nothing usable', () => {
    expect(extractHttpStatus({})).toBeNull()
    expect(extractHttpStatus({}, {})).toBeNull()
    expect(extractHttpStatus({}, { originalException: 7 })).toBeNull()
    expect(extractHttpStatus({}, { originalException: { response: 'nope' } })).toBeNull()
    expect(extractHttpStatus({}, { originalException: { response: {} } })).toBeNull()
  })
})

describe('isHandledHttpStatus', () => {
  it('defaults to 400/403/404 plus every 5xx', () => {
    expect(HANDLED_HTTP_STATUSES.has(403)).toBe(true)
    expect([400, 403, 404, 500, 599].map((s) => isHandledHttpStatus(s))).toEqual([
      true,
      true,
      true,
      true,
      true,
    ])
    expect([401, 405, 429, 600].map((s) => isHandledHttpStatus(s))).toEqual([
      false,
      false,
      false,
      false,
    ])
    expect(isHandledHttpStatus(null)).toBe(false)
    expect(isHandledHttpStatus(undefined)).toBe(false)
  })

  it('takes a configured status set', () => {
    const handled = new Set([400, 404])

    expect(isHandledHttpStatus(403, handled)).toBe(false)
    expect(shouldCaptureHttpStatus(403, handled)).toBe(true)
    expect(shouldCaptureHttpStatus(403)).toBe(false)
  })
})

describe('coerceNonErrorEvent', () => {
  it.each([
    ['undefined', undefined],
    ['null', null],
    ['an Error', new Error('boom')],
    ['an array', [1]],
    ['a primitive', 'boom'],
  ])('passes %s through untouched', (_label, originalException) => {
    const event = { extra: { kept: true } }

    expect(coerceNonErrorEvent(event, { originalException })).toBe(event)
    expect(event).toEqual({ extra: { kept: true } })
  })

  it.each([
    ['errorMessage', { errorMessage: 'From errorMessage' }],
    ['message', { errorMessage: 1, message: 'From message' }],
    ['detail', { message: 1, detail: 'From detail' }],
  ])('prefers the %s field for the exception value', (_label, originalException) => {
    const event = coerceNonErrorEvent({} as SentryEvent, { originalException })
    const values = (event.exception as { values: Array<{ type: string; value: string }> }).values

    expect(values[0]?.type).toBe('NonError')
    expect(values[0]?.value).toMatch(/^Non-Error captured: From /)
  })

  it('falls back to a key listing and fingerprints identifier-shaped keys only', () => {
    const originalException = { '123': 'x', errorCode: 4, trace_id: 'abc' }

    const event = coerceNonErrorEvent({} as SentryEvent, { originalException })

    expect(event.exception).toEqual({
      values: [
        { type: 'NonError', value: 'Non-Error captured with keys: 123, errorCode, trace_id' },
      ],
    })
    expect(event.fingerprint).toEqual(['non-error-capture', 'errorCode,trace_id'])
    expect(event.extra).toEqual({ non_error_captured: originalException })
  })

  it('rewrites an existing exception value in place', () => {
    const event: SentryEvent = { exception: { values: [{ type: 'Object', value: '<unknown>' }] } }

    coerceNonErrorEvent(event, { originalException: { detail: 'Boom' } })

    expect(event.exception).toEqual({
      values: [{ type: 'NonError', value: 'Non-Error captured: Boom' }],
    })
  })

  it('replaces an unusable exception shape', () => {
    const event: SentryEvent = { exception: { values: ['not-a-record'] } }

    coerceNonErrorEvent(event, { originalException: { a: 1 } })

    expect(event.exception).toEqual({
      values: [{ type: 'NonError', value: 'Non-Error captured with keys: a' }],
    })
  })
})

describe('createSentryBeforeSend', () => {
  it('drops handled statuses and keeps the rest', () => {
    const beforeSend = createSentryBeforeSend()

    expect(beforeSend({ tags: { statusCode: 403 } })).toBeNull()
    expect(beforeSend({ tags: { statusCode: 500 } })).toBeNull()
    expect(beforeSend({ tags: { statusCode: 405 } })).toEqual({ tags: { statusCode: 405 } })
  })

  it('honors a configured handled-status set', () => {
    const beforeSend = createSentryBeforeSend({ handledStatuses: new Set([400, 404]) })

    expect(beforeSend({ tags: { statusCode: 403 } })).not.toBeNull()
  })

  it('runs extra drop predicates first', () => {
    const drop = vi.fn(() => true)
    const beforeSend = createSentryBeforeSend({ drop: [drop] })

    expect(beforeSend({ tags: { statusCode: 405 } })).toBeNull()
    expect(drop).toHaveBeenCalledTimes(1)
  })

  it('drops canceled and transient network noise unless told otherwise', () => {
    const hint = { originalException: { code: 'ERR_NETWORK', message: 'Network Error' } }

    expect(createSentryBeforeSend()({}, hint)).toBeNull()
    expect(createSentryBeforeSend({ dropCanceledOrNetworkErrors: false })({}, hint)).not.toBeNull()
  })

  it('optionally drops 4xx ApiErrors already surfaced in-app', () => {
    const hint = { originalException: new ApiError(405, ['Nope']) }

    expect(createSentryBeforeSend({ dropHandledApiErrors: true })({}, hint)).toBeNull()
    expect(createSentryBeforeSend()({}, hint)).not.toBeNull()
    expect(
      createSentryBeforeSend({ dropHandledApiErrors: true })(
        {},
        { originalException: new ApiError(302, ['Unexpected redirect']) },
      ),
    ).not.toBeNull()
    expect(
      createSentryBeforeSend({ dropHandledApiErrors: true })({}, { originalException: { a: 1 } }),
    ).not.toBeNull()
  })

  it('coerces non-Error captures unless disabled', () => {
    const hint = { originalException: { a: 1 } }

    expect(createSentryBeforeSend()({} as SentryEvent, hint)?.fingerprint).toEqual([
      'non-error-capture',
      'a',
    ])
    expect(createSentryBeforeSend({ coerceNonErrors: false })({}, hint)).toEqual({})
  })

  it('exposes a zero-config default', () => {
    expect(sentryBeforeSendDropHandledHttpErrors({ tags: { statusCode: 404 } })).toBeNull()
    expect(sentryBeforeSendDropHandledHttpErrors({ tags: { statusCode: 405 } })).not.toBeNull()
  })
})

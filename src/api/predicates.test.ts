import { describe, expect, it } from 'vitest'

import {
  isCanceledOrNetworkError,
  isCanceledRequest,
  isRecord,
  isTransientNetworkError,
} from './predicates'

describe('isRecord', () => {
  it('accepts plain objects only', () => {
    expect(isRecord({ a: 1 })).toBe(true)
    expect(isRecord(new Error('x'))).toBe(true)
    expect(isRecord(null)).toBe(false)
    expect(isRecord([1])).toBe(false)
    expect(isRecord('a')).toBe(false)
    expect(isRecord(undefined)).toBe(false)
  })
})

describe('isCanceledRequest', () => {
  it.each([
    ['axios cancel brand', { __CANCEL__: true }],
    ['axios cancel code', { code: 'ERR_CANCELED' }],
    ['CanceledError', { name: 'CanceledError' }],
    ['AbortError', { name: 'AbortError' }],
    ['canceled message', { message: 'Request canceled by user' }],
    ['cancelled message', { message: 'CANCELLED' }],
    ['xhr abort', { message: 'Request aborted' }],
  ])('matches %s', (_label, value) => {
    expect(isCanceledRequest(value)).toBe(true)
  })

  it.each([
    ['non-records', 'ERR_CANCELED'],
    ['unrelated errors', { code: 'ERR_BAD_REQUEST', message: 'Bad request' }],
    ['non-string messages', { message: 42 }],
    ['false cancel brand', { __CANCEL__: false }],
  ])('rejects %s', (_label, value) => {
    expect(isCanceledRequest(value)).toBe(false)
  })
})

describe('isTransientNetworkError', () => {
  it.each([
    ['axios network code', { code: 'ERR_NETWORK' }],
    ['axios message', { message: 'Network Error' }],
    ['fetch message', { message: 'Failed to fetch' }],
    ['safari message', { message: 'Load failed' }],
    ['firefox message', { message: 'NetworkError when attempting to fetch resource.' }],
    ['react-native message', { message: 'Network request failed' }],
    ['connection code in message', { message: 'connect ERR_CONNECTION_REFUSED' }],
  ])('matches %s', (_label, value) => {
    expect(isTransientNetworkError(value)).toBe(true)
  })

  it.each([
    ['non-records', null],
    ['unrelated messages', { message: 'Load failed to render the widget' }],
    ['non-string messages', { message: { nested: true } }],
  ])('rejects %s', (_label, value) => {
    expect(isTransientNetworkError(value)).toBe(false)
  })
})

describe('isCanceledOrNetworkError', () => {
  it('is the union of both matchers', () => {
    expect(isCanceledOrNetworkError({ name: 'AbortError' })).toBe(true)
    expect(isCanceledOrNetworkError({ code: 'ERR_NETWORK' })).toBe(true)
    expect(isCanceledOrNetworkError({ message: 'Boom' })).toBe(false)
  })
})

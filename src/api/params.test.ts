import { describe, expect, it } from 'vitest'

import { createParamsSerializer, serializeParamsComma, serializeParamsRepeat } from './params'

describe('serializeParamsRepeat', () => {
  it('repeats the key for each array entry', () => {
    expect(serializeParamsRepeat({ asset: [1, 2], page: 3 })).toBe('asset=1&asset=2&page=3')
  })
})

describe('serializeParamsComma', () => {
  it('comma-joins arrays for django-filter BaseInFilter', () => {
    expect(serializeParamsComma({ asset: [1, 2], page: 3 })).toBe('asset=1,2&page=3')
  })
})

describe('shared serialization rules', () => {
  it('drops null, undefined and empty arrays', () => {
    const params = { a: null, b: undefined, c: [], d: 'kept' }

    expect(serializeParamsRepeat(params)).toBe('d=kept')
    expect(serializeParamsComma(params)).toBe('d=kept')
  })

  it('sends dates as ISO 8601', () => {
    const date = new Date('2026-08-25T12:00:00.000Z')

    expect(serializeParamsComma({ from: date })).toBe('from=2026-08-25T12%3A00%3A00.000Z')
    expect(serializeParamsRepeat({ from: [date] })).toBe('from=2026-08-25T12%3A00%3A00.000Z')
  })

  it('encodes keys and values', () => {
    expect(serializeParamsRepeat({ 'name in': 'a&b' })).toBe('name%20in=a%26b')
  })
})

describe('createParamsSerializer', () => {
  it('leaves axios’ own serializer in place by default', () => {
    expect(createParamsSerializer()).toBeUndefined()
    expect(createParamsSerializer('default')).toBeUndefined()
  })

  it('wires the requested strategy', () => {
    expect(createParamsSerializer('repeat')?.serialize({ a: [1, 2] })).toBe('a=1&a=2')
    expect(createParamsSerializer('comma')?.serialize({ a: [1, 2] })).toBe('a=1,2')
  })
})

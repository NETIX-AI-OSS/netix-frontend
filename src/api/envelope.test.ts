import { describe, expect, it } from 'vitest'

import { parseEnvelope } from './envelope'

describe('parseEnvelope', () => {
  it('passes a real array through', () => {
    expect(parseEnvelope({ messages: ['One.', 'Two.'] })).toEqual(['One.', 'Two.'])
  })

  it('wraps a bare string', () => {
    expect(parseEnvelope({ messages: 'Something broke.' })).toEqual(['Something broke.'])
  })

  it('splits a JSON stringified array', () => {
    expect(parseEnvelope({ messages: '["One.", "Two."]' })).toEqual(['One.', 'Two.'])
    expect(parseEnvelope({ messages: '[1, 2]' })).toEqual(['1', '2'])
  })

  it('splits the Python list repr NETIX_ERRORS_STRINGIFIED emits', () => {
    expect(parseEnvelope({ messages: "['Asset already exists.']" })).toEqual([
      'Asset already exists.',
    ])
    expect(parseEnvelope({ messages: "['One.', 'Two.']" })).toEqual(['One.', 'Two.'])
  })

  it('keeps a bracketed string it cannot parse', () => {
    expect(parseEnvelope({ messages: '[unterminated' })).toEqual(['[unterminated'])
  })

  it('strips the DRF ErrorDetail wrapper and keeps the field name', () => {
    const messages = "{'name': [ErrorDetail(string='This field is required.', code='required')]}"

    expect(parseEnvelope({ messages })).toEqual(['name : This field is required.'])
  })

  it('strips an ErrorDetail with no field key', () => {
    const messages = "[ErrorDetail(string='Invalid token.', code='invalid')]"

    expect(parseEnvelope({ messages })).toEqual(['Invalid token.'])
  })

  it('keeps only the first line of a multi-line ErrorDetail', () => {
    const messages = "{'file': [ErrorDetail(string='Bad row.\\nBad column.', code='invalid')]}"

    expect(parseEnvelope({ messages })).toEqual(['file : Bad row.'])
  })

  it('falls back when the ErrorDetail wrapper is truncated', () => {
    const messages = "[ErrorDetail(string='"

    expect(parseEnvelope({ messages })).toEqual([messages])
  })

  it('reads message, detail and error before giving up', () => {
    expect(parseEnvelope({ message: 'From message.' })).toEqual(['From message.'])
    expect(parseEnvelope({ detail: 'From detail.' })).toEqual(['From detail.'])
    expect(parseEnvelope({ detail: ['a', 'b'] })).toEqual(['a', 'b'])
    expect(parseEnvelope({ error: 'From error.' })).toEqual(['From error.'])
  })

  it('flattens a DRF field-error object', () => {
    expect(parseEnvelope({ messages: { name: ['Required.'], email: 'Invalid.' } })).toEqual([
      'name : Required.',
      'email : Invalid.',
    ])
  })

  it('stringifies non-string leaves', () => {
    expect(parseEnvelope({ messages: 42 })).toEqual(['42'])
    expect(parseEnvelope({ messages: [true] })).toEqual(['true'])
  })

  it('mines a non-record body directly', () => {
    expect(parseEnvelope("['Bare body.']")).toEqual(['Bare body.'])
    expect(parseEnvelope(['a'])).toEqual(['a'])
  })

  it('uses the fallback when nothing usable is present', () => {
    expect(parseEnvelope(undefined)).toEqual(['Unknown error'])
    expect(parseEnvelope(null, 'Not Found')).toEqual(['Not Found'])
    expect(parseEnvelope({}, 'Not Found')).toEqual(['Not Found'])
    expect(parseEnvelope({ messages: [] }, 'Not Found')).toEqual(['Not Found'])
    expect(parseEnvelope({ messages: '   ' }, 'Not Found')).toEqual(['Not Found'])
    expect(parseEnvelope({ messages: '[]' }, 'Not Found')).toEqual(['Not Found'])
  })

  it('drops empty entries from a mixed array', () => {
    expect(parseEnvelope({ messages: ['', 'Kept.', null] })).toEqual(['Kept.'])
  })
})

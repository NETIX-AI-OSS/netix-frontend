import { describe, expect, it } from 'vitest'

import {
  arrayToCommaSeparated,
  commaSeparatedToArray,
  DEFAULT_EMAIL_ERROR,
  emailValidator,
  filterIntersection,
  getEnumOptions,
  removeDuplicates,
  removeEmptyAttributes,
} from './collections'

describe('commaSeparatedToArray', () => {
  it('defaults to numbers and trims blanks', () => {
    expect(commaSeparatedToArray(' 1, 2 ,,3 ')).toEqual([1, 2, 3])
    expect(commaSeparatedToArray()).toEqual([])
    expect(commaSeparatedToArray(null)).toEqual([])
  })

  it('keeps strings when asked', () => {
    expect(commaSeparatedToArray('a,b', { as: 'string' })).toEqual(['a', 'b'])
    expect(commaSeparatedToArray('1,2', { as: 'number' })).toEqual([1, 2])
  })
})

describe('arrayToCommaSeparated', () => {
  it('joins and collapses empties to undefined', () => {
    expect(arrayToCommaSeparated([1, 'a', true])).toBe('1,a,true')
    expect(arrayToCommaSeparated([])).toBeUndefined()
    expect(arrayToCommaSeparated()).toBeUndefined()
  })
})

describe('removeDuplicates', () => {
  it('dedupes preserving order', () => {
    expect(removeDuplicates([1, 1, 2, 1])).toEqual([1, 2])
  })
})

describe('filterIntersection', () => {
  it('passes the filter through when not applied', () => {
    expect(filterIntersection('1,2', [1], false)).toBe('1,2')
  })

  it('falls back to the restriction when the filter is empty', () => {
    expect(filterIntersection(undefined, [1, 2])).toBe('1,2')
    expect(filterIntersection(undefined, undefined)).toBeUndefined()
  })

  it('returns the filter when unrestricted and undefined when restricted to nothing', () => {
    expect(filterIntersection('1,2', undefined)).toBe('1,2')
    expect(filterIntersection('1,2', [])).toBeUndefined()
  })

  it('intersects on numbers by default and on strings on request', () => {
    expect(filterIntersection('1,2,3', [2, 3, 4])).toBe('2,3')
    expect(filterIntersection('a,b', ['b', 'c'], true, { as: 'string' })).toBe('b')
  })
})

describe('removeEmptyAttributes', () => {
  it('drops undefined, null and empty strings only', () => {
    expect(removeEmptyAttributes({ a: 1, b: undefined, c: null, d: '', e: 0, f: false })).toEqual({
      a: 1,
      e: 0,
      f: false,
    })
  })
})

describe('emailValidator', () => {
  it('accepts empty input and valid addresses', () => {
    expect(emailValidator('')).toEqual({ result: true })
    expect(emailValidator('a@b.co')).toEqual({ result: true })
  })

  it('reports the default message and an overridden one', () => {
    expect(emailValidator('nope')).toEqual({ result: false, message: DEFAULT_EMAIL_ERROR })
    expect(emailValidator('nope', 'correo no valido').message).toBe('correo no valido')
  })
})

describe('getEnumOptions', () => {
  const STATUS = { CREATED: 0, DONE: 1, CREATED_LABEL: 'CREATED' }

  it('keeps only numeric members and stringifies the label by default', () => {
    expect(getEnumOptions(STATUS)).toEqual([
      { label: '0', value: 0 },
      { label: '1', value: 1 },
    ])
  })

  it('uses the label getter and can emit string values', () => {
    const label = (value: number) => (value === 0 ? 'Created' : 'Done')
    expect(getEnumOptions(STATUS, label)).toEqual([
      { label: 'Created', value: 0 },
      { label: 'Done', value: 1 },
    ])
    expect(getEnumOptions(STATUS, undefined, { as: 'string' })).toEqual([
      { label: '0', value: '0' },
      { label: '1', value: '1' },
    ])
  })
})

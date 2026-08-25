import { describe, expect, it } from 'vitest'

import {
  addDays,
  addMonths,
  addYears,
  differenceInMilliseconds,
  differenceInMonths,
  endOfDay,
  endOfMonth,
  format,
  getDaysInMonth,
  intervalToDuration,
  isBefore,
  isValidDate,
  parseStandardTime,
  startOfDay,
  startOfHour,
  startOfMonth,
  startOfToday,
  subDays,
  subHours,
  toDate,
} from './kernel'

const REFERENCE = new Date(2026, 7, 25, 13, 5, 9, 250)

describe('format', () => {
  it('renders every supported token', () => {
    expect(format(REFERENCE, 'yyyy yy MMMM MMM MM M dd d')).toBe('2026 26 August Aug 08 8 25 25')
    expect(format(REFERENCE, 'EEEE EEE HH H hh h mm m ss s a')).toBe(
      'Tuesday Tue 13 13 01 1 05 5 09 9 PM',
    )
  })

  it('renders AM before noon and 12 for midnight', () => {
    const midnight = new Date(2026, 7, 25, 0, 0, 0)
    expect(format(midnight, 'h a')).toBe('12 AM')
  })

  it('honours quoted literals, escaped quotes and unmatched quotes', () => {
    expect(format(REFERENCE, "yyyy-MM-dd'T'HH:mm:ss'Z'")).toBe('2026-08-25T13:05:09Z')
    expect(format(REFERENCE, "''")).toBe("'")
    expect(format(REFERENCE, "dd 'unterminated")).toBe('25 unterminated')
  })

  it('passes unknown characters through', () => {
    expect(format(REFERENCE, 'dd/MM/yyyy!')).toBe('25/08/2026!')
  })

  it('accepts strings and numbers, and throws on an invalid date', () => {
    expect(format(REFERENCE.getTime(), 'yyyy')).toBe('2026')
    expect(format('2026-08-25T00:00:00', 'yyyy-MM-dd')).toBe('2026-08-25')
    expect(() => format('not-a-date', 'yyyy')).toThrow(RangeError)
  })
})

describe('toDate / isValidDate', () => {
  it('clones dates instead of aliasing them', () => {
    const copy = toDate(REFERENCE)
    expect(copy).not.toBe(REFERENCE)
    expect(copy.getTime()).toBe(REFERENCE.getTime())
    expect(isValidDate(copy)).toBe(true)
    expect(isValidDate(new Date(NaN))).toBe(false)
  })
})

describe('parseStandardTime', () => {
  it('applies the clock onto the reference day', () => {
    const parsed = parseStandardTime('07:08:09', REFERENCE)
    expect(format(parsed, 'yyyy-MM-dd HH:mm:ss')).toBe('2026-08-25 07:08:09')
    expect(parsed.getMilliseconds()).toBe(0)
  })

  it('rejects non-clock strings and out-of-range parts', () => {
    expect(isValidDate(parseStandardTime('2026-08-25T10:00:00Z', REFERENCE))).toBe(false)
    expect(isValidDate(parseStandardTime('24:00:00', REFERENCE))).toBe(false)
    expect(isValidDate(parseStandardTime('10:60:00', REFERENCE))).toBe(false)
    expect(isValidDate(parseStandardTime('10:00:60', REFERENCE))).toBe(false)
  })
})

describe('arithmetic', () => {
  it('adds days, months and years', () => {
    expect(format(addDays(REFERENCE, 7), 'yyyy-MM-dd')).toBe('2026-09-01')
    expect(format(addMonths(REFERENCE, 1), 'yyyy-MM-dd')).toBe('2026-09-25')
    expect(format(addYears(REFERENCE, -1), 'yyyy-MM-dd')).toBe('2025-08-25')
    expect(format(subDays(REFERENCE, 25), 'yyyy-MM-dd')).toBe('2026-07-31')
    expect(format(subHours(REFERENCE, 14), 'yyyy-MM-dd HH')).toBe('2026-08-24 23')
  })

  it('clamps a month addition to the last day of the target month', () => {
    expect(format(addMonths(new Date(2026, 0, 31), 1), 'yyyy-MM-dd')).toBe('2026-02-28')
  })

  it('reports days in a month, including leap February', () => {
    expect(getDaysInMonth(new Date(2026, 1, 10))).toBe(28)
    expect(getDaysInMonth(new Date(2024, 1, 10))).toBe(29)
  })

  it('computes boundaries', () => {
    expect(format(startOfMonth(REFERENCE), 'yyyy-MM-dd HH:mm:ss')).toBe('2026-08-01 00:00:00')
    expect(format(endOfMonth(REFERENCE), 'yyyy-MM-dd HH:mm:ss')).toBe('2026-08-31 23:59:59')
    expect(format(startOfDay(REFERENCE), 'HH:mm:ss')).toBe('00:00:00')
    expect(format(endOfDay(REFERENCE), 'HH:mm:ss')).toBe('23:59:59')
    expect(format(startOfHour(REFERENCE), 'HH:mm:ss')).toBe('13:00:00')
    const today = startOfToday()
    expect(today.getHours()).toBe(0)
    expect(today.toDateString()).toBe(new Date().toDateString())
  })

  it('compares and subtracts', () => {
    expect(differenceInMilliseconds(REFERENCE, addDays(REFERENCE, -1))).toBe(86_400_000)
    expect(isBefore(REFERENCE, addDays(REFERENCE, 1))).toBe(true)
    expect(isBefore(addDays(REFERENCE, 1), REFERENCE)).toBe(false)
  })
})

describe('differenceInMonths', () => {
  it('truncates toward zero in both directions', () => {
    const start = new Date(2026, 0, 15)
    expect(differenceInMonths(new Date(2026, 2, 15), start)).toBe(2)
    expect(differenceInMonths(new Date(2026, 2, 14), start)).toBe(1)
    expect(differenceInMonths(new Date(2025, 10, 15), start)).toBe(-2)
    expect(differenceInMonths(new Date(2025, 10, 16), start)).toBe(-1)
  })
})

describe('intervalToDuration', () => {
  it('breaks an interval into calendar parts', () => {
    const start = new Date(2026, 0, 1, 0, 0, 0)
    const end = new Date(2027, 2, 4, 5, 6, 7)
    expect(intervalToDuration({ start, end })).toEqual({
      years: 1,
      months: 2,
      days: 3,
      hours: 5,
      minutes: 6,
      seconds: 7,
    })
  })

  it('preserves the sign when the end precedes the start', () => {
    const start = new Date(2026, 0, 10, 12, 0, 0)
    const end = new Date(2026, 0, 10, 10, 30, 0)
    expect(intervalToDuration({ start, end })).toEqual({
      years: 0,
      months: 0,
      days: 0,
      hours: -1,
      minutes: -30,
      seconds: 0,
    })
  })
})

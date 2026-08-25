import { afterEach, describe, expect, it } from 'vitest'

import {
  buildYearOptions,
  configureDates,
  DATE_FORMAT,
  formatDateAsEndOfDayUpperCase,
  formatDurationHMS,
  formatTimerClock,
  getFormattedShiftTime,
  getFullDate,
  getFullDateByYear,
  getFullDateTime,
  getFullDateWithoutTime,
  getFullGmtTime,
  getHourDifference,
  getMonthName,
  getMonthStartAndEnd,
  getNumberOfDaysInMonth,
  getStandardTime,
  getStandardTimeWithSecond,
  getTime,
  getTimeEstimate,
  getUpperCaseDate,
  getUpperCaseDateTime,
  getWeekStartDate,
  isScheduleDayVaild,
  isScheduleDayValid,
  milliSecondsToDuration,
  MONTH_OPTIONS,
  normalizeClockString,
  parseLocalDate,
  timeDifference,
  TIMEZONE,
  UTC_TIME_FORMAT,
  YEAR_OPTIONS,
} from './index'

const DAY_MS = 86_400_000
const DATE = new Date(2026, 7, 25, 13, 5, 9)

describe('constants', () => {
  it('keeps the fleet format strings', () => {
    expect(UTC_TIME_FORMAT).toBe("yyyy-MM-dd'T'HH:mm:ss'Z'")
    expect(DATE_FORMAT).toBe('yyyy-MM-dd')
    expect(typeof TIMEZONE).toBe('string')
  })
})

describe('empty label', () => {
  // Scoped so the first assertion still sees the module's own default.
  afterEach(() => configureDates({ emptyLabel: () => 'NA' }))

  it('defaults to NA and is overridable for i18n', () => {
    expect(getFullDate(null)).toBe('NA')
    configureDates({ emptyLabel: () => 'no aplicable' })
    expect(getFullDate(null)).toBe('no aplicable')
  })

  it('is returned by every nullable formatter', () => {
    configureDates({ emptyLabel: () => '-' })
    expect([
      getUpperCaseDate(),
      getUpperCaseDateTime(),
      formatDateAsEndOfDayUpperCase(),
      getMonthName(),
      getMonthName(null),
      getFullDateTime(),
      getFullDateWithoutTime(),
      getTime(),
      getFullDate(),
      getFullGmtTime(),
      getFullDateByYear(),
      getStandardTime(),
      getStandardTimeWithSecond(),
      normalizeClockString(),
    ]).toEqual(Array(14).fill('-'))
  })
})

describe('formatters', () => {
  it('formats dates and times', () => {
    expect(getUpperCaseDate(DATE)).toBe('25-AUG-2026')
    expect(getUpperCaseDateTime(DATE)).toBe('25-AUG-2026, TUE- 1:05 PM')
    expect(getMonthName(0)).toBe('January')
    expect(getFullDateTime(DATE)).toBe('Tue, Aug 25, 2026 - 1:05 PM')
    expect(getFullDateTime(DATE, DATE_FORMAT)).toBe('2026-08-25')
    expect(getFullDateWithoutTime(DATE)).toBe('Tue, Aug 25, 2026')
    expect(getTime(DATE)).toBe('1:05 PM')
    expect(getFullDate(DATE)).toBe('2026-08-25')
    expect(getFullGmtTime(DATE)).toBe('2026-08-25 13:05:09')
    expect(getStandardTime(DATE)).toBe('13:05')
  })

  it('re-anchors a date onto another year', () => {
    expect(getFullDateByYear(DATE)).toBe('2026-08-25')
    expect(getFullDateByYear(DATE, 2030)).toBe('2030-08-25')
  })

  it('normalises clock strings', () => {
    expect(normalizeClockString('07:08:09')).toBe('07:08:09')
    expect(getStandardTimeWithSecond('07:08:09')).toBe('07:08')
  })
})

describe('parseLocalDate', () => {
  it('parses a date-only string as local midnight', () => {
    const parsed = parseLocalDate('2026-08-25')
    expect(parsed.getFullYear()).toBe(2026)
    expect(parsed.getMonth()).toBe(7)
    expect(parsed.getDate()).toBe(25)
    expect(parsed.getHours()).toBe(0)
  })

  it('backs formatDateAsEndOfDayUpperCase for both string and Date input', () => {
    expect(formatDateAsEndOfDayUpperCase('2026-08-25')).toBe('25-AUG-2026, TUE- 11:59 PM')
    expect(formatDateAsEndOfDayUpperCase(DATE)).toBe('25-AUG-2026, TUE- 11:59 PM')
  })
})

describe('differences', () => {
  it('subtracts two dates in milliseconds', () => {
    expect(timeDifference(DATE, new Date(DATE.getTime() - 1000))).toBe(1000)
  })

  it('rolls the second clock over midnight when it precedes the first', () => {
    expect(getHourDifference('08:00:00', '17:00:00')).toBe(9)
    expect(getHourDifference('22:00:00', '02:00:00')).toBe(4)
  })
})

describe('getFormattedShiftTime', () => {
  it('parses a shift clock', () => {
    expect(getFormattedShiftTime('06:30:00').getHours()).toBe(6)
  })

  it('returns now for an empty shift and throws for an unparsable one', () => {
    expect(getFormattedShiftTime('').toDateString()).toBe(new Date().toDateString())
    expect(() => getFormattedShiftTime('nope')).toThrow('Invalid date-time value')
  })
})

describe('isScheduleDayValid', () => {
  it('is exclusive of today', () => {
    expect(isScheduleDayValid(new Date(Date.now() + DAY_MS))).toBe(true)
    expect(isScheduleDayValid(new Date(Date.now() - DAY_MS))).toBe(false)
    expect(isScheduleDayValid('')).toBe(true)
    expect(isScheduleDayValid('', true)).toBe(false)
  })

  it('exposes the deprecated typo alias', () => {
    expect(isScheduleDayVaild).toBe(isScheduleDayValid)
  })
})

describe('durations', () => {
  it('breaks milliseconds into a duration', () => {
    expect(milliSecondsToDuration(3 * DAY_MS).days).toBe(3)
  })

  it('picks the largest non-zero unit', () => {
    expect(getTimeEstimate(400 * DAY_MS)).toBe('1 year Remaining')
    expect(getTimeEstimate(70 * DAY_MS)).toBe('2 months Remaining')
    expect(getTimeEstimate(45 * DAY_MS)).toBe('1 month Remaining')
    expect(getTimeEstimate(3 * DAY_MS)).toBe('3 days Remaining')
    expect(getTimeEstimate(DAY_MS)).toBe('1 day Remaining')
    expect(getTimeEstimate(-3 * DAY_MS)).toBe('3 days Delayed')
    expect(getTimeEstimate(5 * 3_600_000)).toBe('5 hrs Remaining')
    expect(getTimeEstimate(3_600_000)).toBe('1 hr Remaining')
    expect(getTimeEstimate(120_000)).toBe('2 mins Remaining')
    expect(getTimeEstimate(60_000)).toBe('1 min Remaining')
    expect(getTimeEstimate(-800 * DAY_MS, 'left', 'late')).toBe('2 years late')
  })

  it('falls back to the empty label under a minute', () => {
    expect(getTimeEstimate(30_000)).toBe('NA')
  })

  it('ships both the labelled and the stopwatch format, floored', () => {
    expect(formatDurationHMS(3723)).toBe('01h 02m 03s')
    expect(formatTimerClock(3723)).toBe('01:02:03')
    expect(formatTimerClock(3.5)).toBe('00:00:03')
  })
})

describe('calendar options', () => {
  it('starts the requested week of the requested year', () => {
    expect(getFullDate(getWeekStartDate(1, 2026))).toBe('2026-01-01')
    expect(getFullDate(getWeekStartDate(2, 2026))).toBe('2026-01-08')
    expect(getWeekStartDate(1).getFullYear()).toBe(new Date().getFullYear())
  })

  it('counts days in a month without rolling over', () => {
    expect(getNumberOfDaysInMonth(1, 2026)).toBe(28)
    expect(getNumberOfDaysInMonth(1, 2024)).toBe(29)
    expect(getNumberOfDaysInMonth(0)).toBe(31)
    expect(getNumberOfDaysInMonth()).toBe(
      new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate(),
    )
  })

  it('builds year options around a reference year', () => {
    const options = buildYearOptions({ span: 3, lookAhead: 1, now: new Date(2026, 0, 1) })
    expect(options).toEqual([
      { label: '2027', value: '2027' },
      { label: '2026', value: '2026' },
      { label: '2025', value: '2025' },
    ])
    expect(YEAR_OPTIONS).toHaveLength(100)
    expect(YEAR_OPTIONS[0]?.value).toBe(String(new Date().getFullYear() + 15))
  })

  it('labels months from a fixed epoch year', () => {
    expect(MONTH_OPTIONS[0]).toEqual({ label: 'January', value: '0' })
    expect(MONTH_OPTIONS[11]).toEqual({ label: 'December', value: '11' })
  })

  it('brackets a MM/yyyy string', () => {
    expect(getMonthStartAndEnd('02/2026')).toEqual({
      startOfMonth: '2026-02-01',
      endOfMonth: '2026-02-28',
    })
    expect(getMonthStartAndEnd('02/2026', 'dd-MMM-yyyy').endOfMonth).toBe('28-Feb-2026')
  })
})

import type { DateArg, Duration } from './kernel'
import {
  addDays,
  addYears,
  differenceInMilliseconds,
  endOfMonth,
  format,
  getDaysInMonth,
  intervalToDuration,
  isBefore,
  isValidDate,
  parseStandardTime,
  startOfMonth,
  startOfToday,
} from './kernel'

export type { DateArg, Duration }
export { addDays, format, intervalToDuration } from './kernel'

export const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone
export const UTC_TIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss'Z'"
export const FULL_DATE_TIME_FORMAT = 'EEE, MMM d, yyyy - h:mm a'
export const FULL_DATE_FORMAT = 'EEE, MMM d, yyyy'
export const FULL_DATE_FORMAT_EXPANDED_MONTH = 'EEE, MMMM d, yyyy'
export const FULL_DATE_WITHOUT_WEEK_FORMAT = 'MMM d, yyyy'
export const DATE_FORMAT = 'yyyy-MM-dd'
export const TIME_FORMAT = 'h:mm a'
export const GMT_FORMAT = 'yyyy-MM-dd HH:mm:ss'
export const STANDARD_TIME_FORMAT = 'HH:mm:ss'
export const STANDARD_TIME_FORMAT_WITHOUT_SECONDS = 'HH:mm'
export const UPPERCASE_DATE_FORMAT = 'dd-MMM-yyyy'
export const UPPERCASE_DATE_TIME_FORMAT = 'dd-MMM-yyyy, EEE- h:mm a'

let emptyLabel = () => 'NA'

/** Apps wire this to `() => t('na')`; the core cannot reach i18n and must stay RN-safe. */
export function configureDates(config: { emptyLabel: () => string }) {
  emptyLabel = config.emptyLabel
}

/** `new Date('2026-08-25')` is UTC midnight while `new Date('2026/08/25')` is local midnight. */
export function parseLocalDate(dateOnly: string): Date {
  return new Date(dateOnly.replace(/-/g, '/'))
}

export function getUpperCaseDate(date?: string | Date | null): string {
  if (!date) return emptyLabel()
  return format(date, UPPERCASE_DATE_FORMAT).toUpperCase()
}

export function getUpperCaseDateTime(date?: string | Date | null): string {
  if (!date) return emptyLabel()
  return format(date, UPPERCASE_DATE_TIME_FORMAT).toUpperCase()
}

export function formatDateAsEndOfDayUpperCase(date?: string | Date | null): string {
  if (!date) return emptyLabel()
  const dateObj = typeof date === 'string' ? parseLocalDate(date) : new Date(date)
  dateObj.setHours(23, 59, 0, 0)
  return format(dateObj, UPPERCASE_DATE_TIME_FORMAT).toUpperCase()
}

export function getMonthName(month?: number | null): string {
  if (month === undefined || month === null) return emptyLabel()
  return format(new Date(0, month, 1), 'MMMM')
}

export function getFullDateTime(
  date?: string | Date | null,
  formatString = FULL_DATE_TIME_FORMAT,
): string {
  if (!date) return emptyLabel()
  return format(date, formatString)
}

export function getFullDateWithoutTime(date?: string | Date | null): string {
  if (!date) return emptyLabel()
  return format(date, FULL_DATE_FORMAT)
}

export function getTime(date?: string | Date | null): string {
  if (!date) return emptyLabel()
  return format(date, TIME_FORMAT)
}

export function getFullDate(date?: string | Date | null): string {
  if (!date) return emptyLabel()
  return format(date, DATE_FORMAT)
}

export function getFullGmtTime(date?: string | Date | null): string {
  if (!date) return emptyLabel()
  return format(date, GMT_FORMAT)
}

export function getFullDateByYear(date?: string | Date | null, selectedYear?: number): string {
  if (!date) return emptyLabel()
  return selectedYear
    ? format(addYears(date, selectedYear - new Date(date).getFullYear()), DATE_FORMAT)
    : format(date, DATE_FORMAT)
}

export function getStandardTime(date?: string | Date | null): string {
  if (!date) return emptyLabel()
  return format(date, STANDARD_TIME_FORMAT_WITHOUT_SECONDS)
}

/** Re-emits an `HH:mm:ss` string; unlike getStandardTime it rejects anything that is not a clock string. */
export function normalizeClockString(time?: string | null): string {
  if (!time) return emptyLabel()
  return format(parseStandardTime(time, new Date()), STANDARD_TIME_FORMAT)
}

export function getStandardTimeWithSecond(date?: string | Date | null): string {
  if (!date) return emptyLabel()
  return format(parseStandardTime(String(date), new Date()), STANDARD_TIME_FORMAT_WITHOUT_SECONDS)
}

export function timeDifference(date1: string | Date, date2: string | Date): number {
  return differenceInMilliseconds(date1, date2)
}

export function getHourDifference(time1: string, time2: string): number {
  const date1 = parseStandardTime(time1, new Date())
  const date2 = parseStandardTime(time2, new Date())
  if (date2 < date1) {
    date2.setDate(date2.getDate() + 1)
  }
  return Math.round(differenceInMilliseconds(date2, date1) / (1000 * 60 * 60))
}

export function getFormattedShiftTime(shift: string): Date {
  if (shift) {
    const dateTime = parseStandardTime(shift, new Date())
    if (!isValidDate(dateTime)) {
      throw new Error('Invalid date-time value')
    }
    return dateTime
  }
  return new Date()
}

export function isScheduleDayValid(date: string | Date, required?: boolean): boolean {
  if (!date && !required) return true
  return isBefore(startOfToday(), new Date(date))
}

/** @deprecated Typo alias — use isScheduleDayValid instead. */
export const isScheduleDayVaild = isScheduleDayValid

export function milliSecondsToDuration(milliSeconds: number): Duration {
  return intervalToDuration({ start: new Date(0), end: new Date(milliSeconds) })
}

export function getTimeEstimate(
  milliseconds: number,
  remainingText: string = 'Remaining',
  delayedText: string = 'Delayed',
): string {
  const text = milliseconds > 0 ? remainingText : delayedText
  const duration = milliSecondsToDuration(milliseconds)
  const years = Math.abs(duration.years)
  const months = Math.abs(duration.months)
  const days = Math.abs(duration.days)
  const hours = Math.abs(duration.hours)
  const minutes = Math.abs(duration.minutes)

  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ${text}`
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ${text}`
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ${text}`
  if (hours > 0) return `${hours} hr${hours > 1 ? 's' : ''} ${text}`
  return minutes ? `${minutes} min${minutes > 1 ? 's' : ''} ${text}` : emptyLabel()
}

export function getWeekStartDate(week: number, year?: number): Date {
  return addDays(new Date(year || new Date().getFullYear(), 0, 1), (week - 1) * 7)
}

/** Labelled duration for web tables, e.g. "01h 02m 03s". */
export function formatDurationHMS(seconds: number): string {
  const { hours, minutes, secs } = splitSeconds(seconds)
  return `${hours}h ${minutes}m ${secs}s`
}

/** Stopwatch clock for mobile, e.g. "01:02:03". */
export function formatTimerClock(seconds: number): string {
  const { hours, minutes, secs } = splitSeconds(seconds)
  return `${hours}:${minutes}:${secs}`
}

function splitSeconds(seconds: number) {
  return {
    hours: String(Math.floor(seconds / 3600)).padStart(2, '0'),
    minutes: String(Math.floor((seconds % 3600) / 60)).padStart(2, '0'),
    secs: String(Math.floor(seconds % 60)).padStart(2, '0'),
  }
}

export function getNumberOfDaysInMonth(month?: number, year?: number): number {
  const date = new Date()
  // setDate(1) first, otherwise setMonth on the 31st rolls into the next month.
  date.setDate(1)
  if (month !== undefined) date.setMonth(month)
  if (year !== undefined) date.setFullYear(year)
  return getDaysInMonth(date)
}

export type SelectOption = { label: string; value: string }

export function buildYearOptions(options?: {
  span?: number
  lookAhead?: number
  now?: Date
}): SelectOption[] {
  const { span = 100, lookAhead = 15, now = new Date() } = options ?? {}
  return Array.from(Array(span).keys()).map((y) => {
    const year = String(now.getFullYear() - y + lookAhead)
    return { label: year, value: year }
  })
}

export const YEAR_OPTIONS = buildYearOptions()

// Fixed epoch year: deriving labels from today rolls over on the 31st.
export const MONTH_OPTIONS: SelectOption[] = Array.from(Array(12).keys()).map((m) => ({
  label: format(new Date(2000, m, 1), 'MMMM'),
  value: String(m),
}))

export function getMonthStartAndEnd(monthYear: string, dateFormat = DATE_FORMAT) {
  const [month, year] = monthYear.split('/')
  const reference = new Date(Number(year), Number(month) - 1)
  return {
    startOfMonth: format(startOfMonth(reference), dateFormat),
    endOfMonth: format(endOfMonth(reference), dateFormat),
  }
}

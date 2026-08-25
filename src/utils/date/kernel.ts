// Minimal date-fns-shaped primitives; the package ships zero runtime deps, so date-fns cannot be imported.

export type DateArg = Date | number | string

export type Duration = {
  years: number
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const MS_DAY = 86_400_000
const MS_HOUR = 3_600_000
const MS_MINUTE = 60_000

const pad = (value: number, length = 2) => String(value).padStart(length, '0')

const hour12 = (date: Date) => date.getHours() % 12 || 12

const FORMATTERS: Record<string, (date: Date) => string> = {
  yyyy: (d) => pad(d.getFullYear(), 4),
  yy: (d) => pad(d.getFullYear() % 100),
  MMMM: (d) => MONTH_NAMES[d.getMonth()] as string,
  MMM: (d) => (MONTH_NAMES[d.getMonth()] as string).slice(0, 3),
  MM: (d) => pad(d.getMonth() + 1),
  M: (d) => String(d.getMonth() + 1),
  dd: (d) => pad(d.getDate()),
  d: (d) => String(d.getDate()),
  EEEE: (d) => DAY_NAMES[d.getDay()] as string,
  EEE: (d) => (DAY_NAMES[d.getDay()] as string).slice(0, 3),
  HH: (d) => pad(d.getHours()),
  H: (d) => String(d.getHours()),
  hh: (d) => pad(hour12(d)),
  h: (d) => String(hour12(d)),
  mm: (d) => pad(d.getMinutes()),
  m: (d) => String(d.getMinutes()),
  ss: (d) => pad(d.getSeconds()),
  s: (d) => String(d.getSeconds()),
  a: (d) => (d.getHours() < 12 ? 'AM' : 'PM'),
}

const TOKEN_LENGTHS = [4, 3, 2, 1]

export const toDate = (value: DateArg): Date =>
  value instanceof Date ? new Date(value) : new Date(value)

export const isValidDate = (date: Date): boolean => !Number.isNaN(date.getTime())

/** Formats with the date-fns token subset the fleet's format constants use; `'…'` quotes literals. */
export function format(value: DateArg, pattern: string): string {
  const date = toDate(value)
  if (!isValidDate(date)) throw new RangeError('Invalid time value')

  let out = ''
  let index = 0
  while (index < pattern.length) {
    const char = pattern[index] as string
    if (char === "'") {
      const end = pattern.indexOf("'", index + 1)
      if (end === -1) {
        out += pattern.slice(index + 1)
        break
      }
      out += end === index + 1 ? "'" : pattern.slice(index + 1, end)
      index = end + 1
      continue
    }
    const length = TOKEN_LENGTHS.find((n) => FORMATTERS[pattern.slice(index, index + n)])
    if (length) {
      out += (FORMATTERS[pattern.slice(index, index + length)] as (d: Date) => string)(date)
      index += length
      continue
    }
    out += char
    index += 1
  }
  return out
}

/** date-fns `parse(value, 'HH:mm:ss', reference)`: reference day with the parsed clock, else Invalid Date. */
export function parseStandardTime(value: string, reference: Date): Date {
  const match = /^(\d{1,2}):(\d{1,2}):(\d{1,2})$/.exec(value)
  if (!match) return new Date(NaN)
  const [hours, minutes, seconds] = match.slice(1).map(Number) as [number, number, number]
  if (hours > 23 || minutes > 59 || seconds > 59) return new Date(NaN)
  const date = new Date(reference)
  date.setHours(hours, minutes, seconds, 0)
  return date
}

export function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

export function addDays(value: DateArg, amount: number): Date {
  const date = toDate(value)
  date.setDate(date.getDate() + amount)
  return date
}

/** Clamps to the last day of the target month, matching date-fns. */
export function addMonths(value: DateArg, amount: number): Date {
  const date = toDate(value)
  const day = date.getDate()
  date.setDate(1)
  date.setMonth(date.getMonth() + amount)
  date.setDate(Math.min(day, getDaysInMonth(date)))
  return date
}

export const addYears = (value: DateArg, amount: number): Date => addMonths(value, amount * 12)

export function startOfToday(): Date {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

export const startOfMonth = (value: DateArg): Date => {
  const date = toDate(value)
  date.setDate(1)
  date.setHours(0, 0, 0, 0)
  return date
}

export const endOfMonth = (value: DateArg): Date => {
  const date = toDate(value)
  date.setDate(getDaysInMonth(date))
  date.setHours(23, 59, 59, 999)
  return date
}

export const startOfDay = (value: DateArg): Date => {
  const date = toDate(value)
  date.setHours(0, 0, 0, 0)
  return date
}

export const endOfDay = (value: DateArg): Date => {
  const date = toDate(value)
  date.setHours(23, 59, 59, 999)
  return date
}

export const startOfHour = (value: DateArg): Date => {
  const date = toDate(value)
  date.setMinutes(0, 0, 0)
  return date
}

export const subHours = (value: DateArg, amount: number): Date =>
  new Date(toDate(value).getTime() - amount * MS_HOUR)

export const subDays = (value: DateArg, amount: number): Date => addDays(value, -amount)

export const differenceInMilliseconds = (a: DateArg, b: DateArg): number =>
  toDate(a).getTime() - toDate(b).getTime()

export const isBefore = (a: DateArg, b: DateArg): boolean =>
  toDate(a).getTime() < toDate(b).getTime()

/** Whole calendar months between two dates, truncated toward zero. */
export function differenceInMonths(end: Date, start: Date): number {
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  const anchor = addMonths(start, months)
  if (months > 0 && anchor.getTime() > end.getTime()) months -= 1
  if (months < 0 && anchor.getTime() < end.getTime()) months += 1
  return months
}

/** Calendar breakdown of an interval, sign-preserving, as date-fns `intervalToDuration` returns it. */
export function intervalToDuration(interval: { start: DateArg; end: DateArg }): Duration {
  const start = toDate(interval.start)
  const end = toDate(interval.end)
  const totalMonths = differenceInMonths(end, start)
  const anchor = addMonths(start, totalMonths)

  // `|| 0` collapses the -0 that Math.trunc yields for small negative remainders.
  const trunc = (value: number) => Math.trunc(value) || 0

  const years = trunc(totalMonths / 12)
  const months = totalMonths - years * 12

  let rest = end.getTime() - anchor.getTime()
  const days = trunc(rest / MS_DAY)
  rest -= days * MS_DAY
  const hours = trunc(rest / MS_HOUR)
  rest -= hours * MS_HOUR
  const minutes = trunc(rest / MS_MINUTE)
  rest -= minutes * MS_MINUTE
  return { years, months, days, hours, minutes, seconds: trunc(rest / 1000) }
}

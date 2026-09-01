import {
  endOfDay,
  startOfDay,
  startOfHour,
  startOfMonth,
  subDays,
  subHours,
} from 'netix-frontend/utils'
import { useEffect } from 'react'

import type { SearchParamsBinding } from './search-params'

export type EpochRange = {
  from: number | undefined
  to: number | undefined
}

/** Structurally react-day-picker's DateRange, without taking the dependency. */
export type DateRange = {
  from: Date | undefined
  to?: Date | undefined
}

/** Fixed epoch for "Overall" start: 2022-01-01 00:00:00 UTC. */
export const OVERALL_FROM_EPOCH = 1640995200

export const TIME_DURATIONS = {
  LAST_30_DAYS: 720,
  LAST_6_MONTHS: 4320,
  LAST_1_YEAR: 8760,
  SIX_HOURS: 6,
  TWELVE_HOURS: 12,
  TWENTY_FOUR_HOURS: 24,
  SEVEN_DAYS: 168,
  OVERALL: -1,
}

export const DURATION_OPTIONS = [
  { value: String(TIME_DURATIONS.SIX_HOURS), label: 'Last 6 Hours', labelKey: 'last_6_hours' },
  { value: String(TIME_DURATIONS.TWELVE_HOURS), label: 'Last 12 Hours', labelKey: 'last_12_hours' },
  {
    value: String(TIME_DURATIONS.TWENTY_FOUR_HOURS),
    label: 'Last 24 Hours',
    labelKey: 'last_24_hours',
  },
  { value: String(TIME_DURATIONS.SEVEN_DAYS), label: 'Last 7 Days', labelKey: 'last_7_days' },
  { value: String(TIME_DURATIONS.LAST_30_DAYS), label: 'Last 30 Days', labelKey: 'last_30_days' },
  {
    value: String(TIME_DURATIONS.LAST_6_MONTHS),
    label: 'Last 6 Months',
    labelKey: 'last_6_months',
  },
  { value: String(TIME_DURATIONS.LAST_1_YEAR), label: 'Last 1 Year', labelKey: 'last_1_year' },
  { value: String(TIME_DURATIONS.OVERALL), label: 'Overall', labelKey: 'overall' },
]

export function getDuration(from?: number | string | null, to?: number | string | null): number {
  if (from == null || from === '' || to == null || to === '') return 0
  const start = Number(from)
  const end = Number(to)
  if (isNaN(start) || isNaN(end)) return 0
  return Math.round(Math.abs(end - start) / 3600)
}

export function getEpochfromDuration(hrs: number, anchor = false, referenceDate = new Date()) {
  const to = anchor ? startOfHour(referenceDate) : referenceDate
  return { from: subHours(to, hrs), to }
}

export function getCurrentMonthEpochRange(referenceDate = new Date()): EpochRange {
  return {
    from: Math.floor(startOfMonth(referenceDate).getTime() / 1000),
    to: Math.floor(startOfHour(referenceDate).getTime() / 1000),
  }
}

export function getYesterdayEpochRange(referenceDate = new Date()) {
  const yesterday = subDays(referenceDate, 1)
  return { from: startOfDay(yesterday), to: endOfDay(yesterday) }
}

export function getLastDaysEpochRange(days: number, referenceDate = new Date()) {
  return {
    from: startOfDay(subDays(referenceDate, days)),
    to: endOfDay(subDays(referenceDate, 1)),
  }
}

export function getQuickDurationRange(hrs: number, referenceDate = new Date()) {
  switch (hrs) {
    case 24:
      return getYesterdayEpochRange(referenceDate)
    case 168:
      return getLastDaysEpochRange(7, referenceDate)
    default:
      return getEpochfromDuration(hrs, true, referenceDate)
  }
}

export function getFullDayRange(range?: DateRange): DateRange | undefined {
  if (!range?.from) return range
  return { from: startOfDay(range.from), to: endOfDay(range.to ?? range.from) }
}

export function getEpochRange(range?: EpochRange | DateRange): EpochRange {
  let rangeFrom = range?.from
  let rangeTo = range?.to
  if (rangeFrom instanceof Date) rangeFrom = ~~(rangeFrom.getTime() / 1000)
  if (rangeTo instanceof Date) rangeTo = ~~(rangeTo.getTime() / 1000)
  return { from: rangeFrom, to: rangeTo }
}

export function getDateRange(range?: EpochRange | DateRange): DateRange {
  const rangeFrom =
    range?.from instanceof Date
      ? range.from
      : range?.from != null
        ? new Date(Number(range.from) * 1000)
        : new Date()
  let rangeTo =
    range?.to instanceof Date
      ? range.to
      : range?.to != null
        ? new Date(Number(range.to) * 1000)
        : new Date()

  // An epoch end that lands exactly on local midnight came from an exclusive day boundary.
  if (!(range?.to instanceof Date)) {
    const isExclusiveDayBoundaryEnd =
      rangeTo.getTime() > rangeFrom.getTime() &&
      rangeTo.getHours() === 0 &&
      rangeTo.getMinutes() === 0 &&
      rangeTo.getSeconds() === 0 &&
      rangeTo.getMilliseconds() === 0
    if (isExclusiveDayBoundaryEnd) {
      rangeTo = subDays(rangeTo, 1)
    }
  }

  return { from: rangeFrom, to: rangeTo }
}

export type TimeRangeOptions = { enabled?: boolean }

export function useTimeRange(
  binding: SearchParamsBinding,
  defaultRange?: EpochRange,
  options?: TimeRangeOptions,
) {
  const [params, setParams] = binding
  const enabled = options?.enabled ?? true
  const hasDateFrom = params.has('from')
  const hasDateTo = params.has('to')
  const from = params.get('from')
  const to = params.get('to')

  useEffect(() => {
    if (!enabled || (hasDateFrom && hasDateTo)) return

    const defaultEpoch = getEpochRange(getEpochfromDuration(12, true))
    const next = new URLSearchParams(params)
    next.set('from', defaultRange?.from?.toString() ?? String(defaultEpoch.from))
    next.set('to', defaultRange?.to?.toString() ?? String(defaultEpoch.to))
    setParams(next, { replace: true })
    // Re-running on every params identity would fight the write above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultRange?.from, defaultRange?.to, enabled, hasDateFrom, hasDateTo])

  function updateTimeRange(range: EpochRange | DateRange) {
    const epochRange = getEpochRange(range)
    const next = new URLSearchParams(params)
    if (epochRange.from) next.set('from', String(epochRange.from))
    if (epochRange.to) next.set('to', String(epochRange.to))
    setParams(next, { replace: true })
  }

  function updateTimeDuration(hrs: number) {
    updateTimeRange(getEpochfromDuration(hrs))
  }

  return {
    epoch: { from: Number(from) || undefined, to: Number(to) || undefined },
    duration: getDuration(from, to),
    updateTimeRange,
    updateTimeDuration,
  }
}

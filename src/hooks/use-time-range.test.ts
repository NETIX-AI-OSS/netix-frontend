import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useTestSearchParams } from './search-params.testing'
import {
  DURATION_OPTIONS,
  getCurrentMonthEpochRange,
  getDateRange,
  getDuration,
  getEpochfromDuration,
  getEpochRange,
  getFullDayRange,
  getLastDaysEpochRange,
  getQuickDurationRange,
  getYesterdayEpochRange,
  OVERALL_FROM_EPOCH,
  TIME_DURATIONS,
  type TimeRangeOptions,
  useTimeRange,
} from './use-time-range'

const REFERENCE = new Date(2026, 7, 25, 13, 40, 0)
const epoch = (date: Date) => Math.floor(date.getTime() / 1000)

const setup = (
  initial = '',
  defaultRange?: { from?: number; to?: number },
  options?: TimeRangeOptions,
) =>
  renderHook(() => {
    const binding = useTestSearchParams(initial)
    return {
      binding,
      ...useTimeRange(
        binding,
        defaultRange ? { from: defaultRange.from, to: defaultRange.to } : undefined,
        options,
      ),
    }
  })

describe('constants', () => {
  it('carries the cafm duration ladder', () => {
    expect(OVERALL_FROM_EPOCH).toBe(1640995200)
    expect(TIME_DURATIONS.SEVEN_DAYS).toBe(168)
    expect(DURATION_OPTIONS).toHaveLength(8)
  })
})

describe('getDuration', () => {
  it('rounds the span to hours and ignores unusable input', () => {
    expect(getDuration(0, 7200)).toBe(2)
    expect(getDuration(7200, 0)).toBe(2)
    expect(getDuration(null, 1)).toBe(0)
    expect(getDuration(1, null)).toBe(0)
    expect(getDuration('', 1)).toBe(0)
    expect(getDuration(1, '')).toBe(0)
    expect(getDuration('x', 1)).toBe(0)
    expect(getDuration(1, 'x')).toBe(0)
  })
})

describe('range helpers', () => {
  it('anchors a duration to the top of the hour on request', () => {
    expect(getEpochfromDuration(2, true, REFERENCE).to.getMinutes()).toBe(0)
    expect(getEpochfromDuration(2, false, REFERENCE).to.getMinutes()).toBe(40)
    expect(getEpochfromDuration(2, true, REFERENCE).from.getHours()).toBe(11)
  })

  it('brackets the current month and yesterday', () => {
    expect(getCurrentMonthEpochRange(REFERENCE)).toEqual({
      from: epoch(new Date(2026, 7, 1)),
      to: epoch(new Date(2026, 7, 25, 13, 0, 0)),
    })
    expect(getYesterdayEpochRange(REFERENCE).from.getDate()).toBe(24)
    expect(getLastDaysEpochRange(7, REFERENCE).from.getDate()).toBe(18)
  })

  it('maps the quick durations', () => {
    expect(getQuickDurationRange(24, REFERENCE).from.getDate()).toBe(24)
    expect(getQuickDurationRange(168, REFERENCE).from.getDate()).toBe(18)
    expect(getQuickDurationRange(6, REFERENCE).from.getHours()).toBe(7)
  })

  it('expands a picker range to whole days', () => {
    expect(getFullDayRange()).toBeUndefined()
    const single = getFullDayRange({ from: REFERENCE })
    expect(single?.from?.getHours()).toBe(0)
    expect(single?.to?.getDate()).toBe(25)
    expect(getFullDayRange({ from: REFERENCE, to: new Date(2026, 7, 26) })?.to?.getDate()).toBe(26)
  })

  it('converts between epochs and dates', () => {
    expect(getEpochRange({ from: 1, to: 2 })).toEqual({ from: 1, to: 2 })
    expect(getEpochRange({ from: REFERENCE, to: REFERENCE })).toEqual({
      from: epoch(REFERENCE),
      to: epoch(REFERENCE),
    })
    expect(getEpochRange()).toEqual({ from: undefined, to: undefined })
  })

  it('pulls an exclusive midnight end back onto the previous day', () => {
    const from = epoch(new Date(2026, 7, 20))
    const to = epoch(new Date(2026, 7, 26))
    expect(getDateRange({ from, to }).to?.getDate()).toBe(25)
    expect(getDateRange({ from, to: epoch(REFERENCE) }).to?.getDate()).toBe(25)
    expect(getDateRange({ from: REFERENCE, to: new Date(2026, 7, 26) }).to?.getDate()).toBe(26)
    expect(getDateRange().from?.toDateString()).toBe(new Date().toDateString())
  })
})

describe('useTimeRange', () => {
  it('seeds the last twelve hours when the params are missing', () => {
    const { result } = setup()
    const params = result.current.binding[0]
    expect(params.has('from')).toBe(true)
    expect(result.current.duration).toBe(12)
  })

  it('seeds from the supplied default range', () => {
    const { result } = setup('', { from: 100, to: 7300 })
    expect(result.current.epoch).toEqual({ from: 100, to: 7300 })
    expect(result.current.duration).toBe(2)
  })

  it('writes nothing while disabled', () => {
    const { result } = setup('', undefined, { enabled: false })
    expect(result.current.binding[0].has('from')).toBe(false)
    expect(result.current.epoch).toEqual({ from: undefined, to: undefined })
  })

  it('updates the range and the duration', () => {
    const { result } = setup('from=100&to=200')

    act(() => result.current.updateTimeRange({ from: 1000, to: 8200 }))
    expect(result.current.epoch).toEqual({ from: 1000, to: 8200 })

    act(() => result.current.updateTimeRange({ from: undefined, to: undefined }))
    expect(result.current.epoch).toEqual({ from: 1000, to: 8200 })

    act(() => result.current.updateTimeDuration(6))
    expect(result.current.duration).toBe(6)
  })
})

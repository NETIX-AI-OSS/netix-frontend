import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useTestSearchParams } from './search-params.testing'
import { type FiltersOptions, useFilters } from './use-filters'

const setup = (initial = '', options?: FiltersOptions) =>
  renderHook(() => {
    const binding = useTestSearchParams(initial)
    return { binding, ...useFilters(binding, options) }
  })

const encoded = (value: object) => `filters=${encodeURIComponent(JSON.stringify(value))}`

describe('useFilters', () => {
  it('parses the filters param', () => {
    const { result } = setup(encoded({ status: 2 }))
    expect(result.current.raw).toEqual({ status: 2 })
    expect(result.current.isLoading).toBe(false)
  })

  it('keeps going when the param is not JSON', () => {
    const { result } = setup('filters=%7Bbroken')
    expect(result.current.raw).toBeUndefined()
  })

  it('writes filters and resets the page index', () => {
    const { result } = setup('pageIndex=4')

    act(() => result.current.updateFilters({ status: 1 }))

    expect(result.current.binding[0].get('filters')).toBe('{"status":1}')
    expect(result.current.binding[0].get('pageIndex')).toBe('0')
  })

  it('removes the param when every value is empty', () => {
    const { result } = setup(encoded({ status: 1 }))

    act(() => result.current.updateFilters({ status: '' }))

    expect(result.current.binding[0].has('filters')).toBe(false)
    expect(result.current.raw).toBeUndefined()
  })

  it('accepts an updater function', () => {
    const { result } = setup(encoded({ status: 1 }))
    act(() => result.current.updateFilters((previous) => ({ ...previous, kind: 2 })))
    expect(result.current.raw).toEqual({ status: 1, kind: 2 })
  })

  it('namespaces the param and leaves pageIndex alone under a filterKey', () => {
    const { result } = setup('pageIndex=4', { filterKey: 'tableFilters' })

    act(() => result.current.updateFilters({ status: 1 }))

    expect(result.current.binding[0].get('tableFilters')).toBe('{"status":1}')
    expect(result.current.binding[0].get('pageIndex')).toBe('4')
  })

  it('formats created_on__lte, shifting a day only when the bound is exclusive', () => {
    const value = new Date(2026, 7, 25).toISOString()
    expect(setup(encoded({ created_on__lte: value })).result.current.filters).toEqual({
      created_on__lte: '2026-08-25',
    })
    expect(
      setup(encoded({ created_on__lte: value }), { inclusiveEndDate: true }).result.current.filters,
    ).toEqual({ created_on__lte: '2026-08-26' })
  })

  it('leaves created_on__lte undefined when unset', () => {
    expect(setup(encoded({ status: 1 })).result.current.filters).toEqual({
      status: 1,
      created_on__lte: undefined,
    })
  })
})

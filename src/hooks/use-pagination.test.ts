import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useTestSearchParams } from './search-params.testing'
import { usePagination } from './use-pagination'

const setup = (initial = '', options?: { pageIndex?: number; pageSize?: number }) =>
  renderHook(() => {
    const binding = useTestSearchParams(initial)
    return { binding, ...usePagination(binding, options) }
  })

describe('usePagination', () => {
  it('falls back to the given defaults', () => {
    const { result } = setup('', { pageIndex: 2, pageSize: 25 })
    expect(result.current.pagination).toEqual({ pageIndex: 2, pageSize: 25 })
  })

  it('uses 0/50 when nothing is provided', () => {
    const { result } = renderHook(() => usePagination(useTestSearchParams()))
    expect(result.current.pagination).toEqual({ pageIndex: 0, pageSize: 50 })
  })

  it('reads the params when present', () => {
    const { result } = setup('pageIndex=3&pageSize=10')
    expect(result.current.pagination).toEqual({ pageIndex: 3, pageSize: 10 })
  })

  it('writes a plain value without mutating the router params', () => {
    const { result } = setup()
    const before = result.current.binding[0]

    act(() => result.current.updatePagination({ pageIndex: 1, pageSize: 20 }))

    expect(before.get('pageIndex')).toBeNull()
    expect(result.current.binding[0].get('pageIndex')).toBe('1')
    expect(result.current.pagination).toEqual({ pageIndex: 1, pageSize: 20 })
  })

  it('accepts an updater function', () => {
    const { result } = setup('pageIndex=1&pageSize=10')

    act(() => result.current.updatePagination((p) => ({ ...p, pageIndex: p.pageIndex + 1 })))

    expect(result.current.pagination).toEqual({ pageIndex: 2, pageSize: 10 })
    expect(result.current.binding[0].get('pageIndex')).toBe('2')
  })
})

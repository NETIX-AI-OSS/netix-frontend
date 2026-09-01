import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, useSearchParams } from 'react-router'
import { describe, expect, it } from 'vitest'

import {
  useRouterFilters,
  useRouterPagination,
  useRouterTabs,
  useRouterTimeRange,
} from './router-hooks'

const wrapper =
  (entry: string) =>
  ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[entry]}>{children}</MemoryRouter>
  )

describe('router-bound hooks', () => {
  it('reads and writes the location search', () => {
    const { result } = renderHook(() => ({ tabs: useRouterTabs(), params: useSearchParams()[0] }), {
      wrapper: wrapper('/?tab=open'),
    })
    expect(result.current.tabs.tab).toBe('open')

    act(() => result.current.tabs.updateTab('closed'))
    expect(result.current.params.get('tab')).toBe('closed')
  })

  it('binds pagination, filters and the time range', () => {
    const { result } = renderHook(
      () => ({
        pagination: useRouterPagination({ pageSize: 10 }),
        filters: useRouterFilters(),
        timeRange: useRouterTimeRange({ from: 100, to: 7300 }),
      }),
      { wrapper: wrapper('/?pageIndex=2&filters=%7B%22status%22%3A1%7D') },
    )

    expect(result.current.pagination.pagination).toEqual({ pageIndex: 2, pageSize: 10 })
    expect(result.current.filters.raw).toEqual({ status: 1 })
    expect(result.current.timeRange.epoch).toEqual({ from: 100, to: 7300 })
  })
})

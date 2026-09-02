import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useUrlPagination } from './use-url-pagination'

const setup = (initial = '') =>
  renderHook(() => {
    const [params, setParams] = (() => {
      const [value, setValue] = useState(new URLSearchParams(initial))
      return [value, (next: URLSearchParams) => setValue(next)] as const
    })()
    return { params, ...useUrlPagination([params, setParams]) }
  })

// Kept local so the production hook has no router or testing dependency.
import { useState } from 'react'

describe('useUrlPagination', () => {
  it('uses defaults and reads valid URL values', () => {
    expect(setup().result.current.pagination).toEqual({ pageIndex: 0, pageSize: 10 })
    expect(setup('pageIndex=2&pageSize=50').result.current.pagination).toEqual({
      pageIndex: 2,
      pageSize: 50,
    })
  })

  it('falls back for invalid values and writes updater changes', () => {
    const { result } = setup('pageIndex=-1&pageSize=bad')
    expect(result.current.pagination).toEqual({ pageIndex: 0, pageSize: 10 })

    act(() => result.current.updatePagination((current) => ({ ...current, pageIndex: 3 })))
    expect(result.current.pagination).toEqual({ pageIndex: 3, pageSize: 10 })
    expect(result.current.params.get('pageIndex')).toBe('3')

    expect(setup('pageSize=0').result.current.pagination.pageSize).toBe(10)
  })
})

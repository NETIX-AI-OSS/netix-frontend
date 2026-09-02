import { act, renderHook } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'

import { useUrlTab } from './use-url-tab'

const setup = (initial = '') =>
  renderHook(() => {
    const [params, setParams] = useState(new URLSearchParams(initial))
    return { params, ...useUrlTab([params, setParams]) }
  })

describe('useUrlTab', () => {
  it('reads, writes and clears the tab', () => {
    const { result } = setup('tab=overview')
    expect(result.current.tab).toBe('overview')

    act(() => result.current.updateTab('details'))
    expect(result.current.tab).toBe('details')
    expect(result.current.params.get('tab')).toBe('details')

    act(() => result.current.updateTab(undefined))
    expect(result.current.tab).toBeUndefined()
  })

  it('clears configured params and supports an updater', () => {
    const { result } = renderHook(() => {
      const [params, setParams] = useState(new URLSearchParams('tab=a&filters=1&keep=2'))
      return { params, ...useUrlTab([params, setParams], { clearOnChange: ['filters'] }) }
    })

    act(() => result.current.updateTab((value) => `${value}b`))
    expect(result.current.tab).toBe('ab')
    expect(result.current.params.has('filters')).toBe(false)
    expect(result.current.params.get('keep')).toBe('2')
  })
})

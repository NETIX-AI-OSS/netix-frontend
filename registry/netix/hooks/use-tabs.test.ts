import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useTestSearchParams } from './search-params.testing'
import { type TabsOptions, useTabs } from './use-tabs'

const setup = (initial = '', options?: TabsOptions) =>
  renderHook(() => {
    const binding = useTestSearchParams(initial)
    return { binding, ...useTabs(binding, options) }
  })

describe('useTabs', () => {
  it('reads the tab param, undefined when absent', () => {
    expect(setup('tab=open').result.current.tab).toBe('open')
    expect(setup().result.current.tab).toBeUndefined()
  })

  it('sets and clears the tab param', () => {
    const { result } = setup('tab=open')

    act(() => result.current.updateTab('closed'))
    expect(result.current.binding[0].get('tab')).toBe('closed')
    expect(result.current.tab).toBe('closed')

    act(() => result.current.updateTab(undefined))
    expect(result.current.binding[0].has('tab')).toBe(false)
    expect(result.current.tab).toBeUndefined()
  })

  it('accepts an updater function', () => {
    const { result } = setup('tab=a')
    act(() => result.current.updateTab((previous) => `${previous}b`))
    expect(result.current.tab).toBe('ab')
  })

  it('drops the params listed in clearOnChange', () => {
    const { result } = setup('tab=a&filters=%7B%7D&keep=1', { clearOnChange: ['filters'] })

    act(() => result.current.updateTab('b'))

    expect(result.current.binding[0].has('filters')).toBe(false)
    expect(result.current.binding[0].get('keep')).toBe('1')
  })
})

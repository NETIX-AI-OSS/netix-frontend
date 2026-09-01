import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useDelayedLoading } from './use-delayed-loading'
import { MOBILE_BREAKPOINT, useIsMobile } from './use-is-mobile'
import { useResizeObserver } from './use-resize-observer'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('useIsMobile', () => {
  const stubMatchMedia = () => {
    const listeners: (() => void)[] = []
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        addEventListener: (_: string, fn: () => void) => listeners.push(fn),
        removeEventListener: vi.fn(),
      }),
    )
    return listeners
  }

  it('tracks the viewport width across breakpoint changes', () => {
    const listeners = stubMatchMedia()
    vi.stubGlobal('innerWidth', MOBILE_BREAKPOINT)

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    vi.stubGlobal('innerWidth', MOBILE_BREAKPOINT - 1)
    act(() => listeners.forEach((fn) => fn()))
    expect(result.current).toBe(true)
  })

  it('unsubscribes on unmount', () => {
    const removeEventListener = vi.fn()
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ addEventListener: vi.fn(), removeEventListener }),
    )
    renderHook(() => useIsMobile()).unmount()
    expect(removeEventListener).toHaveBeenCalled()
  })
})

describe('useResizeObserver', () => {
  it('reports the observed content rect and disconnects', () => {
    let notify:
      ((entries: { contentRect: { width: number; height: number } }[]) => void) | undefined
    const disconnect = vi.fn()
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: typeof notify) {
          notify = callback
        }
        observe = vi.fn()
        disconnect = disconnect
      },
    )

    const element = document.createElement('div')
    const { result, unmount } = renderHook(() => useResizeObserver(element))
    expect(result.current).toEqual({ width: 0, height: 0 })

    act(() => notify?.([{ contentRect: { width: 10, height: 20 } }]))
    expect(result.current).toEqual({ width: 10, height: 20 })

    unmount()
    expect(disconnect).toHaveBeenCalled()
  })

  it('does nothing without an element', () => {
    const { result } = renderHook(() => useResizeObserver(null))
    expect(result.current).toEqual({ width: 0, height: 0 })
  })
})

describe('useDelayedLoading', () => {
  it('shows the spinner only after the delay', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ loading }) => useDelayedLoading(loading), {
      initialProps: { loading: true },
    })
    expect(result.current).toBe(false)

    act(() => vi.advanceTimersByTime(150))
    expect(result.current).toBe(true)

    rerender({ loading: false })
    expect(result.current).toBe(false)
  })

  it('shows immediately when the delay is zero', () => {
    const { result } = renderHook(() => useDelayedLoading(true, 0))
    expect(result.current).toBe(true)
  })
})

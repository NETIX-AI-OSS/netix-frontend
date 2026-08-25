import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Toaster } from './toaster'

const spy = vi.hoisted(() => vi.fn())
vi.mock('sonner', () => ({
  Toaster: (props: Record<string, unknown>) => {
    spy(props)
    return <div data-testid="sonner" />
  },
}))

describe('Toaster', () => {
  it('defaults the theme and paints the token-driven CSS variables', () => {
    render(<Toaster />)
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        theme: 'system',
        className: 'toaster group',
        style: expect.objectContaining({ '--normal-bg': 'var(--popover)' }),
      }),
    )
  })

  it('takes the theme, className and extra styles as props', () => {
    render(<Toaster theme="dark" className="custom" style={{ zIndex: 5 }} position="top-right" />)
    expect(spy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        theme: 'dark',
        className: 'custom',
        position: 'top-right',
        style: expect.objectContaining({ zIndex: 5, '--normal-border': 'var(--border)' }),
      }),
    )
  })
})

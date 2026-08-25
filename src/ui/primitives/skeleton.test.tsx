import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Skeleton } from './skeleton'

const el = () => document.querySelector('[data-slot="skeleton"]')

describe('Skeleton', () => {
  it.each([
    ['block', 'h-4'],
    ['text', 'rounded'],
    ['circle', 'rounded-full'],
  ] as const)('renders the %s variant', (variant, expected) => {
    render(<Skeleton variant={variant} className="extra" />)
    expect(el()).toHaveClass(expected, 'extra')
  })

  it('shimmers by default and honours reduced motion via CSS', () => {
    render(<Skeleton />)
    expect(el()).toHaveClass('animate-shimmer', 'motion-reduce:animate-none')
  })

  it('drops the animation when animate is false', () => {
    render(<Skeleton animate={false} />)
    expect(el()).not.toHaveClass('animate-shimmer')
    expect(el()).toHaveClass('bg-[var(--skeleton-base)]')
  })
})

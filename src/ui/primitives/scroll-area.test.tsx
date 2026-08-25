import { render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it } from 'vitest'

import { ScrollArea, ScrollBar } from './scroll-area'

// jsdom ships no ResizeObserver and Radix measures the viewport with one.
beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

describe('ScrollArea', () => {
  it('renders the viewport and its children', () => {
    render(
      <ScrollArea className="root">
        <div>Content</div>
      </ScrollArea>,
    )
    expect(document.querySelector('[data-slot="scroll-area"]')).toHaveClass('root', 'relative')
    expect(document.querySelector('[data-slot="scroll-area-viewport"]')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it.each([
    ['vertical', 'w-2.5'],
    ['horizontal', 'h-2.5'],
  ] as const)('renders a %s scrollbar', (orientation, expected) => {
    render(
      <ScrollArea type="always">
        <ScrollBar orientation={orientation} className="bar" />
      </ScrollArea>,
    )
    const bars = [...document.querySelectorAll('[data-slot="scroll-area-scrollbar"]')]
    expect(bars.some((b) => b.classList.contains(expected))).toBe(true)
    expect(document.querySelector('.bar')).toBeInTheDocument()
  })
})

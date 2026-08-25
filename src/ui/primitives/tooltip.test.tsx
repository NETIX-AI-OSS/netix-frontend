import { render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it } from 'vitest'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'

// jsdom has no ResizeObserver and the Radix arrow measures itself with one.
beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

describe('Tooltip', () => {
  it('renders its content when open', () => {
    render(
      <Tooltip open>
        <TooltipTrigger>Hover</TooltipTrigger>
        <TooltipContent className="content">Hint</TooltipContent>
      </Tooltip>,
    )
    expect(screen.getByText('Hover')).toHaveAttribute('data-slot', 'tooltip-trigger')
    expect(screen.getAllByText('Hint')[0]).toBeInTheDocument()
  })

  it('works under an explicit provider with a custom sideOffset', () => {
    render(
      <TooltipProvider delayDuration={200}>
        <Tooltip open>
          <TooltipTrigger>Hover</TooltipTrigger>
          <TooltipContent sideOffset={8}>Hint</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )
    expect(document.querySelector('[data-slot="tooltip-content"]')).toBeInTheDocument()
  })
})

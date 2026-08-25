import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from './popover'

describe('Popover', () => {
  it('renders content while open and merges classes', () => {
    render(
      <Popover defaultOpen>
        <PopoverAnchor />
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent className="content">Body</PopoverContent>
      </Popover>,
    )
    expect(screen.getByText('Body')).toHaveClass('content', 'bg-popover')
    expect(screen.getByText('Open')).toHaveAttribute('data-slot', 'popover-trigger')
  })

  it('accepts explicit align and sideOffset', () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent align="end" sideOffset={10}>
          Body
        </PopoverContent>
      </Popover>,
    )
    expect(document.querySelector('[data-slot="popover-content"]')).toBeInTheDocument()
  })
})

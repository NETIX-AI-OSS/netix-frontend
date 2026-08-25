import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card'

describe('HoverCard', () => {
  it('renders its content while open', () => {
    render(
      <HoverCard open>
        <HoverCardTrigger>Peek</HoverCardTrigger>
        <HoverCardContent className="content">Details</HoverCardContent>
      </HoverCard>,
    )
    expect(screen.getByText('Peek')).toHaveAttribute('data-slot', 'hover-card-trigger')
    expect(screen.getByText('Details')).toHaveClass('content', 'bg-popover')
  })

  it('accepts explicit align and sideOffset', () => {
    render(
      <HoverCard open>
        <HoverCardTrigger>Peek</HoverCardTrigger>
        <HoverCardContent align="start" sideOffset={12}>
          Details
        </HoverCardContent>
      </HoverCard>,
    )
    expect(screen.getByText('Details')).toBeInTheDocument()
  })
})

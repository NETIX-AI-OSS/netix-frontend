import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Badge, badgeVariants } from './badge'

describe('Badge', () => {
  it.each(['default', 'secondary', 'destructive', 'outline'] as const)(
    'renders the %s variant',
    (variant) => {
      render(
        <Badge variant={variant} className="extra">
          {variant}
        </Badge>,
      )
      const badge = screen.getByText(variant)
      expect(badge.tagName).toBe('SPAN')
      expect(badge).toHaveClass('extra', ...badgeVariants({ variant }).split(' ').slice(0, 1))
    },
  )

  it('renders as the child element when asChild is set', () => {
    render(
      <Badge asChild>
        <a href="/x">link</a>
      </Badge>,
    )
    expect(screen.getByRole('link', { name: 'link' })).toHaveAttribute('data-slot', 'badge')
  })
})

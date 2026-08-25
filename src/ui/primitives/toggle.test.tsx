import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Toggle } from './toggle'

describe('Toggle', () => {
  it.each([
    ['default', 'sm'],
    ['outline', 'default'],
    ['outline', 'lg'],
  ] as const)('renders variant %s at size %s', (variant, size) => {
    render(
      <Toggle variant={variant} size={size} aria-label="bold">
        B
      </Toggle>,
    )
    expect(screen.getByRole('button', { name: 'bold' })).toHaveAttribute('data-slot', 'toggle')
  })

  it('switches to the on state when pressed', async () => {
    render(
      <Toggle aria-label="bold" className="extra">
        B
      </Toggle>,
    )
    const toggle = screen.getByRole('button', { name: 'bold' })
    expect(toggle).toHaveClass('extra')
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('data-state', 'on')
  })
})

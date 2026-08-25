import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Input } from './input'

describe('Input', () => {
  it('accepts typing and forwards type plus className', async () => {
    render(<Input type="email" className="extra" aria-label="email" />)
    const input = screen.getByLabelText('email')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveClass('extra')
    await userEvent.type(input, 'a@b.co')
    expect(input).toHaveValue('a@b.co')
  })

  it('renders without an explicit type', () => {
    render(<Input aria-label="bare" />)
    expect(screen.getByLabelText('bare')).toHaveAttribute('data-slot', 'input')
  })
})

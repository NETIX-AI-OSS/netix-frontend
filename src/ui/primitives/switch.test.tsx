import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Switch } from './switch'

describe('Switch', () => {
  it('toggles on click', async () => {
    render(<Switch aria-label="wifi" className="extra" />)
    const toggle = screen.getByRole('switch', { name: 'wifi' })
    expect(toggle).toHaveClass('extra')
    await userEvent.click(toggle)
    expect(toggle).toBeChecked()
    expect(document.querySelector('[data-slot="switch-thumb"]')).toBeInTheDocument()
  })
})

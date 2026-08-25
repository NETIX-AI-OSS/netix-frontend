import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Checkbox } from './checkbox'

describe('Checkbox', () => {
  it('toggles on click and shows its indicator', async () => {
    render(<Checkbox className="extra" aria-label="pick" />)
    const box = screen.getByRole('checkbox', { name: 'pick' })
    expect(box).toHaveClass('extra')
    await userEvent.click(box)
    expect(box).toBeChecked()
    expect(document.querySelector('[data-slot="checkbox-indicator"]')).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { RadioGroup, RadioGroupItem } from './radio-group'

describe('RadioGroup', () => {
  it('selects an item on click', async () => {
    render(
      <RadioGroup className="group">
        <RadioGroupItem value="a" aria-label="a" className="item" />
        <RadioGroupItem value="b" aria-label="b" />
      </RadioGroup>,
    )
    expect(document.querySelector('[data-slot="radio-group"]')).toHaveClass('group', 'grid')
    const a = screen.getByRole('radio', { name: 'a' })
    expect(a).toHaveClass('item')
    await userEvent.click(a)
    expect(a).toBeChecked()
    expect(document.querySelector('[data-slot="radio-group-indicator"]')).toBeInTheDocument()
  })
})

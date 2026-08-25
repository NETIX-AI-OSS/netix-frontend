import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Textarea } from './textarea'

describe('Textarea', () => {
  it('accepts typing and merges className', async () => {
    render(<Textarea className="extra" aria-label="notes" />)
    const area = screen.getByLabelText('notes')
    expect(area).toHaveClass('extra')
    await userEvent.type(area, 'hi')
    expect(area).toHaveValue('hi')
  })
})

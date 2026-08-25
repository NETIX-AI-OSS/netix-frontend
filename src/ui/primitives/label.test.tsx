import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Input } from './input'
import { Label } from './label'

describe('Label', () => {
  it('associates with its control', () => {
    render(
      <>
        <Label htmlFor="name" className="extra">
          Name
        </Label>
        <Input id="name" />
      </>,
    )
    const label = screen.getByText('Name')
    expect(label).toHaveClass('extra', 'font-medium')
    expect(label).toHaveAttribute('for', 'name')
  })
})

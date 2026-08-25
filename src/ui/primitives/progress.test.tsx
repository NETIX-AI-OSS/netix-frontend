import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Progress } from './progress'

describe('Progress', () => {
  it.each([
    [40, 'translateX(-60%)'],
    [0, 'translateX(-100%)'],
  ])('translates the indicator for value %s', (value, expected) => {
    render(<Progress value={value} className="extra" />)
    expect(screen.getByRole('progressbar')).toHaveClass('extra')
    expect(document.querySelector('[data-slot="progress-indicator"]')).toHaveStyle({
      transform: expected,
    })
  })

  it('treats a missing value as zero', () => {
    render(<Progress />)
    expect(document.querySelector('[data-slot="progress-indicator"]')).toHaveStyle({
      transform: 'translateX(-100%)',
    })
  })
})

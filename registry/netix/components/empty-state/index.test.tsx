import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { EmptyState } from '.'

describe('EmptyState', () => {
  it('renders the default copy and icon', () => {
    const { container } = render(<EmptyState />)
    expect(screen.getByText('No data found')).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('takes injected copy, icon and className', () => {
    const { container } = render(
      <EmptyState text="Nothing here" icon={<span data-testid="glyph" />} className="mt-0" />,
    )
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
    expect(screen.getByTestId('glyph')).toBeInTheDocument()
    expect(container.firstElementChild).toHaveClass('mt-0')
  })
})

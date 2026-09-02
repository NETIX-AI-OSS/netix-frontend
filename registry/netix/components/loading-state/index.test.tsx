import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { inferVariant, LoadingState, type LoadingVariant } from '.'

const variants: LoadingVariant[] = [
  'page',
  'route',
  'section',
  'card',
  'table',
  'chart',
  'inline',
  'button',
]

describe('inferVariant', () => {
  it('prefers an explicit variant', () => {
    expect(inferVariant({ variant: 'chart', center: true, size: 8 })).toBe('chart')
  })

  it('maps the legacy compat props', () => {
    expect(inferVariant({ center: true })).toBe('section')
    expect(inferVariant({ size: 16 })).toBe('button')
    expect(inferVariant({ size: 64 })).toBe('inline')
    expect(inferVariant({})).toBe('inline')
  })
})

describe('LoadingState', () => {
  it.each(variants)('renders the %s variant', (variant) => {
    render(<LoadingState variant={variant} />)
    expect(screen.getByRole('status')).toHaveAttribute('data-loading-variant', variant)
  })

  it('exposes an accessible label', () => {
    render(<LoadingState label="Fetching" />)
    expect(screen.getByRole('status')).toHaveAccessibleName('Fetching')
    expect(screen.getByText('Fetching')).toHaveClass('sr-only')
  })

  it('defaults the label', () => {
    render(<LoadingState />)
    expect(screen.getByRole('status')).toHaveAccessibleName('Loading')
  })

  it('clamps rows and lines', () => {
    const { container: tall } = render(<LoadingState variant="table" rows={99} />)
    expect(tall.querySelectorAll('.grid-cols-4')).toHaveLength(13)
    const { container: card } = render(<LoadingState variant="card" lines={0} />)
    expect(card.querySelectorAll('.space-y-2 > *')).toHaveLength(1)
  })

  it('drops the deprecated props from the DOM and honours center', () => {
    render(<LoadingState center color="red" name="spinner" size={12} className="extra" />)
    const node = screen.getByRole('status')
    expect(node).toHaveAttribute('data-loading-variant', 'section')
    expect(node).toHaveClass('extra')
    expect(node).not.toHaveAttribute('color')
    expect(node).not.toHaveAttribute('name')
  })
})

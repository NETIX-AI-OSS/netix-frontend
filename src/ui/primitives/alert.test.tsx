import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Alert, AlertDescription, AlertTitle } from './alert'

describe('Alert', () => {
  it.each([
    ['default', 'bg-card'],
    ['destructive', 'text-destructive'],
  ] as const)('renders the %s variant', (variant, expected) => {
    render(
      <Alert variant={variant} className="extra">
        <AlertTitle>Title</AlertTitle>
        <AlertDescription>Description</AlertDescription>
      </Alert>,
    )
    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass(expected, 'extra')
    expect(screen.getByText('Title')).toHaveClass('col-start-2')
    expect(screen.getByText('Description')).toHaveClass('text-muted-foreground')
  })

  it('defaults to the default variant', () => {
    render(<Alert>Body</Alert>)
    expect(screen.getByRole('alert')).toHaveClass('bg-card')
  })
})

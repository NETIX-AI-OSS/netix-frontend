import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button, buttonVariants } from './button'

describe('Button', () => {
  it.each(['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const)(
    'renders the %s variant',
    (variant) => {
      render(<Button variant={variant}>{variant}</Button>)
      expect(screen.getByRole('button')).toHaveClass(
        buttonVariants({ variant }).split(' ').slice(-1)[0] as string,
      )
    },
  )

  it.each(['default', 'sm', 'lg', 'icon'] as const)('renders the %s size', (size) => {
    render(<Button size={size}>x</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-slot', 'button')
  })

  it('merges className and fires onClick', async () => {
    const onClick = vi.fn()
    render(
      <Button className="extra" onClick={onClick}>
        go
      </Button>,
    )
    const button = screen.getByRole('button')
    expect(button).toHaveClass('extra')
    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders as the child element when asChild is set', () => {
    render(
      <Button asChild>
        <a href="/x">link</a>
      </Button>,
    )
    expect(screen.getByRole('link')).toHaveAttribute('data-slot', 'button')
  })
})

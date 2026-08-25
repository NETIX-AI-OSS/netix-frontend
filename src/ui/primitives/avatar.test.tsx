import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Avatar, AvatarFallback, AvatarImage } from './avatar'

describe('Avatar', () => {
  it('renders the fallback while the image is unresolved', () => {
    render(
      <Avatar className="root">
        <AvatarImage className="img" src="/a.png" alt="a" />
        <AvatarFallback className="fb">NX</AvatarFallback>
      </Avatar>,
    )
    expect(document.querySelector('[data-slot="avatar"]')).toHaveClass('root', 'rounded-full')
    expect(screen.getByText('NX')).toHaveClass('fb', 'bg-muted')
  })

  it('exposes the image slot component', () => {
    expect(typeof AvatarImage).toBe('function')
  })
})

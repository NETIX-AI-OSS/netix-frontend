import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Separator } from './separator'

describe('Separator', () => {
  it.each(['horizontal', 'vertical'] as const)('renders the %s orientation', (orientation) => {
    render(<Separator orientation={orientation} className="extra" />)
    const el = document.querySelector('[data-slot="separator-root"]')
    expect(el).toHaveAttribute('data-orientation', orientation)
    expect(el).toHaveClass('extra', 'bg-border')
  })

  it('is decorative by default and can opt out', () => {
    const { container } = render(<Separator decorative={false} />)
    expect(container.querySelector('[role="separator"]')).toBeInTheDocument()
  })
})

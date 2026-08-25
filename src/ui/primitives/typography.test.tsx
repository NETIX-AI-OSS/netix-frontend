import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  Typography,
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyMuted,
  TypographyP,
  typographyVariants,
} from './typography'

describe('Typography', () => {
  it.each(['h1', 'h2', 'h3', 'h4', 'p'] as const)('renders a %s element', (variant) => {
    render(<Typography variant={variant}>{variant}</Typography>)
    expect(screen.getByText(variant).tagName.toLowerCase()).toBe(variant)
  })

  it.each(['default', 'lead', 'large', 'small', 'muted', 'removePMargin'] as const)(
    'applies the %s affect',
    (affects) => {
      render(
        <Typography variant="p" affects={affects}>
          text
        </Typography>,
      )
      expect(screen.getByText('text')).toBeInTheDocument()
    },
  )

  it('falls back to a paragraph element when no variant is given', () => {
    render(<Typography className="extra">bare</Typography>)
    const el = screen.getByText('bare')
    expect(el.tagName).toBe('P')
    expect(el).toHaveClass('extra')
  })

  // The whole fleet shipped 'lg: text-5xl', which compiled to nothing.
  it('scales h1 at the lg breakpoint', () => {
    expect(typographyVariants({ variant: 'h1' })).toContain('lg:text-5xl')
    expect(typographyVariants({ variant: 'h1' })).not.toContain('lg: text-5xl')
  })

  it.each([
    [TypographyH1, 'H1'],
    [TypographyH2, 'H2'],
    [TypographyH3, 'H3'],
    [TypographyH4, 'H4'],
    [TypographyP, 'P'],
    [TypographyMuted, 'P'],
  ] as const)('renders the named wrapper as %#', (Comp, tag) => {
    render(<Comp>wrapped</Comp>)
    expect(screen.getByText('wrapped').tagName).toBe(tag)
  })

  it('gives the muted wrapper the muted affect', () => {
    render(<TypographyMuted>quiet</TypographyMuted>)
    expect(screen.getByText('quiet')).toHaveClass('text-muted-foreground')
  })
})

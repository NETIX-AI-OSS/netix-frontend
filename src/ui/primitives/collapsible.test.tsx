import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible'

describe('Collapsible', () => {
  it('reveals its content on trigger click', async () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Body</CollapsibleContent>
      </Collapsible>,
    )
    expect(screen.queryByText('Body')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Toggle' }))
    expect(screen.getByText('Body')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="collapsible"]')).toBeInTheDocument()
  })
})

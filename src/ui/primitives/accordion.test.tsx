import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion'

const tree = (
  <Accordion type="single" collapsible>
    <AccordionItem value="a" className="item">
      <AccordionTrigger className="trigger">Open me</AccordionTrigger>
      <AccordionContent className="content">Body</AccordionContent>
    </AccordionItem>
  </Accordion>
)

describe('Accordion', () => {
  it('renders slots and merges class names', () => {
    render(tree)
    expect(document.querySelector('[data-slot="accordion"]')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="accordion-item"]')).toHaveClass('item', 'border-b')
    expect(screen.getByRole('button', { name: 'Open me' })).toHaveClass('trigger')
  })

  it('reveals content when the trigger is activated', async () => {
    render(tree)
    await userEvent.click(screen.getByRole('button', { name: 'Open me' }))
    expect(screen.getByText('Body')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="accordion-content"]')).toBeInTheDocument()
  })
})

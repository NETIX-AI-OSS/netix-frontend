import { render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it } from 'vitest'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select'

// Radix Select drives a listbox that jsdom does not implement pointer capture or scrolling for.
beforeAll(() => {
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.setPointerCapture = () => {}
  Element.prototype.releasePointerCapture = () => {}
  Element.prototype.scrollIntoView = () => {}
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

const tree = (position: 'popper' | 'item-aligned', size: 'sm' | 'default') => (
  <Select defaultOpen defaultValue="a">
    <SelectTrigger size={size} className="trigger" aria-label="pick">
      <SelectValue placeholder="Pick" />
    </SelectTrigger>
    <SelectContent position={position} className="content">
      <SelectScrollUpButton />
      <SelectGroup>
        <SelectLabel className="label">Group</SelectLabel>
        <SelectItem value="a" className="item">
          Alpha
        </SelectItem>
      </SelectGroup>
      <SelectSeparator className="sep" />
      <SelectScrollDownButton />
    </SelectContent>
  </Select>
)

describe('Select', () => {
  it.each([
    ['popper', 'default'],
    ['item-aligned', 'sm'],
  ] as const)('renders %s content at trigger size %s', (position, size) => {
    render(tree(position, size))
    expect(screen.getByLabelText('pick')).toHaveAttribute('data-size', size)
    expect(document.querySelector('[data-slot="select-content"]')).toHaveClass('content')
    expect(document.querySelector('[data-slot="select-label"]')).toHaveClass('label')
    expect(document.querySelector('[data-slot="select-item"]')).toHaveClass('item')
    expect(document.querySelector('[data-slot="select-separator"]')).toHaveClass('sep')
  })

  it('shows the selected item text', () => {
    render(tree('popper', 'default'))
    expect(screen.getAllByText('Alpha').length).toBeGreaterThan(0)
  })
})

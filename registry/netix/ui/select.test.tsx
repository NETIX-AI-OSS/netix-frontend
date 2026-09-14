import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

function Harness({ items }: { items?: Record<string, React.ReactNode> }) {
  return (
    <Select defaultValue="active" items={items}>
      <SelectTrigger aria-label="Status">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="active">Active</SelectItem>
        <SelectItem value="__all__">All statuses</SelectItem>
      </SelectContent>
    </Select>
  )
}

describe('Select', () => {
  it('shows the selected item label while the content is unmounted', () => {
    // Base UI renders the raw value in a closed trigger; without the derived label map the
    // trigger would read "active".
    render(<Harness />)
    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveTextContent('Active')
  })

  it('lets an explicit items map win over the derived one', () => {
    render(<Harness items={{ active: 'Live now' }} />)
    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveTextContent('Live now')
  })
})

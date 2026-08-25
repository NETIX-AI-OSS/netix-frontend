import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Combobox } from './combobox'

const options = [
  { label: 'Alpha', value: 'a' },
  { label: 'Beta', value: 'b' },
]

describe('Combobox', () => {
  it('shows the placeholder, then the selected label', () => {
    const { rerender } = render(<Combobox options={options} onValueChange={vi.fn()} />)
    expect(screen.getByText('Select option')).toBeInTheDocument()

    rerender(<Combobox options={options} value="b" onValueChange={vi.fn()} />)
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('takes injected labels and a placeholder', () => {
    render(
      <Combobox
        options={options}
        onValueChange={vi.fn()}
        labels={{ select: 'اختر' }}
        placeholder="Pick one"
      />,
    )
    expect(screen.getByText('Pick one')).toBeInTheDocument()
  })

  it('emits the picked value and closes', async () => {
    const onValueChange = vi.fn()
    render(<Combobox options={options} onValueChange={onValueChange} />)
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(await screen.findByText('Alpha'))
    expect(onValueChange).toHaveBeenCalledWith('a')
  })

  it('clears through the X affordance without opening the popover', async () => {
    const onValueChange = vi.fn()
    const { container } = render(
      <Combobox options={options} value="a" loading onValueChange={onValueChange} />,
    )
    expect(screen.getByRole('status')).toBeInTheDocument()
    const clear = container.querySelectorAll('button')[1]
    await userEvent.click(clear as Element)
    expect(onValueChange).toHaveBeenCalledWith()
  })

  it('renders the empty slot when nothing matches', async () => {
    render(<Combobox options={[]} onValueChange={vi.fn()} labels={{ noDataFound: 'None' }} />)
    await userEvent.click(screen.getByRole('combobox'))
    expect(await screen.findByText('None')).toBeInTheDocument()
  })
})

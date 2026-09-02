import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { OptionList, type OptionListItem } from '.'

const items = (onSelect = vi.fn()): OptionListItem[] => [
  { key: 'a', text: 'Alpha', content: 'Alpha', onSelect, selected: true },
  { key: 'b', text: 'Beta', content: 'Beta', onSelect: vi.fn() },
]

describe('OptionList', () => {
  it('filters itself when no search handler is injected', async () => {
    render(<OptionList items={items()} placeholder="Search" empty="none" />)
    await userEvent.type(screen.getByRole('searchbox'), ' bet ')
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('delegates searching and skips local filtering when a handler is injected', async () => {
    const onSearchValueChange = vi.fn()
    render(
      <OptionList
        items={items()}
        placeholder="Search"
        empty="none"
        searchValue="zzz"
        onSearchValueChange={onSearchValueChange}
      />,
    )
    await userEvent.type(screen.getByRole('searchbox'), 'q')
    expect(onSearchValueChange).toHaveBeenCalledWith('zzzq')
    expect(screen.getByText('Alpha')).toBeInTheDocument()
  })

  it('renders the empty slot when nothing matches', async () => {
    render(<OptionList items={items()} placeholder="Search" empty="Nothing" />)
    await userEvent.type(screen.getByRole('searchbox'), 'zzz')
    expect(screen.getByText('Nothing')).toBeInTheDocument()
  })

  it('selects on click and on keyboard, and marks the selected option', async () => {
    const onSelect = vi.fn()
    render(
      <OptionList
        items={items(onSelect)}
        placeholder="Search"
        empty="none"
        header={<div>head</div>}
        footer={<div>foot</div>}
      />,
    )
    expect(screen.getByText('head')).toBeInTheDocument()
    expect(screen.getByText('foot')).toBeInTheDocument()
    expect(screen.getAllByRole('option')[0]).toHaveAttribute('aria-selected', 'true')

    await userEvent.click(screen.getByText('Alpha'))
    screen.getAllByRole('option')[0]?.focus()
    await userEvent.keyboard('{Enter} ')
    await userEvent.keyboard('{Escape}')
    expect(onSelect).toHaveBeenCalledTimes(3)
  })

  it('forwards key presses from the search box', async () => {
    const onSearchKeyDown = vi.fn()
    render(
      <OptionList
        items={items()}
        placeholder="Search"
        empty="none"
        onSearchKeyDown={onSearchKeyDown}
      />,
    )
    await userEvent.type(screen.getByRole('searchbox'), '{Enter}')
    expect(onSearchKeyDown).toHaveBeenCalled()
  })
})

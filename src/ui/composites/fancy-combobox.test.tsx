import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Star } from 'lucide-react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { FancyCombobox } from './fancy-combobox'

const options = [
  { label: 'Alpha', value: 'a', icon: Star },
  { label: 'Beta', value: 'b' },
  { label: 'Gamma', value: 'c' },
]

// jsdom has no IntersectionObserver; the sentinel test installs one that reports "visible".
function installObserver(intersecting: boolean) {
  const disconnect = vi.fn()
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(private cb: (entries: { isIntersecting: boolean }[]) => void) {}
      observe() {
        this.cb([{ isIntersecting: intersecting }])
      }
      disconnect = disconnect
    },
  )
  return disconnect
}

afterEach(() => vi.unstubAllGlobals())

describe('FancyCombobox', () => {
  it('shows the placeholder and disables itself with no options and no remote search', () => {
    render(<FancyCombobox options={[]} onValueChange={vi.fn()} />)
    expect(screen.getByText('NA')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('renders the single-select value, falling back to the NA label', () => {
    const { rerender } = render(
      <FancyCombobox options={options} value={['a']} onValueChange={vi.fn()} />,
    )
    expect(screen.getByText('Alpha')).toBeInTheDocument()

    rerender(<FancyCombobox options={options} value={['zz']} onValueChange={vi.fn()} />)
    expect(screen.getByText('NA')).toBeInTheDocument()
  })

  it('renders badges up to maxCount plus an overflow badge', () => {
    render(
      <FancyCombobox options={options} multiple value={['a', 'b', 'c']} onValueChange={vi.fn()} />,
    )
    expect(screen.getByText('+ 1')).toBeInTheDocument()
  })

  it('toggles a badge off and clears everything', async () => {
    const onValueChange = vi.fn()
    const { container } = render(
      <FancyCombobox options={options} multiple value={['a', 'b']} onValueChange={onValueChange} />,
    )
    const icons = container.querySelectorAll('.lucide-x')
    await userEvent.click(icons[0] as Element)
    expect(onValueChange).toHaveBeenCalledWith(['b'])

    await userEvent.click(icons[icons.length - 1] as Element)
    expect(onValueChange).toHaveBeenLastCalledWith([])
  })

  it('selects one option and closes in single mode', async () => {
    const onValueChange = vi.fn()
    render(<FancyCombobox options={options} onValueChange={onValueChange} />)
    await userEvent.click(screen.getByRole('button'))
    await userEvent.click(await screen.findByText('Beta'))
    expect(onValueChange).toHaveBeenCalledWith(['b'])
    await waitFor(() => expect(screen.queryByText('Gamma')).not.toBeInTheDocument())
  })

  it('accumulates values and offers select-all in multiple mode', async () => {
    const onValueChange = vi.fn()
    render(<FancyCombobox options={options} multiple value={['a']} onValueChange={onValueChange} />)
    await userEvent.click(screen.getByRole('button'))
    await userEvent.click(await screen.findByText('Gamma'))
    expect(onValueChange).toHaveBeenCalledWith(['a', 'c'])

    await userEvent.click(screen.getByText('Select all'))
    expect(onValueChange).toHaveBeenLastCalledWith(['a', 'b', 'c'])
  })

  it('select-all clears when everything is already selected', async () => {
    const onValueChange = vi.fn()
    render(
      <FancyCombobox
        options={options}
        multiple
        value={['a', 'b', 'c']}
        onValueChange={onValueChange}
      />,
    )
    await userEvent.click(screen.getAllByRole('button')[0] as Element)
    await userEvent.click(await screen.findByText('Select all'))
    expect(onValueChange).toHaveBeenCalledWith([])
  })

  it('pops the last value on backspace in an empty search box and opens on Enter', async () => {
    const onValueChange = vi.fn()
    render(
      <FancyCombobox
        options={options}
        multiple
        value={['a', 'b']}
        onSearchValueChange={vi.fn()}
        onValueChange={onValueChange}
      />,
    )
    await userEvent.click(screen.getAllByRole('button')[0] as Element)
    const search = await screen.findByRole('searchbox')
    await userEvent.type(search, '{Backspace}')
    expect(onValueChange).toHaveBeenCalledWith(['a'])
    await userEvent.type(search, '{Enter}')
    expect(screen.getByRole('searchbox')).toBeInTheDocument()
  })

  it('closes on Escape and swallows scroll gestures', async () => {
    render(<FancyCombobox options={options} onValueChange={vi.fn()} />)
    await userEvent.click(screen.getByRole('button'))
    const list = await screen.findByRole('listbox')
    fireEvent.wheel(list)
    fireEvent.touchMove(list)
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
  })

  it('shows the type-to-search copy when searching is remote', async () => {
    render(<FancyCombobox options={[]} onSearchValueChange={vi.fn()} onValueChange={vi.fn()} />)
    await userEvent.click(screen.getByRole('button'))
    expect(await screen.findByText('Type to search')).toBeInTheDocument()
  })

  it('calls onLoadMore once the sentinel is visible', async () => {
    installObserver(true)
    const onLoadMore = vi.fn()
    render(
      <FancyCombobox
        options={options}
        hasNextPage
        onLoadMore={onLoadMore}
        onValueChange={vi.fn()}
        loading
      />,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(await screen.findByText('Load more')).toBeInTheDocument()
    await waitFor(() => expect(onLoadMore).toHaveBeenCalled())
  })

  it('holds off while a page is already in flight', async () => {
    installObserver(false)
    const onLoadMore = vi.fn()
    render(
      <FancyCombobox
        options={options}
        hasNextPage
        isFetchingNextPage
        onLoadMore={onLoadMore}
        onValueChange={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(await screen.findByText('Loading...')).toBeInTheDocument()
    expect(onLoadMore).not.toHaveBeenCalled()
  })
})

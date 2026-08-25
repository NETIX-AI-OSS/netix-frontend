import type { RowData } from '@tanstack/react-table'
import type { LegacyColumn } from '@tanstack/react-table/legacy'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { FilterValues } from '../../hooks'
import { ColumnFilter } from './column-filter'
import type { ColumnFilterMeta, FilterContext } from './data-table-types'

function makeColumn(filter?: ColumnFilterMeta, sorted: false | 'asc' | 'desc' = false) {
  const toggleSorting = vi.fn()
  const column = {
    columnDef: { meta: { filter } },
    getIsSorted: () => sorted,
    toggleSorting,
  } as unknown as LegacyColumn<RowData, unknown>
  return { column, toggleSorting }
}

// Records what each updater produced, so assertions read the resulting filter object.
function makeFiltering(filters?: FilterValues, extra?: Partial<FilterContext>) {
  const results: (FilterValues | undefined)[] = []
  const updateFilters: FilterContext['updateFilters'] = (updater) => {
    results.push(typeof updater === 'function' ? updater(filters) : updater)
  }
  return { filtering: { filters, updateFilters, ...extra } as FilterContext, results }
}

const openPopover = async (container: HTMLElement) => {
  await userEvent.click(container.querySelector('[data-slot="popover-trigger"]') as Element)
}

describe('ColumnFilter', () => {
  it('applies a typed value and closes the popover', async () => {
    const { column } = makeColumn({ key: 'name' })
    const { filtering, results } = makeFiltering({ page: '1' })
    const { container } = render(<ColumnFilter column={column} filtering={filtering} />)

    await openPopover(container)
    await userEvent.type(await screen.findByPlaceholderText('Search'), 'pump')
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))

    expect(results).toEqual([{ page: '1', name: 'pump' }])
    await waitFor(() => expect(screen.queryByPlaceholderText('Search')).not.toBeInTheDocument())
  })

  it('re-enables the controls when the transformer rejects', async () => {
    const transformer = vi.fn().mockRejectedValue(new Error('boom'))
    const onError = vi.fn()
    const { column } = makeColumn({ key: 'name', transformer })
    const { filtering, results } = makeFiltering({}, { onError })
    const { container } = render(<ColumnFilter column={column} filtering={filtering} />)

    await openPopover(container)
    const search = screen.getByRole('button', { name: 'Search' })
    const reset = screen.getByRole('button', { name: 'Reset' })
    await userEvent.click(search)

    await waitFor(() => expect(onError).toHaveBeenCalled())
    expect(search).toBeEnabled()
    expect(reset).toBeEnabled()
    expect(results).toEqual([])
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument()
  })

  it('re-enables the controls when reset rejects', async () => {
    const transformer = vi.fn().mockRejectedValue(new Error('boom'))
    const { column } = makeColumn({ key: 'name', transformer })
    const { filtering } = makeFiltering({ name: 'x' })
    const { container } = render(<ColumnFilter column={column} filtering={filtering} />)

    await openPopover(container)
    const reset = screen.getByRole('button', { name: 'Reset' })
    await userEvent.click(reset)
    await waitFor(() => expect(reset).toBeEnabled())
  })

  it('drops its own key on reset even when the transformer returns nothing', async () => {
    const transformer = vi.fn().mockResolvedValue({})
    const { column } = makeColumn({ key: 'name', transformer })
    const { filtering, results } = makeFiltering({ name: 'pump', other: 'keep' })
    const { container } = render(<ColumnFilter column={column} filtering={filtering} />)

    await openPopover(container)
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }))

    await waitFor(() => expect(results).toEqual([{ other: 'keep' }]))
  })

  it('does nothing without a filter key', async () => {
    const { column } = makeColumn()
    const { filtering, results } = makeFiltering({})
    const { container } = render(<ColumnFilter column={column} filtering={filtering} />)

    await openPopover(container)
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(results).toEqual([])
  })

  it('mirrors an existing ordering onto the column', () => {
    const { column, toggleSorting } = makeColumn({ key: 'name', sort: 'name' })
    const { filtering } = makeFiltering({ ordering: '-name' })
    render(<ColumnFilter column={column} filtering={filtering} />)
    expect(toggleSorting).toHaveBeenCalledWith(true, false)
  })

  it('writes the ordering filter when the sort glyph is clicked', async () => {
    const { column, toggleSorting } = makeColumn({ key: 'name', sort: 'name' }, 'asc')
    const { filtering, results } = makeFiltering({})
    render(<ColumnFilter column={column} filtering={filtering} />)

    await userEvent.click(screen.getByTestId('column-filter-sort'))
    expect(toggleSorting).toHaveBeenCalledWith(true)
    await waitFor(() => expect(results).toEqual([{ ordering: '-name' }]))
  })

  it('re-enables the controls when sorting rejects', async () => {
    const transformer = vi.fn().mockRejectedValue(new Error('boom'))
    const onError = vi.fn()
    const { column } = makeColumn({ key: 'name', sort: 'name', transformer })
    const { filtering } = makeFiltering({}, { onError })
    render(<ColumnFilter column={column} filtering={filtering} />)

    await userEvent.click(screen.getByTestId('column-filter-sort'))
    await waitFor(() => expect(onError).toHaveBeenCalled())
  })

  it('submits the text form on Enter', async () => {
    const { column } = makeColumn({ key: 'name' })
    const { filtering, results } = makeFiltering({})
    const { container } = render(<ColumnFilter column={column} filtering={filtering} />)

    await openPopover(container)
    await userEvent.type(await screen.findByPlaceholderText('Search'), 'pump{Enter}')
    await waitFor(() => expect(results).toEqual([{ name: 'pump' }]))
  })

  it('ignores the sort glyph when the column declares no sort key', async () => {
    const { column } = makeColumn({ key: 'name' })
    const { filtering } = makeFiltering({})
    render(<ColumnFilter column={column} filtering={filtering} />)
    expect(screen.queryByTestId('column-filter-sort')).not.toBeInTheDocument()
  })

  it('drives a static option list, single and multiple', async () => {
    const options = [
      { label: 'Open', value: 'open' },
      { label: 'Closed', value: 'closed' },
    ]
    const { column } = makeColumn({ key: 'status', options, multiple: true })
    const { filtering, results } = makeFiltering(
      { status: 'open' },
      { translateOptionLabel: (label) => label.toUpperCase() },
    )
    const { container } = render(<ColumnFilter column={column} filtering={filtering} />)

    await openPopover(container)
    expect(await screen.findByText('OPEN')).toBeInTheDocument()
    await userEvent.click(screen.getByText('CLOSED'))
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))
    await waitFor(() => expect(results).toEqual([{ status: 'open,closed' }]))
  })

  it('deselects an already selected option', async () => {
    const options = [{ label: 'Open', value: 'open' }]
    const { column } = makeColumn({ key: 'status', options })
    const { filtering, results } = makeFiltering({ status: 'open' })
    const { container } = render(<ColumnFilter column={column} filtering={filtering} />)

    await openPopover(container)
    await userEvent.click(await screen.findByText('Open'))
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))
    await waitFor(() => expect(results).toEqual([{ status: '' }]))
  })

  it('queries remote options through the injected list hook', async () => {
    const useList = vi.fn().mockReturnValue({ data: ['raw'], isLoading: true })
    const useOptions = vi.fn().mockReturnValue([])
    const { column } = makeColumn({ key: 'asset', useList, useOptions })
    const { filtering } = makeFiltering(
      {},
      { listParams: { organization: 7 }, queryOptionKey: 'swr', debounceMs: 0 },
    )
    const { container } = render(<ColumnFilter column={column} filtering={filtering} />)

    await openPopover(container)
    await userEvent.type(await screen.findByRole('searchbox'), 'pu')
    await waitFor(() =>
      expect(useList).toHaveBeenLastCalledWith(
        { organization: 7, search: 'pu', id: undefined },
        { swr: { enabled: true } },
      ),
    )
    expect(useOptions).toHaveBeenCalledWith(['raw'])
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0)
  })

  it('shows the empty copy once the remote list settles', async () => {
    const useList = vi.fn().mockReturnValue({ data: undefined, isLoading: false })
    const useOptions = vi.fn().mockReturnValue([])
    const { column } = makeColumn({ key: 'asset', useList, useOptions })
    const { filtering } = makeFiltering({}, { labels: { noDataFound: 'Nada' } })
    const { container } = render(<ColumnFilter column={column} filtering={filtering} />)

    await openPopover(container)
    expect(await screen.findByText('Nada')).toBeInTheDocument()
    expect(useList).toHaveBeenCalledWith(
      { search: '', id: undefined },
      { query: { enabled: false } },
    )
  })
})

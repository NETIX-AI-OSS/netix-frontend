import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { DataTable, type DataTableColumn, type DataTableProps, type RowWrapperProps } from '.'

type Row = { name: string; status: string; owner: string }

const data: Row[] = [
  { name: 'Chiller', status: 'ok', owner: 'ops' },
  { name: 'Pump', status: 'down', owner: 'eng' },
]

const flatColumns: DataTableColumn<Row>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'status', header: 'Status', meta: { cellClassName: 'cell-x' } },
  { accessorKey: 'owner', header: 'Owner' },
]

const groupedColumns: DataTableColumn<Row>[] = [
  {
    id: 'identity',
    header: 'Identity',
    columns: [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'status', header: 'Status' },
    ],
  },
  { accessorKey: 'owner', header: 'Owner' },
]

type HarnessProps = Omit<DataTableProps<Row>, 'columns' | 'data' | 'getRowCanExpand' | 'state'> & {
  rows?: Row[]
  columns?: DataTableColumn<Row>[]
  pinned?: boolean
  expanded?: boolean
}

function Harness({ rows = data, columns = flatColumns, pinned, expanded, ...props }: HarnessProps) {
  return (
    <DataTable
      {...props}
      data={rows}
      columns={columns}
      getRowCanExpand={() => true}
      state={{
        ...(pinned ? { columnPinning: { start: ['name'], end: ['owner'] } } : {}),
        ...(expanded ? { expanded: true } : {}),
      }}
    />
  )
}

function ControlledPaginationHarness() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 1 })
  return (
    <>
      <output data-testid="pagination-state">
        {pagination.pageIndex + 1}/{pagination.pageSize}
      </output>
      <DataTable
        data={data}
        columns={flatColumns}
        state={{ pagination }}
        onPaginationChange={setPagination}
        pagination={{ pageSizeOptions: [1, 2] }}
      />
    </>
  )
}

describe('DataTable', () => {
  it('renders headers and cells', () => {
    render(<Harness />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Chiller')).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(3)
  })

  it('translates string headers through the injected translator', () => {
    render(<Harness translateHeader={(header, id) => `${id}:${header}`} />)
    expect(screen.getByText('name:Name')).toBeInTheDocument()
  })

  it('renders grouped and pinned headers', () => {
    render(
      <Harness columns={groupedColumns} pinned heightAuto className="mine" style={{ gap: 1 }} />,
    )
    expect(screen.getByText('Identity')).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader').length).toBeGreaterThan(3)
  })

  it('sticks pinned columns to the start and end edges', () => {
    // The v9 pinning API ('start'/'end', getStart/getAfter) drives real sticky offsets —
    // an unpinned column stays in flow, so a passing render alone proves nothing.
    render(<Harness pinned heightAuto />)
    const [nameCell, statusCell, ownerCell] = screen.getAllByRole('row')[1]!.querySelectorAll('td')

    expect(nameCell!.style.position).toBe('sticky')
    expect(nameCell!.style.left).toBe('0px')
    expect(ownerCell!.style.position).toBe('sticky')
    expect(ownerCell!.style.right).toBe('0px')
    expect(statusCell!.style.position).toBe('relative')
  })

  it('fires onRowClick only for clicks that start inside the row', async () => {
    const onRowClick = vi.fn()
    render(<Harness onRowClick={onRowClick} rowClassName={() => 'tinted'} />)
    await userEvent.click(screen.getByText('Chiller'))
    expect(onRowClick).toHaveBeenCalledTimes(1)

    // A click that bubbled out of a portalled overlay never contains the row.
    const row = screen.getAllByRole('row')[1] as HTMLElement
    Object.defineProperty(row, 'contains', { value: () => false })
    await userEvent.click(screen.getByText('Chiller'))
    expect(onRowClick).toHaveBeenCalledTimes(1)
  })

  it('wraps rows with the injected RowWrapper and renders expanded sub-rows', () => {
    const RowWrapper = ({ row, children, ...rest }: RowWrapperProps<Row>) => {
      void row
      return <tr {...rest}>{children}</tr>
    }
    render(
      <Harness
        expanded
        RowWrapper={RowWrapper}
        renderSubComponent={({ row }) => <span>sub-{row.original.name}</span>}
      />,
    )
    expect(screen.getByText('sub-Chiller')).toBeInTheDocument()
  })

  it('swaps the body for skeleton rows after the delay', async () => {
    const { container } = render(<Harness loading loadingRowCount={2} />)
    expect(screen.getByText('Chiller')).toBeInTheDocument()
    await waitFor(() =>
      expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0),
    )
    expect(screen.queryByText('Chiller')).not.toBeInTheDocument()
  })

  it('shows the overlay immediately in overlay mode, over the rows it keeps visible', () => {
    render(<Harness loading loadingMode="overlay" loadingLabel="Refreshing" />)
    expect(screen.getByRole('status')).toHaveAccessibleName('Refreshing')
    expect(screen.getByText('Chiller')).toBeInTheDocument()
  })

  it('takes an injected overlay component', () => {
    render(<Harness loading loadingMode="overlay" LoadingComponent={() => <p>busy</p>} />)
    expect(screen.getByText('busy')).toBeInTheDocument()
  })

  it('shows the empty state and, with filters set, a clear button', async () => {
    const updateFilters = vi.fn()
    const { rerender } = render(<Harness rows={[]} />)
    expect(screen.getByText('No data found')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()

    rerender(
      <Harness
        rows={[]}
        clearFiltersLabel="Reset all"
        EmptyComponent={() => <p>nothing</p>}
        filtering={{ filters: { status: 'down' }, updateFilters }}
        pagination={{ pageSizeOptions: [10] }}
      />,
    )
    expect(screen.getByText('nothing')).toBeInTheDocument()
    // With a footer, the action sits beside the result summary instead of inside the empty body.
    const clearButton = screen.getByRole('button', { name: 'Reset all' })
    expect(screen.getByText('No results').parentElement).toContainElement(clearButton)
    await userEvent.click(clearButton)
    expect(updateFilters).toHaveBeenCalledWith({})
  })

  it('keeps the table surface borderless by default', () => {
    const { container } = render(<Harness />)
    expect(container.firstElementChild).not.toHaveClass('border')
  })

  it('includes the standard controlled pagination footer when requested', () => {
    render(<Harness pagination={{ pageSizeOptions: [2, 10] }} />)
    expect(screen.getByText('Showing 1–2 of 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to page 1' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByText('Rows per page')).toBeInTheDocument()
  })

  it('slices local rows to the current page and delegates changes to a controlled parent', async () => {
    render(<ControlledPaginationHarness />)
    // A page size of one: only the first row is on the page, not the whole dataset.
    expect(screen.getByText('Chiller')).toBeInTheDocument()
    expect(screen.queryByText('Pump')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Go to page 2' }))
    expect(screen.getByTestId('pagination-state')).toHaveTextContent('2/1')
    expect(screen.getByText('Pump')).toBeInTheDocument()
    expect(screen.queryByText('Chiller')).not.toBeInTheDocument()
  })

  it('renders a column filter only when a filter context is supplied', () => {
    const columns: DataTableColumn<Row>[] = [
      {
        accessorKey: 'name',
        header: 'Name',
        meta: { filter: { key: 'name' }, headerClassName: 'hdr' },
      },
    ]
    const { rerender, container } = render(<Harness columns={columns} />)
    expect(container.querySelector('[data-slot="popover-trigger"]')).toBeNull()

    rerender(<Harness columns={columns} filtering={{ filters: {}, updateFilters: vi.fn() }} />)
    expect(container.querySelector('[data-slot="popover-trigger"]')).not.toBeNull()
  })
})

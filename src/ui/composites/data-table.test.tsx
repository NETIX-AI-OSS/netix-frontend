import type { LegacyColumnDef, LegacyReactTable } from '@tanstack/react-table/legacy'
import { getCoreRowModel, getExpandedRowModel, useLegacyTable } from '@tanstack/react-table/legacy'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useMemo } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { DataTable, type DataTableProps, type RowWrapperProps } from './data-table'

type Row = { name: string; status: string; owner: string }

const data: Row[] = [
  { name: 'Chiller', status: 'ok', owner: 'ops' },
  { name: 'Pump', status: 'down', owner: 'eng' },
]

const flatColumns: LegacyColumnDef<Row>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'status', header: 'Status', meta: { cellClassName: 'cell-x' } },
  { accessorKey: 'owner', header: 'Owner' },
]

const groupedColumns: LegacyColumnDef<Row>[] = [
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

type HarnessProps = Omit<DataTableProps<Row>, 'table'> & {
  rows?: Row[]
  columns?: LegacyColumnDef<Row>[]
  pinned?: boolean
  expanded?: boolean
}

function Harness({ rows = data, columns = flatColumns, pinned, expanded, ...props }: HarnessProps) {
  const tableData = useMemo(() => rows, [rows])
  const table = useLegacyTable<Row>({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    state: {
      ...(pinned ? { columnPinning: { start: ['name'], end: ['owner'] } } : {}),
      ...(expanded ? { expanded: true } : {}),
    },
  }) as LegacyReactTable<Row>
  return <DataTable table={table} {...props} />
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

  it('shows the overlay immediately in overlay mode', () => {
    render(<Harness loading loadingMode="overlay" />)
    expect(screen.getByRole('status')).toHaveAttribute('data-loading-variant', 'table')
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
      />,
    )
    expect(screen.getByText('nothing')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Reset all' }))
    expect(updateFilters).toHaveBeenCalledWith({})
  })

  it('renders a column filter only when a filter context is supplied', () => {
    const columns: LegacyColumnDef<Row>[] = [
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

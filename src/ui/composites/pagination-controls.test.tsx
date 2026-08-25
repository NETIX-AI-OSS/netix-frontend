import {
  getCoreRowModel,
  getPaginationRowModel,
  useLegacyTable,
} from '@tanstack/react-table/legacy'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useMemo, useState } from 'react'
import { beforeAll, describe, expect, it } from 'vitest'

import { PaginationControls, type PaginationControlsProps } from './pagination-controls'

type Row = { id: number }

const rows = (count: number): Row[] => Array.from({ length: count }, (_, i) => ({ id: i }))

// jsdom lacks the pointer-capture API that Radix Select drives its trigger with.
beforeAll(() => {
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.setPointerCapture = () => {}
  Element.prototype.releasePointerCapture = () => {}
  Element.prototype.scrollIntoView = () => {}
})

function Harness({
  count,
  pageIndex = 0,
  pageSize = 10,
  ...props
}: { count: number; pageIndex?: number; pageSize?: number } & Omit<
  PaginationControlsProps<Row>,
  'table'
>) {
  const [pagination, setPagination] = useState({ pageIndex, pageSize })
  const data = useMemo(() => rows(count), [count])
  const table = useLegacyTable<Row>({
    data,
    columns: [{ accessorKey: 'id', header: 'Id' }],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { pagination },
    onPaginationChange: setPagination,
  })
  return (
    <>
      <PaginationControls table={table} {...props} />
      <output>{`${pagination.pageIndex}:${pagination.pageSize}`}</output>
    </>
  )
}

const pageButtons = () =>
  screen
    .getAllByRole('button')
    .map((b) => b.textContent)
    .filter((t) => t && /^\d+$/.test(t))

describe('PaginationControls', () => {
  it('lists every page when there are few of them', () => {
    render(<Harness count={30} />)
    expect(pageButtons()).toEqual(['1', '2', '3'])
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
  })

  it('windows the middle pages with ellipses', () => {
    render(<Harness count={200} pageIndex={9} />)
    expect(pageButtons()).toEqual(['1', '9', '10', '11', '20'])
    expect(screen.getAllByText('...')).toHaveLength(2)
  })

  it('anchors the window at the start', () => {
    render(<Harness count={200} />)
    expect(pageButtons()).toEqual(['1', '2', '3', '4', '20'])
    expect(screen.getAllByText('...')).toHaveLength(1)
  })

  it('anchors the window at the end', () => {
    render(<Harness count={200} pageIndex={19} />)
    expect(pageButtons()).toEqual(['1', '17', '18', '19', '20'])
  })

  it('steps and jumps between pages', async () => {
    render(<Harness count={40} />)
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(screen.getByRole('status')).toHaveTextContent('1:10')

    await userEvent.click(screen.getByRole('button', { name: '4' }))
    expect(screen.getByRole('status')).toHaveTextContent('3:10')
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: 'Previous page' }))
    expect(screen.getByRole('status')).toHaveTextContent('2:10')
  })

  it('renders a single page without ellipses', () => {
    render(<Harness count={4} />)
    expect(pageButtons()).toEqual(['1'])
    expect(screen.queryByText('...')).not.toBeInTheDocument()
  })

  it('renders the total count only when both props are supplied', () => {
    const { rerender } = render(<Harness count={7} showTotalCount totalCountLabel="Total" />)
    expect(screen.getByText('7')).toBeInTheDocument()

    rerender(<Harness count={7} showTotalCount />)
    expect(screen.queryByText('Total')).not.toBeInTheDocument()
  })

  it('offers the injected page sizes and applies the pick', async () => {
    render(<Harness count={70} pageSizeOptions={[5, 15]} pageLabel="per page" className="mt-2" />)
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(await screen.findByText('15 / per page'))
    expect(screen.getByRole('status')).toHaveTextContent('0:15')
  })
})

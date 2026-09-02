import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { getPageItems, PaginationControls } from './pagination'

const props = {
  currentPage: 2,
  pageSize: 10,
  total: 95,
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
}

describe('PaginationControls', () => {
  it('shows a readable range, active page and page-size control', () => {
    render(<PaginationControls {...props} />)
    expect(screen.getByText('Showing 11–20 of 95')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to page 2' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByText('Rows per page')).toBeInTheDocument()
  })

  it('calls page handlers for first, previous, number, next and last', async () => {
    const onPageChange = vi.fn()
    render(<PaginationControls {...props} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Go to first page' }))
    await userEvent.click(screen.getByRole('button', { name: 'Go to previous page' }))
    await userEvent.click(screen.getByRole('button', { name: 'Go to page 3' }))
    await userEvent.click(screen.getByRole('button', { name: 'Go to next page' }))
    await userEvent.click(screen.getByRole('button', { name: 'Go to last page' }))
    expect(onPageChange).toHaveBeenNthCalledWith(1, 1)
    expect(onPageChange).toHaveBeenNthCalledWith(2, 1)
    expect(onPageChange).toHaveBeenNthCalledWith(3, 3)
    expect(onPageChange).toHaveBeenNthCalledWith(4, 3)
    expect(onPageChange).toHaveBeenNthCalledWith(5, 10)
  })

  it('disables navigation at the boundaries', () => {
    const { rerender } = render(<PaginationControls {...props} currentPage={1} />)
    expect(screen.getByRole('button', { name: 'Go to first page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Go to previous page' })).toBeDisabled()

    rerender(<PaginationControls {...props} currentPage={10} />)
    expect(screen.getByRole('button', { name: 'Go to next page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Go to last page' })).toBeDisabled()
    rerender(<PaginationControls {...props} currentPage={1} total={0} />)
    expect(screen.getByText('No results')).toBeInTheDocument()
  })

  it('supports custom labels and page sizes', async () => {
    const onPageSizeChange = vi.fn()
    render(
      <PaginationControls
        {...props}
        pageSizeOptions={[5, 25]}
        onPageSizeChange={onPageSizeChange}
        labels={{ rowsPerPage: 'Items per page', showingResults: '{start}-{end}/{total}' }}
      />,
    )
    expect(screen.getByText('11-20/95')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('combobox', { name: 'Items per page' }))
    await userEvent.click(await screen.findByText('25'))
    expect(onPageSizeChange).toHaveBeenCalledWith(25)
  })

  it('can hide the total summary', () => {
    render(<PaginationControls {...props} showTotal={false} />)
    expect(screen.queryByText('Showing 11–20 of 95')).not.toBeInTheDocument()
  })

  it('renders leading content beside the result summary', () => {
    render(<PaginationControls {...props} leadingContent={<button>Clear</button>} />)
    expect(screen.getByText('Showing 11–20 of 95').parentElement).toContainElement(
      screen.getByRole('button', { name: 'Clear' }),
    )
  })

  it('keeps cursor pagination controlled when neither a total nor page count exists', async () => {
    const onPageChange = vi.fn()
    render(
      <PaginationControls
        currentPage={4}
        pageSize={25}
        hasNextPage={false}
        onPageChange={onPageChange}
        onPageSizeChange={vi.fn()}
      />,
    )
    expect(screen.getByText('Go to page 4')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to next page' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Go to previous page' }))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })
})

describe('getPageItems', () => {
  it('keeps the first, last and current neighborhood visible for long lists', () => {
    expect(getPageItems(8, 20)).toEqual([1, 'start-ellipsis', 7, 8, 9, 'end-ellipsis', 20])
  })

  it('shows every page when the list is short', () => {
    expect(getPageItems(2, 5)).toEqual([1, 2, 3, 4, 5])
  })
})

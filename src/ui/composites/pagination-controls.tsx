import type { RowData } from '@tanstack/react-table'
import type { LegacyReactTable as Table } from '@tanstack/react-table/legacy'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '../../utils/cn'
import {
  Button,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../primitives'

const ELLIPSIS = 'getPages'

export type PaginationControlsProps<TData extends RowData> = {
  table: Table<TData>
  className?: string
  showTotalCount?: boolean
  totalCountLabel?: string
  pageSizeOptions?: number[]
  pageSizePlaceholder?: string
  pageLabel?: string
}

export function PaginationControls<TData extends RowData>({
  table,
  className,
  showTotalCount = false,
  totalCountLabel,
  pageSizeOptions = [10, 25, 50, 100],
  pageSizePlaceholder = 'Page size',
  pageLabel = 'page',
}: PaginationControlsProps<TData>) {
  const currentPage = table.getState().pagination.pageIndex + 1
  const totalPages = table.getPageCount()
  const totalRows = table.getRowCount()

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const showPages = 5
    if (totalPages <= showPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const addPages = (from: number, to: number) => {
      for (let i = from; i <= to; i++) {
        pages.push(i)
      }
    }
    pages.push(1)
    let start = currentPage - 1
    let end = currentPage + 1
    if (currentPage <= 3) {
      start = 2
      end = 4
    } else if (currentPage >= totalPages - 2) {
      start = totalPages - 3
      end = totalPages - 1
    }

    if (start > 2) pages.push(ELLIPSIS)
    addPages(start, end)
    if (end < totalPages - 1) pages.push(ELLIPSIS)
    if (totalPages > 1) pages.push(totalPages)

    return pages
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {showTotalCount && totalCountLabel && (
        <span className="me-4 text-sm text-secondary-foreground">
          {totalCountLabel}: <span className="font-semibold">{totalRows ?? 0}</span>
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 bg-card"
        aria-label="Previous page"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        <ChevronLeft className="h-4 w-4 text-secondary-foreground" />
      </Button>

      <div className="flex gap-2">
        {getPageNumbers().map((page, idx) =>
          page === ELLIPSIS ? (
            <span
              key={`ellipsis-${idx}`}
              className="rounded-md bg-card px-3 py-1 text-secondary-foreground"
            >
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? 'secondary' : 'ghost'}
              className={cn(
                'h-8 min-w-8 bg-card p-0 px-2 text-secondary-foreground',
                currentPage === page && 'bg-primary/10 text-primary',
              )}
              onClick={() => table.setPageIndex(Number(page) - 1)}
            >
              {page}
            </Button>
          ),
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 bg-card"
        aria-label="Next page"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        <ChevronRight className="h-4 w-4 text-secondary-foreground" />
      </Button>

      <Select
        value={String(table.getState().pagination.pageSize)}
        onValueChange={(v: string) => table.setPageSize(Number(v))}
      >
        <SelectTrigger className="w-28 bg-card">
          <SelectValue placeholder={pageSizePlaceholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {pageSizeOptions.map((pageSize) => (
              <SelectItem key={pageSize} value={String(pageSize)}>
                {pageSize} / {pageLabel}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}

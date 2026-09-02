import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export type PaginationControlsLabels = {
  showingResults: string
  noResults: string
  rowsPerPage: string
  firstPage: string
  previousPage: string
  nextPage: string
  lastPage: string
  page: (page: number) => string
  pageOf: (page: number, totalPages: number) => string
  morePages: string
}

const defaultLabels: PaginationControlsLabels = {
  showingResults: 'Showing {start}–{end} of {total}',
  noResults: 'No results',
  rowsPerPage: 'Rows per page',
  firstPage: 'Go to first page',
  previousPage: 'Go to previous page',
  nextPage: 'Go to next page',
  lastPage: 'Go to last page',
  page: (page) => `Go to page ${page}`,
  pageOf: (page, totalPages) => `Page ${page} of ${totalPages}`,
  morePages: 'More pages',
}

export type PaginationControlsProps = {
  /** One-based page number, matching the URL/API vocabulary used by app pages. */
  currentPage: number
  pageSize: number
  /** The total item count. Omit it for cursor APIs that do not report one. */
  total?: number
  /** A finite page count, or -1 when the API does not know where the list ends. */
  pageCount?: number
  /** Lets a cursor-based parent stop forward navigation without inventing a total. */
  hasNextPage?: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  pageSizeOptions?: number[]
  showTotal?: boolean
  /** Number of adjacent pages to show around the active page. */
  siblingCount?: number
  showFirstLast?: boolean
  labels?: Partial<PaginationControlsLabels>
  className?: string
  /** Optional content aligned with the result summary on the left side of the footer. */
  leadingContent?: ReactNode
}

const interpolate = (template: string, values: Record<string, number>) =>
  template.replace(/\{(start|end|total)\}/g, (_, key: 'start' | 'end' | 'total') =>
    String(values[key]),
  )

type PageItem = number | 'start-ellipsis' | 'end-ellipsis'

export function getPageItems(currentPage: number, pageCount: number, siblingCount = 1): PageItem[] {
  if (pageCount <= 0) return []
  const windowSize = siblingCount * 2 + 5
  if (pageCount <= windowSize) return Array.from({ length: pageCount }, (_, index) => index + 1)

  const start = Math.max(2, currentPage - siblingCount)
  const end = Math.min(pageCount - 1, currentPage + siblingCount)
  const items: PageItem[] = [1]

  if (start > 2) items.push('start-ellipsis')
  for (let page = start; page <= end; page += 1) items.push(page)
  if (end < pageCount - 1) items.push('end-ellipsis')

  items.push(pageCount)
  return items
}

export function PaginationControls({
  currentPage,
  pageSize,
  total,
  pageCount,
  hasNextPage,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showTotal = true,
  siblingCount = 1,
  showFirstLast = true,
  labels,
  className,
  leadingContent,
}: PaginationControlsProps) {
  const copy = { ...defaultLabels, ...labels }
  const inferredPageCount = total === undefined ? undefined : Math.ceil(total / pageSize)
  const knownPageCount = pageCount === -1 ? undefined : (pageCount ?? inferredPageCount)
  const safePageCount = knownPageCount === undefined ? undefined : Math.max(knownPageCount, 1)
  const safeCurrentPage =
    safePageCount === undefined
      ? Math.max(currentPage, 1)
      : Math.min(Math.max(currentPage, 1), safePageCount)
  const start = total && total > 0 ? (safeCurrentPage - 1) * pageSize + 1 : 0
  const end = total === undefined ? 0 : Math.min(safeCurrentPage * pageSize, total)
  const canGoPrevious = safeCurrentPage > 1
  const canGoNext = hasNextPage ?? (safePageCount === undefined || safeCurrentPage < safePageCount)
  const pages =
    safePageCount === undefined ? [] : getPageItems(safeCurrentPage, safePageCount, siblingCount)

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t bg-muted/[0.18] px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      {(showTotal || leadingContent) && (
        <div className="order-2 flex items-center gap-3 text-sm text-muted-foreground sm:order-1">
          {showTotal && (
            <span>
              {total === undefined
                ? safePageCount === undefined
                  ? copy.page(safeCurrentPage)
                  : copy.pageOf(safeCurrentPage, safePageCount)
                : total > 0
                  ? interpolate(copy.showingResults, { start, end, total })
                  : copy.noResults}
            </span>
          )}
          {leadingContent}
        </div>
      )}
      <div className="order-1 flex flex-wrap items-center justify-between gap-3 sm:order-2 sm:justify-end">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="text-sm text-muted-foreground">{copy.rowsPerPage}</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => value !== null && onPageSizeChange(Number(value))}
          >
            <SelectTrigger size="sm" className="w-[70px]" aria-label={copy.rowsPerPage}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <nav aria-label="Pagination" className="flex items-center gap-0.5">
          {showFirstLast && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onPageChange(1)}
              disabled={!canGoPrevious}
              aria-label={copy.firstPage}
            >
              <ChevronsLeft className="rtl:rotate-180" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onPageChange(safeCurrentPage - 1)}
            disabled={!canGoPrevious}
            aria-label={copy.previousPage}
          >
            <ChevronLeft className="rtl:rotate-180" />
          </Button>
          {pages.map((item) =>
            typeof item === 'number' ? (
              <Button
                key={item}
                variant={item === safeCurrentPage ? 'secondary' : 'ghost'}
                size="icon-sm"
                onClick={() => onPageChange(item)}
                aria-label={copy.page(item)}
                aria-current={item === safeCurrentPage ? 'page' : undefined}
              >
                {item}
              </Button>
            ) : (
              <span
                key={item}
                aria-label={copy.morePages}
                className="flex size-7 items-center justify-center text-sm text-muted-foreground"
              >
                …
              </span>
            ),
          )}
          {safePageCount === undefined && (
            <span className="px-1 text-sm tabular-nums text-muted-foreground">
              {safeCurrentPage}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onPageChange(safeCurrentPage + 1)}
            disabled={!canGoNext}
            aria-label={copy.nextPage}
          >
            <ChevronRight className="rtl:rotate-180" />
          </Button>
          {showFirstLast && safePageCount !== undefined && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onPageChange(safePageCount)}
              disabled={!canGoNext}
              aria-label={copy.lastPage}
            >
              <ChevronsRight className="rtl:rotate-180" />
            </Button>
          )}
        </nav>
      </div>
    </div>
  )
}

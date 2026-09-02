import type {
  Column as TableColumn,
  ColumnDef,
  Header as TableHeader,
  HeaderGroup as TableHeaderGroup,
  ReactTable,
  Row as TableRow,
  RowData,
  TableOptions,
} from '@tanstack/react-table'
import {
  columnOrderingFeature,
  columnPinningFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createExpandedRowModel,
  createPaginatedRowModel,
  flexRender,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import { Loader2, SearchX } from 'lucide-react'
import type { CSSProperties, MouseEvent as ReactMouseEvent, ReactNode } from 'react'
import { Fragment, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table as TablePrimitive,
  TableBody as TableBodyPrimitive,
  TableCell,
  TableHead as TableHeadPrimitive,
  TableHeader as TableHeaderPrimitive,
  TableRow as TableRowPrimitive,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

import { EmptyState } from '../empty-state'
import type { ColumnMeta, FilterContext } from './column-filter'
import { ColumnFilter } from './column-filter'
import { PaginationControls, type PaginationControlsLabels } from './pagination'

const dataTableFeatures = tableFeatures({
  columnOrderingFeature,
  columnPinningFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSortingFeature,
  expandedRowModel: createExpandedRowModel(),
  // Without a paginated row model TanStack v9 hands back every row, so a local (non-manual)
  // table would render the whole dataset under a footer that claims one page of it.
  paginatedRowModel: createPaginatedRowModel(),
})

/** @internal TanStack v9 threads this exact feature set through its invariant types. */
export type DataTableFeatures = typeof dataTableFeatures
export type {
  ColumnFilterMeta,
  ColumnMeta,
  FilterContext,
  FilterOption,
  FilterValues,
} from './column-filter'
type Table<TData extends RowData> = ReactTable<DataTableFeatures, TData>
type Column<TData extends RowData, TValue = unknown> = TableColumn<DataTableFeatures, TData, TValue>
type Header<TData extends RowData, TValue = unknown> = TableHeader<DataTableFeatures, TData, TValue>
type HeaderGroup<TData extends RowData> = TableHeaderGroup<DataTableFeatures, TData>
type Row<TData extends RowData> = TableRow<DataTableFeatures, TData>

/** Private timing detail of DataTable; app code should never depend on it. */
function useDelayedLoading(isLoading: boolean, delayMs = 150) {
  const [showLoading, setShowLoading] = useState(isLoading && delayMs <= 0)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!isLoading) {
      setShowLoading(false)
      return
    }
    if (delayMs <= 0) {
      setShowLoading(true)
      return
    }
    setShowLoading(false)
    const timeoutId = globalThis.setTimeout(() => setShowLoading(true), delayMs)
    return () => globalThis.clearTimeout(timeoutId)
  }, [delayMs, isLoading])

  return showLoading
}

export type RowWrapperProps<TData extends RowData> = React.HTMLAttributes<HTMLTableRowElement> & {
  row: Row<TData>
  children: React.ReactNode
}

export type TranslateHeader = (header: string, columnId: string) => ReactNode

// A real row click starts on one of the row's own cells. Anything else reaching
// the row handler came from a portal — Base UI renders dialogs, popovers and menus
// at <body>, but React events still bubble through the React tree, so a click
// inside an overlay opened from a cell arrives here too.
//
// Testing containment rather than "does the target sit inside an overlay" keeps
// the check fail-safe: if the clicked node has already been detached from the
// DOM, containment is false and the row simply does not fire, instead of a
// selector lookup coming back empty and letting the click through.
const startedInsideRow = (event: ReactMouseEvent<HTMLElement>) =>
  event.target instanceof Node && event.currentTarget.contains(event.target)

function getColumnAttributes<TData extends RowData>(column: Column<TData>) {
  const columnSet = [...column.columns, column]
  const isPinned = columnSet.map((c) => c.getIsPinned()).find((p) => p !== false) || false
  const isLastLeftPinnedColumn = columnSet.some(
    (c) => isPinned === 'start' && c.getIsLastColumn('start'),
  )
  const isFirstRightPinnedColumn = columnSet.some(
    (c) => isPinned === 'end' && c.getIsFirstColumn('end'),
  )
  return { isPinned, isLastLeftPinnedColumn, isFirstRightPinnedColumn }
}

function getHeaderAttributes<TData extends RowData, TValue>(
  header: Header<TData, TValue>,
  centerHeaders?: HeaderGroup<TData>[],
) {
  const isColumnId = (group: HeaderGroup<TData>, index: number) => {
    const headers = group?.headers || []
    return headers[index]?.id === header.id || headers[index]?.column?.id === header.column?.id
  }
  const isFirstUnpinnedColumn = centerHeaders?.some(
    (group, index) =>
      (index === 0 && isColumnId(group, 0)) || (index === 1 && isColumnId(group, 0)),
  )
  const isLastUnpinnedColumn = centerHeaders?.some(
    (group, index) =>
      (index === 0 && isColumnId(group, group.headers.length - 1)) ||
      (index === 1 && isColumnId(group, group.headers.length - 1)),
  )
  return { isFirstUnpinnedColumn, isLastUnpinnedColumn }
}

function getBodyAttributes<TData extends RowData, TValue>(
  header: Column<TData, TValue>,
  centerHeaders?: HeaderGroup<TData>[],
) {
  const isFirstUnpinnedColumn = centerHeaders?.some((group) => group.headers[0]?.id === header.id)
  const isLastUnpinnedColumn = centerHeaders?.some(
    (group) => group.headers[group.headers.length - 1]?.id === header.id,
  )
  return { isFirstUnpinnedColumn, isLastUnpinnedColumn }
}

function getCommonPinningStyles<TData extends RowData>(
  column: Column<TData>,
  pinnedIndex: number,
  isShadowTranslatedUpwards?: boolean,
): CSSProperties {
  const { isPinned, isLastLeftPinnedColumn, isFirstRightPinnedColumn } = getColumnAttributes(column)
  const leftValue =
    column.columns.length > 0
      ? `${column.columns[0]?.getStart('start')}px`
      : `${column.getStart('start')}px`
  return {
    boxShadow: isLastLeftPinnedColumn
      ? `8px ${isShadowTranslatedUpwards ? -6 : 8}px 15px 0px #0C71AC14`
      : isFirstRightPinnedColumn
        ? `-8px ${isShadowTranslatedUpwards ? -6 : 8}px 15px 0px #0C71AC14`
        : undefined,
    left: isPinned === 'start' ? leftValue : undefined,
    right: isPinned === 'end' ? `${column.getAfter('end')}px` : undefined,
    position: isPinned ? 'sticky' : 'relative',
    width: column.getSize(),
    zIndex: isPinned ? pinnedIndex : pinnedIndex - 1,
  }
}

function HeaderCell<TData extends RowData>({
  header,
  translateHeader,
}: {
  header: Header<TData, unknown>
  translateHeader?: TranslateHeader
}) {
  const definition = header.column.columnDef.header
  if (translateHeader && typeof definition === 'string') {
    return translateHeader(definition, header.column.id)
  }
  return flexRender(definition, header.getContext())
}

type HeadProps<TData extends RowData> = {
  table: Table<TData>
  filtering?: FilterContext
  translateHeader?: TranslateHeader
}

function TableHead<TData extends RowData>({ table, filtering, translateHeader }: HeadProps<TData>) {
  const totalColumns = table.getAllColumns().length
  const totalLeafColumns = table.getAllLeafColumns().length
  const centerHeaders = table.getCenterHeaderGroups()
  return (
    <TableHeaderPrimitive className="sticky top-0 z-10">
      {table.getHeaderGroups()?.map((headerGroup) => (
        <TableRowPrimitive key={headerGroup.id}>
          {headerGroup.headers.map((header, index) => {
            const { columnDef, parent, columns } = header.column
            const { isLastLeftPinnedColumn, isFirstRightPinnedColumn } = getColumnAttributes(
              header.column,
            )
            const { isFirstUnpinnedColumn, isLastUnpinnedColumn } = getHeaderAttributes(
              header,
              centerHeaders,
            )
            const columnIndex = header.column.getIndex()
            const siblingHeaders = header.column.parent?.columns || []
            const isLastGroupHeader =
              siblingHeaders?.findIndex((h) => h.id === header.id) === siblingHeaders.length - 1
            const meta = columnDef.meta as ColumnMeta | undefined
            const showFilter = !!meta?.filter && !!filtering
            const headerClassName = meta?.headerClassName
            return (
              <TableHeadPrimitive
                colSpan={header.colSpan}
                scope="col"
                key={header.id}
                style={{ ...getCommonPinningStyles(header.column, parent ? 9 : 10, true) }}
                className={cn(
                  'p-0 text-start text-sm font-light text-foreground',
                  headerClassName || 'bg-card',
                  (index === 0 || isFirstRightPinnedColumn) && !parent && 'rounded-ss-panel ps-2',
                  (index === totalColumns - 1 || isLastLeftPinnedColumn) &&
                    !parent &&
                    'rounded-se-panel pe-2',
                )}
              >
                <div
                  className={cn(
                    columns.length ? 'mt-2' : 'my-2 py-2',
                    !!parent && 'my-0 py-0 text-center',
                    (index === 0 || isFirstRightPinnedColumn || isFirstUnpinnedColumn) &&
                      'rounded-s-control',
                    (index === totalColumns - 1 ||
                      isLastLeftPinnedColumn ||
                      isLastUnpinnedColumn) &&
                      'rounded-e-control',
                    !parent && (headerClassName || 'bg-background'),
                    isFirstUnpinnedColumn && index !== 0 && 'ms-2',
                    isLastUnpinnedColumn && index !== totalColumns - 1 && 'me-2',
                  )}
                >
                  <div
                    className={cn(
                      'w-full px-3',
                      showFilter && 'flex justify-between',
                      !!columns.length && 'py-2',
                      !!parent && (isLastGroupHeader ? 'py-2.5' : 'my-1.5 py-0'),
                      !(
                        isLastLeftPinnedColumn ||
                        columnIndex === totalLeafColumns - 1 ||
                        isLastUnpinnedColumn
                      ) && 'border-e',
                    )}
                  >
                    {header.isPlaceholder ? null : (
                      <HeaderCell header={header} translateHeader={translateHeader} />
                    )}
                    {showFilter && <ColumnFilter column={header.column} filtering={filtering} />}
                  </div>
                  <div
                    className={cn(
                      'absolute bottom-0 left-0 right-0 h-[1px] bg-border/60',
                      !parent && 'hidden',
                      (columnIndex === totalLeafColumns - 1 ||
                        isLastLeftPinnedColumn ||
                        isLastUnpinnedColumn) &&
                        'right-2',
                      (columnIndex === 0 || isFirstRightPinnedColumn || isFirstUnpinnedColumn) &&
                        'left-2',
                    )}
                  ></div>
                </div>
              </TableHeadPrimitive>
            )
          })}
        </TableRowPrimitive>
      ))}
    </TableHeaderPrimitive>
  )
}

type BodyProps<TData extends RowData> = {
  table: Table<TData>
  onRowClick?: (row: Row<TData>) => void
  rowClassName?: (row: Row<TData>) => string
  RowWrapper?: React.ComponentType<RowWrapperProps<TData>>
  renderSubComponent?: (props: { row: Row<TData> }) => React.ReactElement
}

function TableBody<TData extends RowData>({
  table,
  onRowClick,
  rowClassName,
  RowWrapper,
  renderSubComponent,
}: BodyProps<TData>) {
  const totalColumns = table.getAllLeafColumns().length
  const pageSize = table.getRowModel().rows.length
  const centerHeaders = table.getCenterHeaderGroups()
  return (
    <TableBodyPrimitive className="text-sm">
      {table.getRowModel()?.rows.map((row, index) => {
        const rowProps = {
          className: cn('group bg-card', !!onRowClick && 'cursor-pointer', rowClassName?.(row)),
          onClick: (event: ReactMouseEvent<HTMLElement>) => {
            // Clicks inside a dialog/popover opened from one of this row's cells would
            // otherwise navigate away underneath the open overlay. DialogContent used to stop
            // propagation itself; it can't any more (see dialog.tsx), so filter by origin here.
            if (!startedInsideRow(event)) return
            if (onRowClick) onRowClick(row)
          },
        }
        const cells = row.getVisibleCells().map((cell) => {
          const { columnDef } = cell.column
          const columnIndex = cell.column.getIndex()
          const { isLastLeftPinnedColumn, isFirstRightPinnedColumn } = getColumnAttributes(
            cell.column,
          )
          const { isFirstUnpinnedColumn, isLastUnpinnedColumn } = getBodyAttributes(
            cell.column,
            centerHeaders,
          )
          const cellClassName = (columnDef.meta as ColumnMeta | undefined)?.cellClassName
          return (
            <TableCell
              key={cell.id}
              style={{ ...getCommonPinningStyles(cell.column, 4) }}
              className={cn(
                'relative min-h-20 p-0',
                !rowClassName && !cellClassName && 'bg-card',
                cellClassName,
                index === pageSize - 1 && isLastLeftPinnedColumn && 'rounded-ee-panel',
                index === pageSize - 1 && isFirstRightPinnedColumn && 'rounded-bl-panel',
              )}
            >
              <div className="w-full p-3 py-2.5">
                {flexRender(columnDef.cell, cell.getContext())}
              </div>
              <div
                className={cn(
                  'absolute bottom-0 left-0 right-0 bg-background',
                  !row.getIsExpanded() && 'h-[1px]',
                  index === pageSize - 1 && 'hidden',
                  (columnIndex === totalColumns - 1 ||
                    isLastLeftPinnedColumn ||
                    isLastUnpinnedColumn) &&
                    'right-2',
                  (columnIndex === 0 || isFirstRightPinnedColumn || isFirstUnpinnedColumn) &&
                    'left-2',
                )}
              ></div>
            </TableCell>
          )
        })
        return (
          <Fragment key={row.id}>
            {RowWrapper ? (
              <RowWrapper row={row} {...rowProps}>
                {cells}
              </RowWrapper>
            ) : (
              <TableRowPrimitive {...rowProps}>{cells}</TableRowPrimitive>
            )}
            {row.getIsExpanded() && !!renderSubComponent && (
              <TableRowPrimitive className="border-b">
                <TableCell colSpan={row.getVisibleCells().length}>
                  {renderSubComponent({ row })}
                </TableCell>
              </TableRowPrimitive>
            )}
          </Fragment>
        )
      })}
    </TableBodyPrimitive>
  )
}

function TableLoadingBody<TData extends RowData>({
  table,
  rowCount,
}: {
  table: Table<TData>
  rowCount: number
}) {
  const columns = table.getVisibleLeafColumns()
  const centerHeaders = table.getCenterHeaderGroups()
  return (
    <TableBodyPrimitive className="text-sm">
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <TableRowPrimitive key={`skeleton-row-${rowIndex}`} className="bg-card">
          {columns.map((column, columnIndex) => {
            const { isLastLeftPinnedColumn, isFirstRightPinnedColumn } = getColumnAttributes(column)
            const { isFirstUnpinnedColumn, isLastUnpinnedColumn } = getBodyAttributes(
              column,
              centerHeaders,
            )
            return (
              <TableCell
                key={`skeleton-cell-${column.id}-${rowIndex}`}
                style={{ ...getCommonPinningStyles(column, 4) }}
                className={cn(
                  'relative min-h-20 bg-card p-0',
                  rowIndex === rowCount - 1 && isLastLeftPinnedColumn && 'rounded-ee-panel',
                  rowIndex === rowCount - 1 && isFirstRightPinnedColumn && 'rounded-bl-panel',
                )}
              >
                <div className="w-full p-3 py-2.5">
                  <Skeleton className={cn('h-4', columnIndex === 0 ? 'w-32' : 'w-full')} />
                </div>
                <div
                  className={cn(
                    'absolute bottom-0 left-0 right-0 h-[1px] bg-background',
                    rowIndex === rowCount - 1 && 'hidden',
                    (columnIndex === columns.length - 1 ||
                      isLastLeftPinnedColumn ||
                      isLastUnpinnedColumn) &&
                      'right-2',
                    (columnIndex === 0 || isFirstRightPinnedColumn || isFirstUnpinnedColumn) &&
                      'left-2',
                  )}
                ></div>
              </TableCell>
            )
          })}
        </TableRowPrimitive>
      ))}
    </TableBodyPrimitive>
  )
}

export type DataTableColumn<TData extends RowData> = ColumnDef<DataTableFeatures, TData>
export type { PaginationControlsLabels, PaginationControlsProps } from './pagination'
export { PaginationControls } from './pagination'

type DataTableOptions<TData extends RowData> = Omit<
  TableOptions<DataTableFeatures, TData>,
  'columns' | 'data' | 'features'
>

export type DataTableProps<TData extends RowData> = DataTableOptions<TData> & {
  data: TData[]
  columns: DataTableColumn<TData>[]
  onRowClick?: (row: Row<TData>) => void
  renderSubComponent?: (props: { row: Row<TData> }) => React.ReactElement
  className?: string
  rowClassName?: (row: Row<TData>) => string
  style?: CSSProperties
  loading?: boolean
  loadingMode?: 'skeleton' | 'overlay'
  loadingRowCount?: number
  heightAuto?: boolean
  filtering?: FilterContext
  RowWrapper?: React.ComponentType<RowWrapperProps<TData>>
  translateHeader?: TranslateHeader
  clearFiltersLabel?: string
  loadingLabel?: string
  EmptyComponent?: React.ComponentType
  LoadingComponent?: React.ComponentType
  /**
   * Adds the standard NETIX list footer. Pass `state.pagination` and
   * `onPaginationChange` to make it fully controlled; manual/server tables also
   * pass `rowCount` (or `pageCount: -1` for cursor APIs) through the table props.
   */
  pagination?: {
    pageSizeOptions?: number[]
    showTotal?: boolean
    siblingCount?: number
    showFirstLast?: boolean
    /** Use when the API's total lives somewhere other than TanStack's `rowCount`. */
    total?: number
    /** Use with `pageCount: -1` to stop a cursor-based list at its final response. */
    hasNextPage?: boolean
    labels?: Partial<PaginationControlsLabels>
    className?: string
  }
}

export function DataTable<TData extends RowData>({
  data,
  columns,
  onRowClick,
  renderSubComponent,
  className,
  rowClassName,
  style,
  loading,
  loadingMode = 'skeleton',
  loadingRowCount = 8,
  heightAuto,
  filtering,
  RowWrapper,
  translateHeader,
  clearFiltersLabel = 'Clear filters',
  loadingLabel = 'Loading',
  EmptyComponent = EmptyState,
  LoadingComponent,
  pagination,
  ...tableOptions
}: DataTableProps<TData>) {
  const table = useTable({ ...tableOptions, features: dataTableFeatures, data, columns })
  const showLoading = useDelayedLoading(!!loading, loadingMode === 'overlay' ? 0 : 150)
  const showSkeletonRows = loadingMode === 'skeleton' && !!loading && showLoading
  const showLoadingOverlay = loadingMode === 'overlay' && !!loading && showLoading
  const hasFilters = !!filtering && Object.keys(filtering.filters ?? {}).length > 0
  const clearFiltersButton = hasFilters ? (
    <Button
      variant="secondary"
      className="pointer-events-auto text-sm"
      onClick={() => filtering.updateFilters({})}
    >
      <SearchX className="h-4 w-4" />
      {clearFiltersLabel}
    </Button>
  ) : null

  return (
    <div className={cn('relative flex flex-col overflow-hidden rounded-panel bg-card', className)}>
      {/* The scroller gets its own relative box so the loading scrim can match it exactly:
          a fixed-height table hands the box the leftover space above the footer, and an
          auto-height one lets the rows size it. */}
      <div className={cn('relative', !heightAuto && 'min-h-0 flex-1')}>
        <div className={cn('isolate overflow-auto', !heightAuto && 'h-full')}>
          <TablePrimitive
            style={{ width: table.getTotalSize(), minWidth: '100%', ...style }}
            className="isolate border-separate"
            cellSpacing={0}
            border={0}
          >
            <TableHead table={table} filtering={filtering} translateHeader={translateHeader} />
            {!showSkeletonRows && (
              <TableBody
                table={table}
                onRowClick={onRowClick}
                rowClassName={rowClassName}
                RowWrapper={RowWrapper}
                renderSubComponent={renderSubComponent}
              />
            )}
            {showSkeletonRows && <TableLoadingBody table={table} rowCount={loadingRowCount} />}
          </TablePrimitive>
          {!loading && !table.getRowModel().rows.length && (
            <div className="pointer-events-none sticky inset-0 flex flex-col items-center gap-2">
              <EmptyComponent />
              {!pagination && clearFiltersButton}
            </div>
          )}
        </div>
        {/* A sibling of the scroller, not a child: inside it the scrim would scroll away with
            the rows and stop short of the table's real edges. */}
        {showLoadingOverlay && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-background/55 backdrop-blur-[1px]">
            {LoadingComponent ? (
              <LoadingComponent />
            ) : (
              <span
                role="status"
                aria-live="polite"
                aria-busy="true"
                aria-label={loadingLabel}
                data-slot="data-table-loading"
                className="flex items-center gap-2 rounded-control border bg-card px-3 py-2 text-sm text-secondary-foreground shadow-md"
              >
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                {loadingLabel}
              </span>
            )}
          </div>
        )}
      </div>
      {pagination && (
        <PaginationControls
          currentPage={(table.state.pagination?.pageIndex ?? 0) + 1}
          pageSize={table.state.pagination?.pageSize ?? pagination.pageSizeOptions?.[0] ?? 10}
          total={pagination.total ?? table.options.rowCount ?? table.getRowCount()}
          pageCount={table.getPageCount()}
          hasNextPage={pagination.hasNextPage}
          onPageChange={(page) => table.setPageIndex(page - 1)}
          onPageSizeChange={(size) => table.setPageSize(size)}
          pageSizeOptions={pagination.pageSizeOptions}
          showTotal={pagination.showTotal}
          siblingCount={pagination.siblingCount}
          showFirstLast={pagination.showFirstLast}
          labels={pagination.labels}
          className={pagination.className}
          leadingContent={clearFiltersButton}
        />
      )}
    </div>
  )
}

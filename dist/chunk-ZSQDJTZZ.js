import { EmptyState } from './chunk-AHXMDN26.js';
import { ColumnFilter } from './chunk-UVB47YIA.js';
import { LoadingState } from './chunk-6DAOUNLS.js';
import { Skeleton } from './chunk-RZV64JII.js';
import { Button } from './chunk-BYN4QE7U.js';
import { cn } from './chunk-UIWDNVTY.js';
import { flexRender } from '@tanstack/react-table';
import { SearchX } from 'lucide-react';
import { useState, useEffect, Fragment } from 'react';
import { jsx, jsxs } from 'react/jsx-runtime';

function useDelayedLoading(isLoading, delayMs = 150) {
  const [showLoading, setShowLoading] = useState(isLoading && delayMs <= 0);
  useEffect(() => {
    if (!isLoading) {
      setShowLoading(false);
      return;
    }
    if (delayMs <= 0) {
      setShowLoading(true);
      return;
    }
    setShowLoading(false);
    const timeoutId = globalThis.setTimeout(() => setShowLoading(true), delayMs);
    return () => globalThis.clearTimeout(timeoutId);
  }, [delayMs, isLoading]);
  return showLoading;
}
var startedInsideRow = (event) => event.target instanceof Node && event.currentTarget.contains(event.target);
function getColumnAttributes(column) {
  const columnSet = [...column.columns, column];
  const isPinned = columnSet.map((c) => c.getIsPinned()).find((p) => p !== false) || false;
  const isLastLeftPinnedColumn = columnSet.some(
    (c) => isPinned === "start" && c.getIsLastColumn("start")
  );
  const isFirstRightPinnedColumn = columnSet.some(
    (c) => isPinned === "end" && c.getIsFirstColumn("end")
  );
  return { isPinned, isLastLeftPinnedColumn, isFirstRightPinnedColumn };
}
function getHeaderAttributes(header, centerHeaders) {
  const isColumnId = (group, index) => {
    const headers = group?.headers || [];
    return headers[index]?.id === header.id || headers[index]?.column?.id === header.column?.id;
  };
  const isFirstUnpinnedColumn = centerHeaders?.some(
    (group, index) => index === 0 && isColumnId(group, 0) || index === 1 && isColumnId(group, 0)
  );
  const isLastUnpinnedColumn = centerHeaders?.some(
    (group, index) => index === 0 && isColumnId(group, group.headers.length - 1) || index === 1 && isColumnId(group, group.headers.length - 1)
  );
  return { isFirstUnpinnedColumn, isLastUnpinnedColumn };
}
function getBodyAttributes(header, centerHeaders) {
  const isFirstUnpinnedColumn = centerHeaders?.some((group) => group.headers[0]?.id === header.id);
  const isLastUnpinnedColumn = centerHeaders?.some(
    (group) => group.headers[group.headers.length - 1]?.id === header.id
  );
  return { isFirstUnpinnedColumn, isLastUnpinnedColumn };
}
function getCommonPinningStyles(column, pinnedIndex, isShadowTranslatedUpwards) {
  const { isPinned, isLastLeftPinnedColumn, isFirstRightPinnedColumn } = getColumnAttributes(column);
  const leftValue = column.columns.length > 0 ? `${column.columns[0]?.getStart("start")}px` : `${column.getStart("start")}px`;
  return {
    boxShadow: isLastLeftPinnedColumn ? `8px ${isShadowTranslatedUpwards ? -6 : 8}px 15px 0px #0C71AC14` : isFirstRightPinnedColumn ? `-8px ${isShadowTranslatedUpwards ? -6 : 8}px 15px 0px #0C71AC14` : void 0,
    left: isPinned === "start" ? leftValue : void 0,
    right: isPinned === "end" ? `${column.getAfter("end")}px` : void 0,
    position: isPinned ? "sticky" : "relative",
    width: column.getSize(),
    zIndex: isPinned ? pinnedIndex : pinnedIndex - 1
  };
}
function HeaderCell({
  header,
  translateHeader
}) {
  const definition = header.column.columnDef.header;
  if (translateHeader && typeof definition === "string") {
    return translateHeader(definition, header.column.id);
  }
  return flexRender(definition, header.getContext());
}
function TableHead({ table, filtering, translateHeader }) {
  const totalColumns = table.getAllColumns().length;
  const totalLeafColumns = table.getAllLeafColumns().length;
  const centerHeaders = table.getCenterHeaderGroups();
  return /* @__PURE__ */ jsx("thead", { className: "sticky top-0 z-10", children: table.getHeaderGroups()?.map((headerGroup) => /* @__PURE__ */ jsx("tr", { children: headerGroup.headers.map((header, index) => {
    const { columnDef, parent, columns } = header.column;
    const { isLastLeftPinnedColumn, isFirstRightPinnedColumn } = getColumnAttributes(
      header.column
    );
    const { isFirstUnpinnedColumn, isLastUnpinnedColumn } = getHeaderAttributes(
      header,
      centerHeaders
    );
    const columnIndex = header.column.getIndex();
    const siblingHeaders = header.column.parent?.columns || [];
    const isLastGroupHeader = siblingHeaders?.findIndex((h) => h.id === header.id) === siblingHeaders.length - 1;
    const meta = columnDef.meta;
    const showFilter = !!meta?.filter && !!filtering;
    const headerClassName = meta?.headerClassName;
    return /* @__PURE__ */ jsx(
      "th",
      {
        colSpan: header.colSpan,
        scope: "col",
        style: { ...getCommonPinningStyles(header.column, parent ? 9 : 10, true) },
        className: cn(
          "p-0 text-start text-sm font-light text-foreground",
          headerClassName || "bg-card",
          (index === 0 || isFirstRightPinnedColumn) && !parent && "rounded-ss-card ps-2",
          (index === totalColumns - 1 || isLastLeftPinnedColumn) && !parent && "rounded-se-card pe-2"
        ),
        children: /* @__PURE__ */ jsxs(
          "div",
          {
            className: cn(
              columns.length ? "mt-2" : "my-2 py-2",
              !!parent && "my-0 py-0 text-center",
              (index === 0 || isFirstRightPinnedColumn || isFirstUnpinnedColumn) && "rounded-s-xl",
              (index === totalColumns - 1 || isLastLeftPinnedColumn || isLastUnpinnedColumn) && "rounded-e-xl",
              !parent && (headerClassName || "bg-background"),
              isFirstUnpinnedColumn && index !== 0 && "ms-2",
              isLastUnpinnedColumn && index !== totalColumns - 1 && "me-2"
            ),
            children: [
              /* @__PURE__ */ jsxs(
                "div",
                {
                  className: cn(
                    "w-full px-3",
                    showFilter && "flex justify-between",
                    !!columns.length && "py-2",
                    !!parent && (isLastGroupHeader ? "py-2.5" : "my-1.5 py-0"),
                    !(isLastLeftPinnedColumn || columnIndex === totalLeafColumns - 1 || isLastUnpinnedColumn) && "border-e"
                  ),
                  children: [
                    header.isPlaceholder ? null : /* @__PURE__ */ jsx(HeaderCell, { header, translateHeader }),
                    showFilter && /* @__PURE__ */ jsx(
                      ColumnFilter,
                      {
                        column: header.column,
                        filtering
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: cn(
                    "absolute bottom-0 left-0 right-0 h-[1px] bg-border/60",
                    !parent && "hidden",
                    (columnIndex === totalLeafColumns - 1 || isLastLeftPinnedColumn || isLastUnpinnedColumn) && "right-2",
                    (columnIndex === 0 || isFirstRightPinnedColumn || isFirstUnpinnedColumn) && "left-2"
                  )
                }
              )
            ]
          }
        )
      },
      header.id
    );
  }) }, headerGroup.id)) });
}
function TableBody({
  table,
  onRowClick,
  rowClassName,
  RowWrapper,
  renderSubComponent
}) {
  const totalColumns = table.getAllLeafColumns().length;
  const pageSize = table.getRowModel().rows.length;
  const centerHeaders = table.getCenterHeaderGroups();
  return /* @__PURE__ */ jsx("tbody", { className: "text-sm", children: table.getRowModel()?.rows.map((row, index) => {
    const rowProps = {
      className: cn("group bg-card", !!onRowClick && "cursor-pointer", rowClassName?.(row)),
      onClick: (event) => {
        if (!startedInsideRow(event)) return;
        if (onRowClick) onRowClick(row);
      }
    };
    const cells = row.getVisibleCells().map((cell) => {
      const { columnDef } = cell.column;
      const columnIndex = cell.column.getIndex();
      const { isLastLeftPinnedColumn, isFirstRightPinnedColumn } = getColumnAttributes(
        cell.column
      );
      const { isFirstUnpinnedColumn, isLastUnpinnedColumn } = getBodyAttributes(
        cell.column,
        centerHeaders
      );
      const cellClassName = columnDef.meta?.cellClassName;
      return /* @__PURE__ */ jsxs(
        "td",
        {
          style: { ...getCommonPinningStyles(cell.column, 4) },
          className: cn(
            "relative min-h-20 p-0",
            !rowClassName && !cellClassName && "bg-card",
            cellClassName,
            index === pageSize - 1 && isLastLeftPinnedColumn && "rounded-ee-card",
            index === pageSize - 1 && isFirstRightPinnedColumn && "rounded-bl-card"
          ),
          children: [
            /* @__PURE__ */ jsx("div", { className: "w-full p-3 py-2.5", children: flexRender(columnDef.cell, cell.getContext()) }),
            /* @__PURE__ */ jsx(
              "div",
              {
                className: cn(
                  "absolute bottom-0 left-0 right-0 bg-background",
                  !row.getIsExpanded() && "h-[1px]",
                  index === pageSize - 1 && "hidden",
                  (columnIndex === totalColumns - 1 || isLastLeftPinnedColumn || isLastUnpinnedColumn) && "right-2",
                  (columnIndex === 0 || isFirstRightPinnedColumn || isFirstUnpinnedColumn) && "left-2"
                )
              }
            )
          ]
        },
        cell.id
      );
    });
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      RowWrapper ? /* @__PURE__ */ jsx(RowWrapper, { row, ...rowProps, children: cells }) : /* @__PURE__ */ jsx("tr", { ...rowProps, children: cells }),
      row.getIsExpanded() && !!renderSubComponent && /* @__PURE__ */ jsx("tr", { className: "border-b", children: /* @__PURE__ */ jsx("td", { colSpan: row.getVisibleCells().length, children: renderSubComponent({ row }) }) })
    ] }, row.id);
  }) });
}
function TableLoadingBody({
  table,
  rowCount
}) {
  const columns = table.getVisibleLeafColumns();
  const centerHeaders = table.getCenterHeaderGroups();
  return /* @__PURE__ */ jsx("tbody", { className: "text-sm", children: Array.from({ length: rowCount }).map((_, rowIndex) => /* @__PURE__ */ jsx("tr", { className: "bg-card", children: columns.map((column, columnIndex) => {
    const { isLastLeftPinnedColumn, isFirstRightPinnedColumn } = getColumnAttributes(column);
    const { isFirstUnpinnedColumn, isLastUnpinnedColumn } = getBodyAttributes(
      column,
      centerHeaders
    );
    return /* @__PURE__ */ jsxs(
      "td",
      {
        style: { ...getCommonPinningStyles(column, 4) },
        className: cn(
          "relative min-h-20 bg-card p-0",
          rowIndex === rowCount - 1 && isLastLeftPinnedColumn && "rounded-ee-card",
          rowIndex === rowCount - 1 && isFirstRightPinnedColumn && "rounded-bl-card"
        ),
        children: [
          /* @__PURE__ */ jsx("div", { className: "w-full p-3 py-2.5", children: /* @__PURE__ */ jsx(
            Skeleton,
            {
              variant: "text",
              className: cn("h-4", columnIndex === 0 ? "w-32" : "w-full")
            }
          ) }),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: cn(
                "absolute bottom-0 left-0 right-0 h-[1px] bg-background",
                rowIndex === rowCount - 1 && "hidden",
                (columnIndex === columns.length - 1 || isLastLeftPinnedColumn || isLastUnpinnedColumn) && "right-2",
                (columnIndex === 0 || isFirstRightPinnedColumn || isFirstUnpinnedColumn) && "left-2"
              )
            }
          )
        ]
      },
      `skeleton-cell-${column.id}-${rowIndex}`
    );
  }) }, `skeleton-row-${rowIndex}`)) });
}
function DataTable({
  table,
  onRowClick,
  renderSubComponent,
  className,
  rowClassName,
  style,
  loading,
  loadingMode = "skeleton",
  loadingRowCount = 8,
  heightAuto,
  filtering,
  RowWrapper,
  translateHeader,
  clearFiltersLabel = "Clear filters",
  EmptyComponent = EmptyState,
  LoadingComponent
}) {
  const showLoading = useDelayedLoading(!!loading, loadingMode === "overlay" ? 0 : 150);
  const showSkeletonRows = loadingMode === "skeleton" && !!loading && showLoading;
  const showLoadingOverlay = loadingMode === "overlay" && !!loading && showLoading;
  const hasFilters = !!filtering && Object.keys(filtering.filters ?? {}).length > 0;
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "relative overflow-hidden rounded-card border border-border/60 bg-card",
        className
      ),
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: cn(
            "isolate overflow-auto",
            !heightAuto && "absolute bottom-0 left-0 right-0 top-0"
          ),
          children: [
            /* @__PURE__ */ jsxs(
              "table",
              {
                style: { width: table.getTotalSize(), minWidth: "100%", ...style },
                className: "isolate border-separate",
                cellSpacing: 0,
                border: 0,
                children: [
                  /* @__PURE__ */ jsx(TableHead, { table, filtering, translateHeader }),
                  !showSkeletonRows && /* @__PURE__ */ jsx(
                    TableBody,
                    {
                      table,
                      onRowClick,
                      rowClassName,
                      RowWrapper,
                      renderSubComponent
                    }
                  ),
                  showSkeletonRows && /* @__PURE__ */ jsx(TableLoadingBody, { table, rowCount: loadingRowCount })
                ]
              }
            ),
            showLoadingOverlay && /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-0 m-0 p-3", children: LoadingComponent ? /* @__PURE__ */ jsx(LoadingComponent, {}) : /* @__PURE__ */ jsx(
              LoadingState,
              {
                variant: "table",
                rows: 6,
                className: "h-full rounded-lg bg-card/70 p-3 backdrop-blur-[1px]"
              }
            ) }),
            !loading && !table.getRowModel().rows.length && /* @__PURE__ */ jsxs("div", { className: "pointer-events-none sticky inset-0 flex flex-col items-center gap-2", children: [
              /* @__PURE__ */ jsx(EmptyComponent, {}),
              hasFilters && /* @__PURE__ */ jsxs(
                Button,
                {
                  variant: "secondary",
                  className: "pointer-events-auto mt-2 text-sm",
                  onClick: () => filtering.updateFilters({}),
                  children: [
                    /* @__PURE__ */ jsx(SearchX, { className: "h-4 w-4" }),
                    clearFiltersLabel
                  ]
                }
              )
            ] })
          ]
        }
      )
    }
  );
}

export { DataTable };

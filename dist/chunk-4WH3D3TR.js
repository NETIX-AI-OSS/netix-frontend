import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from './chunk-6ODRIWA7.js';
import { Button } from './chunk-BYN4QE7U.js';
import { cn } from './chunk-UIWDNVTY.js';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { jsxs, jsx } from 'react/jsx-runtime';

var ELLIPSIS = "getPages";
function PaginationControls({
  table,
  className,
  showTotalCount = false,
  totalCountLabel,
  pageSizeOptions = [10, 25, 50, 100],
  pageSizePlaceholder = "Page size",
  pageLabel = "page"
}) {
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();
  const totalRows = table.getRowCount();
  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    if (totalPages <= showPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const addPages = (from, to) => {
      for (let i = from; i <= to; i++) {
        pages.push(i);
      }
    };
    pages.push(1);
    let start = currentPage - 1;
    let end = currentPage + 1;
    if (currentPage <= 3) {
      start = 2;
      end = 4;
    } else if (currentPage >= totalPages - 2) {
      start = totalPages - 3;
      end = totalPages - 1;
    }
    if (start > 2) pages.push(ELLIPSIS);
    addPages(start, end);
    if (end < totalPages - 1) pages.push(ELLIPSIS);
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };
  return /* @__PURE__ */ jsxs("div", { className: cn("flex items-center gap-1", className), children: [
    showTotalCount && totalCountLabel && /* @__PURE__ */ jsxs("span", { className: "me-4 text-sm text-secondary-foreground", children: [
      totalCountLabel,
      ": ",
      /* @__PURE__ */ jsx("span", { className: "font-semibold", children: totalRows ?? 0 })
    ] }),
    /* @__PURE__ */ jsx(
      Button,
      {
        variant: "ghost",
        size: "icon",
        className: "h-8 w-8 bg-card",
        "aria-label": "Previous page",
        onClick: () => table.previousPage(),
        disabled: !table.getCanPreviousPage(),
        children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-4 w-4 text-secondary-foreground" })
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: getPageNumbers().map(
      (page, idx) => page === ELLIPSIS ? /* @__PURE__ */ jsx(
        "span",
        {
          className: "rounded-md bg-card px-3 py-1 text-secondary-foreground",
          children: "..."
        },
        `ellipsis-${idx}`
      ) : /* @__PURE__ */ jsx(
        Button,
        {
          variant: currentPage === page ? "secondary" : "ghost",
          className: cn(
            "h-8 min-w-8 bg-card p-0 px-2 text-secondary-foreground",
            currentPage === page && "bg-primary/10 text-primary"
          ),
          onClick: () => table.setPageIndex(Number(page) - 1),
          children: page
        },
        page
      )
    ) }),
    /* @__PURE__ */ jsx(
      Button,
      {
        variant: "ghost",
        size: "icon",
        className: "h-8 w-8 bg-card",
        "aria-label": "Next page",
        onClick: () => table.nextPage(),
        disabled: !table.getCanNextPage(),
        children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4 text-secondary-foreground" })
      }
    ),
    /* @__PURE__ */ jsxs(
      Select,
      {
        value: String(table.getState().pagination.pageSize),
        onValueChange: (v) => table.setPageSize(Number(v)),
        children: [
          /* @__PURE__ */ jsx(SelectTrigger, { className: "w-28 bg-card", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: pageSizePlaceholder }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: /* @__PURE__ */ jsx(SelectGroup, { children: pageSizeOptions.map((pageSize) => /* @__PURE__ */ jsxs(SelectItem, { value: String(pageSize), children: [
            pageSize,
            " / ",
            pageLabel
          ] }, pageSize)) }) })
        ]
      }
    )
  ] });
}

export { PaginationControls };

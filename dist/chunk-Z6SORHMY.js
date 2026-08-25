import { cn } from './chunk-UIWDNVTY.js';
import { Loader2, ChevronRight } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { jsx, jsxs } from 'react/jsx-runtime';

var DEFAULT_LABELS = {
  collapse: (label) => `Collapse ${label}`,
  expand: (label) => `Expand ${label}`,
  loadingChildren: "Loading children...",
  noChildNodes: "No child nodes"
};
var collectAllExpandableIds = (items, bag) => {
  items.forEach((item) => {
    if (item.hasChildren ?? Boolean(item.children?.length)) {
      bag.add(item.id);
    }
    if (item.children?.length) {
      collectAllExpandableIds(item.children, bag);
    }
  });
};
var collectAllIds = (items, bag) => {
  items.forEach((item) => {
    bag.add(item.id);
    if (item.children?.length) {
      collectAllIds(item.children, bag);
    }
  });
};
var TreeView = ({
  items,
  selectedId,
  onItemSelect,
  onItemToggle,
  className,
  emptyText = "No data",
  defaultExpandAll = true,
  loadingItemIds = [],
  labels
}) => {
  const l = { ...DEFAULT_LABELS, ...labels };
  const initialExpanded = useMemo(() => {
    if (!defaultExpandAll) return /* @__PURE__ */ new Set();
    const bag = /* @__PURE__ */ new Set();
    collectAllExpandableIds(items, bag);
    return bag;
  }, [defaultExpandAll, items]);
  const loadingIdSet = useMemo(() => new Set(loadingItemIds), [loadingItemIds]);
  const [expandedIds, setExpandedIds] = useState(initialExpanded);
  useEffect(() => {
    if (defaultExpandAll) {
      setExpandedIds(initialExpanded);
      return;
    }
    setExpandedIds((prev) => {
      const validIds = /* @__PURE__ */ new Set();
      collectAllIds(items, validIds);
      const next = /* @__PURE__ */ new Set();
      prev.forEach((id) => {
        if (validIds.has(id)) {
          next.add(id);
        }
      });
      return next;
    });
  }, [defaultExpandAll, initialExpanded, items]);
  const toggleNode = (item) => {
    const nextExpanded = !expandedIds.has(item.id);
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.add(item.id);
      }
      return next;
    });
    onItemToggle?.(item, nextExpanded);
  };
  const renderItems = (nodes, depth = 0) => /* @__PURE__ */ jsx(
    "ul",
    {
      role: depth === 0 ? "tree" : "group",
      className: cn("space-y-1", depth === 0 ? "" : "mt-1 ps-4"),
      children: nodes.map((item) => {
        const hasChildren = item.hasChildren ?? Boolean(item.children?.length);
        const isExpanded = expandedIds.has(item.id);
        const isSelected = selectedId === item.id;
        const isLoading = loadingIdSet.has(item.id);
        const isChildrenLoaded = item.childrenLoaded ?? true;
        return /* @__PURE__ */ jsxs(
          "li",
          {
            role: "treeitem",
            "aria-expanded": hasChildren ? isExpanded : void 0,
            "aria-selected": isSelected,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                hasChildren ? /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    className: "h-7 w-7 rounded-md border border-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    onClick: () => toggleNode(item),
                    "aria-label": isExpanded ? l.collapse(item.label) : l.expand(item.label),
                    children: isLoading ? /* @__PURE__ */ jsx(Loader2, { className: "mx-auto h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(
                      ChevronRight,
                      {
                        className: cn(
                          "mx-auto h-4 w-4 transition-transform",
                          isExpanded ? "rotate-90" : ""
                        )
                      }
                    )
                  }
                ) : /* @__PURE__ */ jsx("span", { className: "inline-block h-7 w-7", "aria-hidden": true }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    className: cn(
                      "min-h-8 flex-1 rounded-md px-2 py-1 text-start text-sm transition-colors",
                      isSelected ? "bg-accent text-accent-foreground" : "hover:bg-accent"
                    ),
                    onClick: () => onItemSelect?.(item),
                    children: item.label
                  }
                )
              ] }),
              hasChildren && isExpanded && isLoading ? /* @__PURE__ */ jsx("p", { className: "mt-1 ps-12 text-xs text-muted-foreground", children: l.loadingChildren }) : null,
              hasChildren && isExpanded && !isLoading && item.children?.length ? renderItems(item.children, depth + 1) : null,
              hasChildren && isExpanded && !isLoading && isChildrenLoaded && !item.children?.length ? /* @__PURE__ */ jsx("p", { className: "mt-1 ps-12 text-xs text-muted-foreground", children: l.noChildNodes }) : null
            ]
          },
          item.id
        );
      })
    }
  );
  if (!items.length) {
    return /* @__PURE__ */ jsx("div", { className: cn("rounded-md border p-6 text-sm text-muted-foreground", className), children: emptyText });
  }
  return /* @__PURE__ */ jsx("div", { className: cn("rounded-md border p-2", className), children: renderItems(items) });
};

export { TreeView };

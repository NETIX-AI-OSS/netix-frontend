import { OptionList } from './chunk-CA3OYJWW.js';
import { Separator } from './chunk-6XRNMP7W.js';
import { Popover, PopoverTrigger, PopoverContent } from './chunk-QAEXWTQK.js';
import { Button } from './chunk-BYN4QE7U.js';
import { Badge } from './chunk-2NHH6FFY.js';
import { cn } from './chunk-UIWDNVTY.js';
import { XIcon, Loader2, ChevronDown, CheckIcon } from 'lucide-react';
import * as React from 'react';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';

var DEFAULT_LABELS = {
  select: "Select...",
  notAvailable: "NA",
  searchPlaceholder: "Search...",
  noDataFound: "No data found",
  typeToSearch: "Type to search",
  selectAll: "Select all",
  loading: "Loading",
  loadMore: "Load more"
};
function Marker({ checked }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "me-2 flex h-4 w-4 items-center justify-center rounded border border-primary [&&>svg]:size-3",
        checked ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
      ),
      children: /* @__PURE__ */ jsx(CheckIcon, {})
    }
  );
}
function useIsVisible(enabled) {
  const [node, setNode] = React.useState(null);
  const [isVisible, setIsVisible] = React.useState(false);
  React.useEffect(() => {
    if (!enabled || !node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => setIsVisible(entries.some((entry) => entry.isIntersecting)),
      { threshold: 0, rootMargin: "100px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, node]);
  return { ref: setNode, isVisible };
}
function FancyCombobox({
  options,
  onValueChange,
  onSearchValueChange,
  multiple,
  loading,
  value = [],
  placeholder,
  maxCount = 2,
  modalPopover,
  className,
  disableClear,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  labels,
  ...props
}) {
  const l = { ...DEFAULT_LABELS, ...labels };
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const showLoadMore = !!hasNextPage || !!isFetchingNextPage;
  const { ref: loadMoreRef, isVisible: isLoadMoreVisible } = useIsVisible(showLoadMore);
  const handleInputKeyDown = (event) => {
    if (event.key === "Enter") {
      setIsPopoverOpen(true);
    } else if (event.key === "Backspace" && !event.currentTarget.value) {
      const newSelectedValues = [...value];
      newSelectedValues.pop();
      onValueChange(newSelectedValues);
    }
  };
  const toggleOption = (option) => {
    if (multiple) {
      const newSelectedValues = value.includes(option) ? value.filter((v) => v !== option) : [...value, option];
      onValueChange(newSelectedValues);
    } else {
      onValueChange([option]);
      setIsPopoverOpen(false);
    }
  };
  const handleSelectAll = () => {
    if (value.length === options.length) {
      onValueChange([]);
    } else {
      onValueChange(options.map((o) => o.value));
    }
  };
  React.useEffect(() => {
    if (!isPopoverOpen || !onLoadMore || !hasNextPage || !!isFetchingNextPage || !isLoadMoreVisible) {
      return;
    }
    onLoadMore();
  }, [hasNextPage, isFetchingNextPage, isLoadMoreVisible, isPopoverOpen, onLoadMore]);
  return /* @__PURE__ */ jsxs(Popover, { open: isPopoverOpen, onOpenChange: setIsPopoverOpen, modal: modalPopover, children: [
    /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
      Button,
      {
        ...props,
        disabled: props.disabled || !options?.length && !onSearchValueChange,
        onClick: () => setIsPopoverOpen((prev) => !prev),
        className: cn(
          "flex h-auto min-h-10 w-full items-center justify-between rounded-md border border-input bg-inherit px-1 py-0.5 text-start hover:bg-inherit [&_svg]:pointer-events-auto",
          className
        ),
        children: /* @__PURE__ */ jsxs("div", { className: "flex w-full items-stretch justify-between", children: [
          value.length > 0 && /* @__PURE__ */ jsx("div", { className: "relative flex grow items-stretch pe-2", children: multiple ? /* @__PURE__ */ jsx("div", { className: "no-scrollbar absolute start-0 flex w-full gap-2 overflow-x-auto overflow-y-auto", children: value.slice(0, maxCount).map((val) => {
            const option = options.find((o) => o.value === val);
            const IconComponent = option?.icon;
            return /* @__PURE__ */ jsxs(
              Badge,
              {
                className: "rounded-sm px-2 py-1 font-light text-foreground hover:border-border hover:bg-transparent [&&>svg]:size-3",
                variant: "secondary",
                children: [
                  IconComponent && /* @__PURE__ */ jsx(IconComponent, { className: "me-2 h-4 w-4" }),
                  option?.label || val,
                  /* @__PURE__ */ jsx(
                    XIcon,
                    {
                      className: "ms-2 cursor-pointer",
                      onClick: (event) => {
                        event.stopPropagation();
                        toggleOption(val);
                      }
                    }
                  )
                ]
              },
              val
            );
          }) }) : /* @__PURE__ */ jsx("span", { className: "absolute start-0 top-0 w-full truncate px-3 pt-0.5 text-start text-foreground", children: options.find((o) => o.value === value[0])?.label || l.notAvailable }) }),
          value.length > maxCount && /* @__PURE__ */ jsx(
            Badge,
            {
              className: "rounded-sm px-2 py-1 font-light text-foreground hover:border-border hover:bg-transparent",
              variant: "secondary",
              children: `+ ${value.length - maxCount}`
            }
          ),
          !value.length && /* @__PURE__ */ jsx("span", { className: "mx-3 grow text-start text-sm text-muted-foreground", children: options?.length || onSearchValueChange ? placeholder || l.select : l.notAvailable }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            loading && /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin text-muted-foreground" }),
            value.length > 0 && !disableClear && /* @__PURE__ */ jsx(
              XIcon,
              {
                className: "mx-2 h-4 cursor-pointer text-muted-foreground",
                onClick: (event) => {
                  event.stopPropagation();
                  onValueChange([]);
                }
              }
            ),
            value.length > 0 && /* @__PURE__ */ jsx(Separator, { orientation: "vertical", className: "flex h-full min-h-6" }),
            /* @__PURE__ */ jsx(ChevronDown, { className: "mx-2 h-4 cursor-pointer text-muted-foreground" })
          ] })
        ] })
      }
    ) }),
    /* @__PURE__ */ jsx(
      PopoverContent,
      {
        className: "w-[--radix-popover-trigger-width] p-0",
        align: "start",
        onEscapeKeyDown: () => setIsPopoverOpen(false),
        onWheel: (e) => e.stopPropagation(),
        onTouchMove: (e) => e.stopPropagation(),
        children: /* @__PURE__ */ jsx(
          OptionList,
          {
            placeholder: l.searchPlaceholder,
            onSearchValueChange,
            onSearchKeyDown: handleInputKeyDown,
            empty: !onSearchValueChange && options.length === 0 ? l.noDataFound : l.typeToSearch,
            header: multiple && options.length > 1 && /* @__PURE__ */ jsxs(
              "div",
              {
                role: "option",
                "aria-selected": value.length === options.length,
                onClick: handleSelectAll,
                className: cn(
                  value.length === options.length && "bg-accent/50",
                  "mt-0.5 flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm"
                ),
                children: [
                  /* @__PURE__ */ jsx(Marker, { checked: value.length === options.length }),
                  /* @__PURE__ */ jsx("span", { className: "max-w-sm pe-1", children: l.selectAll })
                ]
              }
            ),
            footer: showLoadMore && /* @__PURE__ */ jsx("div", { ref: loadMoreRef, className: "py-2 text-center text-xs text-muted-foreground", children: isFetchingNextPage ? `${l.loading}...` : l.loadMore }),
            items: options.map((option) => {
              const isSelected = value.includes(option.value);
              return {
                key: option.value,
                text: option.label,
                selected: isSelected,
                className: cn(isSelected && "bg-accent/50", "mt-0.5"),
                onSelect: () => toggleOption(option.value),
                content: /* @__PURE__ */ jsxs(Fragment, { children: [
                  multiple ? /* @__PURE__ */ jsx(Marker, { checked: isSelected }) : /* @__PURE__ */ jsx(
                    CheckIcon,
                    {
                      className: cn(isSelected ? "text-foreground" : "text-transparent")
                    }
                  ),
                  option.icon && /* @__PURE__ */ jsx(option.icon, { className: "me-2 h-4 w-4 text-muted-foreground" }),
                  /* @__PURE__ */ jsx("span", { className: "max-w-sm pe-1", children: option.label })
                ] })
              };
            })
          }
        )
      }
    )
  ] });
}

export { FancyCombobox };

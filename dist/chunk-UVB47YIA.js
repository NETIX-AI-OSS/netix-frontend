import { OptionList } from './chunk-CA3OYJWW.js';
import { LoadingState } from './chunk-6DAOUNLS.js';
import { Input } from './chunk-5QTHF62K.js';
import { Popover, PopoverTrigger, PopoverContent } from './chunk-QAEXWTQK.js';
import { Button } from './chunk-BYN4QE7U.js';
import { cn } from './chunk-UIWDNVTY.js';
import { SearchIcon, ArrowUpNarrowWide, ArrowDownWideNarrow, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';

// src/ui/composites/data-table-types.ts
var DEFAULT_COLUMN_FILTER_LABELS = {
  search: "Search",
  reset: "Reset",
  noDataFound: "No data found"
};
var DEBOUNCE_DELAY_MS = 800;
function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
function ColumnFilter({ column, filtering }) {
  const { filters, updateFilters, onError } = filtering;
  const labels = { ...DEFAULT_COLUMN_FILTER_LABELS, ...filtering.labels };
  const [value, setValue] = useState("");
  const [optionValue, setOptionValue] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const meta = column.columnDef.meta;
  const { key, transformer, useList, useOptions, options, multiple, sort } = meta?.filter ?? {};
  const filterValue = key ? filters?.[key] : void 0;
  const ordering = filters?.ordering;
  const isOptionsFilter = !!options || !!useList;
  useEffect(() => {
    const v = filterValue || "";
    setValue(v);
    setOptionValue(v.split(",").filter((o) => o));
  }, [filterValue]);
  async function transformedFilter(f) {
    return transformer ? await transformer(f) : f;
  }
  useEffect(() => {
    if (sort && ordering) {
      const isAsc = ordering === sort;
      const isDesc = ordering === `-${sort}`;
      if (isAsc || isDesc) {
        column.toggleSorting(!isAsc, false);
      }
    }
  }, [ordering, sort, column]);
  async function handleUpdate() {
    if (!key) return;
    setIsLoading(true);
    try {
      const f = await transformedFilter({ [key]: isOptionsFilter ? optionValue.join(",") : value });
      updateFilters((prev) => ({ ...prev, ...f }));
      setOpen(false);
    } catch (error) {
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }
  async function handleReset() {
    if (!key) return;
    setIsLoading(true);
    try {
      const f = await transformedFilter({ [key]: void 0 });
      setValue("");
      setOptionValue([]);
      updateFilters(
        (prev) => Object.fromEntries(
          Object.entries(prev || {}).filter(
            ([k]) => k !== key && !Object.keys(f || {}).includes(k)
          )
        )
      );
      setOpen(false);
    } catch (error) {
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }
  async function handleSort(isAsc) {
    if (!sort) return;
    setIsLoading(true);
    try {
      const f = await transformedFilter({ ordering: isAsc ? sort : `-${sort}` });
      updateFilters((prev) => ({ ...prev, ...f }));
    } catch (error) {
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }
  return /* @__PURE__ */ jsxs(Popover, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-1", children: [
      /* @__PURE__ */ jsx(PopoverTrigger, { children: !!key && /* @__PURE__ */ jsx(
        SearchIcon,
        {
          className: cn("size-4 text-foreground hover:text-primary", value && "text-primary")
        }
      ) }),
      !!sort && /* @__PURE__ */ jsx(
        "div",
        {
          "data-testid": "column-filter-sort",
          onClick: (e) => {
            e.preventDefault();
            const isAsc = column.getIsSorted() !== "asc";
            column.toggleSorting(!isAsc);
            handleSort(isAsc);
          },
          children: column.getIsSorted() === "asc" ? /* @__PURE__ */ jsx(ArrowUpNarrowWide, { className: "size-4 cursor-pointer text-foreground hover:text-primary" }) : /* @__PURE__ */ jsx(ArrowDownWideNarrow, { className: "size-4 cursor-pointer text-foreground hover:text-primary" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs(PopoverContent, { align: "end", className: "mt-2 w-56 rounded-xl px-0 py-3 pt-1", children: [
      /* @__PURE__ */ jsxs(
        "form",
        {
          onSubmit: (e) => {
            e.preventDefault();
            handleUpdate();
          },
          children: [
            !!options && /* @__PURE__ */ jsx(
              OptionsInput,
              {
                value: optionValue,
                onValueChange: setOptionValue,
                options,
                multiple,
                labels,
                translateOptionLabel: filtering.translateOptionLabel
              }
            ),
            !!useList && !!useOptions && /* @__PURE__ */ jsx(
              SearchableOptionsInput,
              {
                value: optionValue,
                onValueChange: setOptionValue,
                useList,
                useOptions,
                multiple,
                labels,
                filtering
              }
            ),
            !isOptionsFilter && /* @__PURE__ */ jsx("div", { className: "mt-2 px-3", children: /* @__PURE__ */ jsx(
              Input,
              {
                placeholder: labels.search,
                value,
                onChange: (event) => setValue(event.target.value)
              }
            ) })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "mx-3 mt-3 flex gap-2", children: [
        /* @__PURE__ */ jsx(Button, { variant: "secondary", className: "flex-1", onClick: handleReset, disabled: isLoading, children: labels.reset }),
        /* @__PURE__ */ jsxs(Button, { className: "flex-1", onClick: handleUpdate, disabled: isLoading, children: [
          isLoading && /* @__PURE__ */ jsx(LoadingState, { variant: "button", className: "me-2 size-4" }),
          labels.search
        ] })
      ] })
    ] })
  ] });
}
function OptionsInput({
  options,
  value,
  searchValue,
  onValueChange,
  onSearchValueChange,
  loading,
  multiple,
  labels,
  translateOptionLabel
}) {
  return /* @__PURE__ */ jsx(
    OptionList,
    {
      placeholder: labels.search,
      searchValue,
      onSearchValueChange,
      empty: loading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsx(LoadingState, { variant: "button" }) }) : labels.noDataFound,
      items: options.map((option) => {
        const selected = value.includes(option.value);
        return {
          key: option.value,
          text: option.value,
          selected,
          onSelect: () => selected ? onValueChange(value.filter((v) => v !== option.value)) : onValueChange([...multiple ? value : [], option.value]),
          content: /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Check, { className: cn("me-2 h-4 w-4", selected ? "opacity-100" : "opacity-0") }),
            translateOptionLabel ? translateOptionLabel(option.label) : option.label
          ] })
        };
      })
    }
  );
}
function SearchableOptionsInput({
  useList,
  useOptions,
  onValueChange,
  value,
  multiple,
  labels,
  filtering
}) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, filtering.debounceMs ?? DEBOUNCE_DELAY_MS);
  const { data, isLoading } = useList(
    {
      ...filtering.listParams,
      search: debouncedSearch,
      id: debouncedSearch ? void 0 : value[0]
    },
    { [filtering.queryOptionKey ?? "query"]: { enabled: !!(debouncedSearch || value[0]) } }
  );
  return /* @__PURE__ */ jsx(
    OptionsInput,
    {
      value,
      onValueChange,
      options: useOptions(data),
      searchValue: search,
      onSearchValueChange: setSearch,
      loading: isLoading,
      multiple,
      labels,
      translateOptionLabel: filtering.translateOptionLabel
    }
  );
}

export { ColumnFilter, DEBOUNCE_DELAY_MS, DEFAULT_COLUMN_FILTER_LABELS };

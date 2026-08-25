import { Input } from './chunk-5QTHF62K.js';
import { cn } from './chunk-UIWDNVTY.js';
import { SearchIcon } from 'lucide-react';
import * as React from 'react';
import { jsxs, jsx } from 'react/jsx-runtime';

function OptionList({
  items,
  placeholder,
  empty,
  searchValue,
  onSearchValueChange,
  onSearchKeyDown,
  header,
  footer,
  className
}) {
  const [query, setQuery] = React.useState("");
  const search = onSearchValueChange ? "" : query.trim().toLowerCase();
  const visible = search ? items.filter((i) => i.text.toLowerCase().includes(search)) : items;
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col", className), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 border-b px-3", children: [
      /* @__PURE__ */ jsx(SearchIcon, { className: "size-4 shrink-0 opacity-50" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          role: "searchbox",
          className: "h-9 border-0 px-0 shadow-none focus-visible:ring-0",
          placeholder,
          value: onSearchValueChange ? searchValue : query,
          onKeyDown: onSearchKeyDown,
          onChange: (event) => {
            setQuery(event.target.value);
            onSearchValueChange?.(event.target.value);
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { role: "listbox", className: "max-h-64 overflow-y-auto p-1", children: [
      header,
      visible.length === 0 ? /* @__PURE__ */ jsx("div", { className: "py-6 text-center text-sm", children: empty }) : visible.map((item) => /* @__PURE__ */ jsx(
        "div",
        {
          role: "option",
          tabIndex: 0,
          "aria-selected": !!item.selected,
          className: cn(
            "flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent",
            item.className
          ),
          onClick: item.onSelect,
          onKeyDown: (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              item.onSelect();
            }
          },
          children: item.content
        },
        item.key
      )),
      footer
    ] })
  ] });
}

export { OptionList };

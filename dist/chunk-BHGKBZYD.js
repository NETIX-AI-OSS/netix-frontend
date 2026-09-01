import { LoadingState } from './chunk-6DAOUNLS.js';
import { OptionList } from './chunk-CA3OYJWW.js';
import { Separator } from './chunk-6XRNMP7W.js';
import { Popover, PopoverTrigger, PopoverContent } from './chunk-QAEXWTQK.js';
import { Button } from './chunk-BYN4QE7U.js';
import { cn } from './chunk-UIWDNVTY.js';
import { XIcon, ChevronDown, Check } from 'lucide-react';
import * as React from 'react';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';

var DEFAULT_LABELS = {
  select: "Select option",
  search: "Search",
  noDataFound: "No data found"
};
function Combobox({
  value,
  onValueChange,
  options,
  placeholder,
  loading,
  modalPopover = true,
  labels,
  ...props
}) {
  const l = { ...DEFAULT_LABELS, ...labels };
  const [open, setOpen] = React.useState(false);
  return /* @__PURE__ */ jsxs(Popover, { open, onOpenChange: setOpen, modal: modalPopover, children: [
    /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
      Button,
      {
        variant: "outline",
        role: "combobox",
        "aria-expanded": open,
        className: "flex h-auto min-h-10 w-full items-center justify-between rounded-md border-input px-1 py-0.5 text-start hover:bg-card/80",
        ...props,
        children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex w-full items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "grow overflow-hidden text-ellipsis px-3 text-start text-sm text-foreground", children: value ? options.find((option) => option.value === value)?.label : placeholder || l.select }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            loading && /* @__PURE__ */ jsx(LoadingState, { variant: "button" }),
            !!value && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  size: "sm",
                  className: "bg-transparent p-0 hover:bg-transparent",
                  variant: "ghost",
                  onClick: (event) => {
                    event.stopPropagation();
                    onValueChange();
                  },
                  children: /* @__PURE__ */ jsx(XIcon, { className: "mx-2 h-4 cursor-pointer text-muted-foreground" })
                }
              ),
              /* @__PURE__ */ jsx(Separator, { orientation: "vertical", className: "flex h-full min-h-6" })
            ] }),
            /* @__PURE__ */ jsx(ChevronDown, { className: "mx-2 h-4 cursor-pointer text-muted-foreground" })
          ] })
        ] })
      }
    ) }),
    /* @__PURE__ */ jsx(PopoverContent, { className: "min-w-[200px] p-0", align: "start", children: /* @__PURE__ */ jsx(
      OptionList,
      {
        placeholder: placeholder || `${l.search}...`,
        empty: l.noDataFound,
        items: options.map((option) => ({
          key: option.value,
          text: option.label,
          selected: value === option.value,
          onSelect: () => {
            onValueChange(option.value);
            setOpen(false);
          },
          content: /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(
              Check,
              {
                className: cn(
                  "me-2 h-4 w-4",
                  value === option.value ? "opacity-100" : "opacity-0"
                )
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "max-w-sm pe-1", children: option.label })
          ] })
        }))
      }
    ) })
  ] });
}

export { Combobox };

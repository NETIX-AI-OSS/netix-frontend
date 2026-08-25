import { Skeleton } from './chunk-RZV64JII.js';
import { cn } from './chunk-UIWDNVTY.js';
import { jsxs, jsx } from 'react/jsx-runtime';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
function inferVariant({
  variant,
  center,
  size
}) {
  if (variant) return variant;
  if (center) return "section";
  if (typeof size === "number" && size <= 24) return "button";
  return "inline";
}
function PageLoading() {
  return /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4", children: [
    /* @__PURE__ */ jsx(Skeleton, { className: "h-28 w-full" }),
    /* @__PURE__ */ jsx(Skeleton, { className: "h-28 w-full" }),
    /* @__PURE__ */ jsx(Skeleton, { className: "h-28 w-full" }),
    /* @__PURE__ */ jsx(Skeleton, { className: "h-28 w-full" }),
    /* @__PURE__ */ jsx(Skeleton, { className: "h-80 w-full md:col-span-2 xl:col-span-3" }),
    /* @__PURE__ */ jsx(Skeleton, { className: "h-80 w-full xl:col-span-1" })
  ] });
}
function RouteLoading() {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx(Skeleton, { className: "h-10 w-64" }),
    /* @__PURE__ */ jsx(Skeleton, { className: "h-5 w-96 max-w-full" }),
    /* @__PURE__ */ jsx(Skeleton, { className: "h-64 w-full" })
  ] });
}
function SectionLoading() {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsx(Skeleton, { className: "h-7 w-40" }),
    /* @__PURE__ */ jsx(Skeleton, { className: "h-44 w-full" }),
    /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-2/3" })
  ] });
}
function CardLoading({ lines }) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-24" }),
    /* @__PURE__ */ jsx(Skeleton, { className: "h-9 w-28" }),
    /* @__PURE__ */ jsx("div", { className: "space-y-2", children: Array.from({ length: lines }).map((_, index) => /* @__PURE__ */ jsx(Skeleton, { className: cn("h-3", index === lines - 1 ? "w-2/3" : "w-full") }, index)) })
  ] });
}
function TableLoading({ rows }) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 gap-2", children: [
      /* @__PURE__ */ jsx(Skeleton, { className: "h-8 w-full" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-8 w-full" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-8 w-full" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-8 w-full" })
    ] }),
    Array.from({ length: rows }).map((_, index) => /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 gap-2", children: [
      /* @__PURE__ */ jsx(Skeleton, { className: "h-7 w-full" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-7 w-full" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-7 w-full" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-7 w-full" })
    ] }, index))
  ] });
}
function ChartLoading() {
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full min-h-32 w-full flex-col gap-2.5", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative min-h-24 flex-1 overflow-hidden border-b border-l border-border/45", children: [
      /* @__PURE__ */ jsx("span", { className: "absolute inset-x-0 top-1/4 border-t border-dashed border-border/40" }),
      /* @__PURE__ */ jsx("span", { className: "absolute inset-x-0 top-1/2 border-t border-dashed border-border/40" }),
      /* @__PURE__ */ jsx("span", { className: "absolute inset-x-0 top-3/4 border-t border-dashed border-border/40" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "absolute inset-x-0 bottom-0 h-[72%] rounded-none opacity-70 [clip-path:polygon(0_84%,8%_72%,16%_76%,25%_48%,34%_55%,43%_38%,51%_64%,60%_50%,69%_56%,78%_27%,88%_36%,100%_18%,100%_100%,0_100%)]" })
    ] }),
    /* @__PURE__ */ jsx(Skeleton, { className: "h-6 w-full rounded-sm opacity-75" })
  ] });
}
var VARIANT_CLASS = {
  page: "w-full space-y-4",
  route: "w-full max-w-5xl space-y-4",
  section: "w-full max-w-xl space-y-3",
  card: "w-full space-y-3",
  table: "w-full space-y-3",
  chart: "w-full",
  inline: "inline-flex items-center",
  button: "inline-flex items-center"
};
function LoadingState({
  variant,
  rows = 5,
  lines = 3,
  label = "Loading",
  className,
  center,
  size,
  color,
  name,
  ...props
}) {
  const resolvedVariant = inferVariant({ variant, center, size });
  const safeRows = clamp(rows, 1, 12);
  const safeLines = clamp(lines, 1, 6);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      role: "status",
      "aria-live": "polite",
      "aria-busy": "true",
      "aria-label": label,
      "data-loading-variant": resolvedVariant,
      className: cn(
        center && "flex h-full w-full items-center justify-center",
        VARIANT_CLASS[resolvedVariant],
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsx("span", { className: "sr-only", children: label }),
        resolvedVariant === "page" && /* @__PURE__ */ jsx(PageLoading, {}),
        resolvedVariant === "route" && /* @__PURE__ */ jsx(RouteLoading, {}),
        resolvedVariant === "section" && /* @__PURE__ */ jsx(SectionLoading, {}),
        resolvedVariant === "card" && /* @__PURE__ */ jsx(CardLoading, { lines: safeLines }),
        resolvedVariant === "table" && /* @__PURE__ */ jsx(TableLoading, { rows: safeRows }),
        resolvedVariant === "chart" && /* @__PURE__ */ jsx(ChartLoading, {}),
        resolvedVariant === "inline" && /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-20 rounded-sm" }),
        resolvedVariant === "button" && /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-4 rounded-sm" })
      ]
    }
  );
}

export { LoadingState, inferVariant };

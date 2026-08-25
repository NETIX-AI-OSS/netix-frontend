import { cva } from './chunk-Y4S6UTW2.js';
import { cn } from './chunk-UIWDNVTY.js';
import { jsx } from 'react/jsx-runtime';

var typographyVariants = cva("text-xl", {
  variants: {
    variant: {
      // Every fleet copy had 'lg: text-5xl'; the stray space killed both classes, so h1 never scaled.
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
      h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      p: "leading-7 [&:not(:first-child)]:mt-6"
    },
    affects: {
      default: "",
      lead: "text-xl text-muted-foreground",
      large: "text-lg font-semibold",
      small: "text-sm font-medium leading-none",
      muted: "text-sm text-muted-foreground",
      removePMargin: "[&:not(:first-child)]:mt-0"
    }
  },
  defaultVariants: { variant: "h1", affects: "default" }
});
function Typography({ className, variant, affects, ...props }) {
  const Comp = variant || "p";
  return /* @__PURE__ */ jsx(Comp, { className: cn(typographyVariants({ variant, affects, className })), ...props });
}
function TypographyH1(props) {
  return /* @__PURE__ */ jsx(Typography, { variant: "h1", ...props });
}
function TypographyH2(props) {
  return /* @__PURE__ */ jsx(Typography, { variant: "h2", ...props });
}
function TypographyH3(props) {
  return /* @__PURE__ */ jsx(Typography, { variant: "h3", ...props });
}
function TypographyH4(props) {
  return /* @__PURE__ */ jsx(Typography, { variant: "h4", ...props });
}
function TypographyP(props) {
  return /* @__PURE__ */ jsx(Typography, { variant: "p", ...props });
}
function TypographyMuted(props) {
  return /* @__PURE__ */ jsx(Typography, { variant: "p", affects: "muted", ...props });
}

export { Typography, TypographyH1, TypographyH2, TypographyH3, TypographyH4, TypographyMuted, TypographyP, typographyVariants };

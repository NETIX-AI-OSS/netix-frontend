import { Toaster as Toaster$1 } from 'sonner';
import { jsx } from 'react/jsx-runtime';

// src/ui/composites/toaster.tsx
function Toaster({ theme = "system", className, style, ...props }) {
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      theme,
      className: className ?? "toaster group",
      style: {
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
        ...style
      },
      ...props
    }
  );
}

export { Toaster };

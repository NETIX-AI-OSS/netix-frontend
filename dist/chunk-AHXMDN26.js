import { cn } from './chunk-UIWDNVTY.js';
import { FolderOpen } from 'lucide-react';
import { jsxs, jsx } from 'react/jsx-runtime';

function EmptyState({ text = "No data found", icon, className }) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "mt-32 flex items-center justify-center gap-2 text-secondary-foreground",
        className
      ),
      children: [
        icon ?? /* @__PURE__ */ jsx(FolderOpen, {}),
        /* @__PURE__ */ jsx("span", { className: "text-lg", children: text })
      ]
    }
  );
}

export { EmptyState };

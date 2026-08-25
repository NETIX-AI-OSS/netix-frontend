import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { jsx } from 'react/jsx-runtime';

// src/ui/primitives/collapsible.tsx
function Collapsible({ ...props }) {
  return /* @__PURE__ */ jsx(CollapsiblePrimitive.Root, { "data-slot": "collapsible", ...props });
}
function CollapsibleTrigger2({
  ...props
}) {
  return /* @__PURE__ */ jsx(CollapsiblePrimitive.CollapsibleTrigger, { "data-slot": "collapsible-trigger", ...props });
}
function CollapsibleContent2({
  ...props
}) {
  return /* @__PURE__ */ jsx(CollapsiblePrimitive.CollapsibleContent, { "data-slot": "collapsible-content", ...props });
}

export { Collapsible, CollapsibleContent2 as CollapsibleContent, CollapsibleTrigger2 as CollapsibleTrigger };

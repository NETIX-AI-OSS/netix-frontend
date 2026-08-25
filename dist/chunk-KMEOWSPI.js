import { LoadingState } from './chunk-6DAOUNLS.js';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './chunk-3WXRFRHM.js';
import { Button } from './chunk-BYN4QE7U.js';
import { cn } from './chunk-UIWDNVTY.js';
import { useState, useCallback } from 'react';
import { jsxs, jsx } from 'react/jsx-runtime';

function FormModal({
  onSubmit,
  onOpenChange,
  trigger,
  header,
  actionButtonText = "Save",
  triggerButtonText,
  cancelButtonText = "Cancel",
  className,
  overlayClassName,
  children,
  permission,
  hasPermission,
  open: externalOpen,
  hideTrigger,
  disabled
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = useCallback(
    async (e) => {
      e.stopPropagation();
      setIsSubmitting(true);
      try {
        const result = await onSubmit();
        if (result || result === void 0) setOpen(false);
      } catch {
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit]
  );
  const change = (v) => {
    setOpen(v);
    if (onOpenChange) onOpenChange(v);
  };
  if (permission && !hasPermission?.(permission)) return null;
  return /* @__PURE__ */ jsxs(Dialog, { open: externalOpen ?? open, onOpenChange: change, children: [
    trigger ? /* @__PURE__ */ jsx(DialogTrigger, { onClick: (e) => e.stopPropagation(), children: trigger }) : !hideTrigger && /* @__PURE__ */ jsx(
      Button,
      {
        variant: "secondary",
        size: "sm",
        onClick: (e) => {
          e.stopPropagation();
          setOpen(true);
        },
        children: triggerButtonText || "Edit"
      }
    ),
    /* @__PURE__ */ jsxs(
      DialogContent,
      {
        className: cn("w-11/12 max-w-3xl bg-card px-0 py-4 text-start", className),
        overlayClassName,
        children: [
          /* @__PURE__ */ jsxs(DialogHeader, { children: [
            /* @__PURE__ */ jsx(DialogTitle, { className: cn("px-6 text-2xl", header && "pb-3"), children: header }),
            /* @__PURE__ */ jsx("div", { className: "max-h-[80vh] overflow-y-auto px-6 pb-1", children })
          ] }),
          /* @__PURE__ */ jsxs(DialogFooter, { className: "px-6 pb-1", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "secondary",
                className: "me-1",
                onClick: (e) => {
                  e.stopPropagation();
                  change(false);
                },
                children: cancelButtonText
              }
            ),
            /* @__PURE__ */ jsxs(Button, { onClick: handleSubmit, disabled: isSubmitting || disabled, children: [
              isSubmitting && /* @__PURE__ */ jsx(LoadingState, { variant: "button", className: "me-2 size-4" }),
              actionButtonText
            ] })
          ] })
        ]
      }
    )
  ] });
}

export { FormModal };

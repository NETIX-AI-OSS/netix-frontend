import { LoadingState } from './chunk-6DAOUNLS.js';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogFooter } from './chunk-3WXRFRHM.js';
import { Button } from './chunk-BYN4QE7U.js';
import { useState, useCallback } from 'react';
import { jsxs, jsx } from 'react/jsx-runtime';

function ConfirmModal({
  onConfirm,
  children,
  confirmVariant,
  triggerVariant,
  triggerIcon: TriggerIcon,
  triggerText,
  triggerClassName,
  trigger,
  confirmText = "Confirm",
  cancelText = "Cancel",
  permission,
  hasPermission,
  showCancelButton,
  disabled
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = useCallback(
    async (e) => {
      e.stopPropagation();
      setIsSubmitting(true);
      try {
        await onConfirm();
        setOpen(false);
      } catch {
      } finally {
        setIsSubmitting(false);
      }
    },
    [onConfirm]
  );
  if (permission && !hasPermission?.(permission)) return null;
  return /* @__PURE__ */ jsxs(Dialog, { open, onOpenChange: setOpen, children: [
    trigger ? /* @__PURE__ */ jsx("div", { className: triggerClassName, children: /* @__PURE__ */ jsx(
      DialogTrigger,
      {
        className: "w-full",
        onClick: (e) => e.stopPropagation(),
        disabled,
        children: trigger
      }
    ) }) : /* @__PURE__ */ jsxs(
      Button,
      {
        variant: triggerVariant,
        onClick: (e) => {
          e.stopPropagation();
          setOpen(true);
        },
        className: triggerClassName,
        disabled,
        children: [
          TriggerIcon && /* @__PURE__ */ jsx(TriggerIcon, {}),
          triggerText || confirmText
        ]
      }
    ),
    /* @__PURE__ */ jsxs(DialogContent, { className: "w-11/12 max-w-96 bg-card px-0 py-4 text-start", children: [
      /* @__PURE__ */ jsx(DialogTitle, { className: "font-normal", children: /* @__PURE__ */ jsx("div", { className: "max-h-[80vh] overflow-auto px-6", children }) }),
      /* @__PURE__ */ jsxs(DialogFooter, { className: "px-6 pb-1", children: [
        showCancelButton && /* @__PURE__ */ jsx(
          Button,
          {
            variant: "secondary",
            className: "me-1",
            onClick: (e) => {
              e.stopPropagation();
              setOpen(false);
            },
            children: cancelText
          }
        ),
        /* @__PURE__ */ jsxs(Button, { onClick: handleSubmit, disabled: isSubmitting, variant: confirmVariant, children: [
          isSubmitting && /* @__PURE__ */ jsx(LoadingState, { variant: "button", className: "me-2 size-4" }),
          confirmText
        ] })
      ] })
    ] })
  ] });
}

export { ConfirmModal };

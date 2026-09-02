import type { ComponentProps, MouseEventHandler } from 'react'
import { useCallback, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

type ButtonVariant = NonNullable<ComponentProps<typeof Button>['variant']>
import { LoadingState } from '../loading-state'

export type ConfirmModalProps = {
  onConfirm: () => void | Promise<void>
  children: React.ReactNode
  confirmVariant?: ButtonVariant
  triggerVariant?: ButtonVariant
  triggerIcon?: React.ElementType
  triggerText?: string
  triggerClassName?: string
  trigger?: React.ReactNode
  confirmText?: string
  cancelText?: string
  permission?: string
  hasPermission?: (permission: string) => boolean
  showCancelButton?: boolean
  disabled?: boolean
}

export function ConfirmModal({
  onConfirm,
  children,
  confirmVariant,
  triggerVariant,
  triggerIcon: TriggerIcon,
  triggerText,
  triggerClassName,
  trigger,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  permission,
  hasPermission,
  showCancelButton,
  disabled,
}: ConfirmModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit: MouseEventHandler<HTMLButtonElement> = useCallback(
    async (e) => {
      e.stopPropagation()
      setIsSubmitting(true)
      try {
        await onConfirm()
        setOpen(false)
      } catch {
        // The onConfirm callback owns error surfacing (it toasts the typed ApiError.messages);
        // keep the dialog open so the user can retry. Swallow only to stop an unhandled
        // rejection — the finally below always clears the submitting state.
      } finally {
        setIsSubmitting(false)
      }
    },
    [onConfirm],
  )

  // Fail closed: a permission-gated modal stays hidden when no predicate is injected.
  if (permission && !hasPermission?.(permission)) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <div className={triggerClassName}>
          <DialogTrigger
            className="w-full"
            onClick={(e) => e.stopPropagation()}
            disabled={disabled}
          >
            {trigger}
          </DialogTrigger>
        </div>
      ) : (
        <Button
          variant={triggerVariant}
          onClick={(e) => {
            e.stopPropagation()
            setOpen(true)
          }}
          className={triggerClassName}
          disabled={disabled}
        >
          {TriggerIcon && <TriggerIcon />}
          {triggerText || confirmText}
        </Button>
      )}
      <DialogContent className="w-11/12 max-w-96 bg-card px-0 py-4 text-start">
        <DialogTitle className="font-normal">
          <div className="max-h-[80vh] overflow-auto px-6">{children}</div>
        </DialogTitle>
        <DialogFooter className="px-6 pb-1">
          {showCancelButton && (
            <Button
              variant="secondary"
              className="me-1"
              onClick={(e) => {
                e.stopPropagation()
                setOpen(false)
              }}
            >
              {cancelText}
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={isSubmitting} variant={confirmVariant}>
            {isSubmitting && <LoadingState variant="button" className="me-2 size-4" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

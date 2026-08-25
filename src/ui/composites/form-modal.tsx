import type { MouseEventHandler } from 'react'
import { useCallback, useState } from 'react'

import { cn } from '../../utils/cn'
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../primitives'
import { LoadingState } from './loading-state'

export type FormModalProps = {
  onSubmit: () => void | Promise<void | boolean>
  children: React.ReactNode
  onOpenChange?: (v: boolean) => void | Promise<void | boolean>
  trigger?: React.ReactNode
  header?: React.ReactNode
  actionButtonText?: string
  triggerButtonText?: string | React.ReactNode
  cancelButtonText?: string
  className?: string
  overlayClassName?: string
  permission?: string
  hasPermission?: (permission: string) => boolean
  open?: boolean
  hideTrigger?: boolean
  disabled?: boolean
}

export function FormModal({
  onSubmit,
  onOpenChange,
  trigger,
  header,
  actionButtonText = 'Save',
  triggerButtonText,
  cancelButtonText = 'Cancel',
  className,
  overlayClassName,
  children,
  permission,
  hasPermission,
  open: externalOpen,
  hideTrigger,
  disabled,
}: FormModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit: MouseEventHandler<HTMLButtonElement> = useCallback(
    async (e) => {
      e.stopPropagation()
      setIsSubmitting(true)
      try {
        const result = await onSubmit()
        if (result || result === undefined) setOpen(false)
      } catch {
        // The onSubmit callback owns error surfacing (it toasts the typed ApiError.messages);
        // keep the dialog open so the user can retry. Swallow only to stop an unhandled
        // rejection — the finally below always clears the submitting state.
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSubmit],
  )

  const change = (v: boolean) => {
    setOpen(v)
    if (onOpenChange) onOpenChange(v)
  }

  // Fail closed: a permission-gated modal stays hidden when no predicate is injected.
  if (permission && !hasPermission?.(permission)) return null

  return (
    <Dialog open={externalOpen ?? open} onOpenChange={change}>
      {trigger ? (
        <DialogTrigger onClick={(e) => e.stopPropagation()}>{trigger}</DialogTrigger>
      ) : (
        !hideTrigger && (
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setOpen(true)
            }}
          >
            {triggerButtonText || 'Edit'}
          </Button>
        )
      )}
      <DialogContent
        className={cn('w-11/12 max-w-3xl bg-card px-0 py-4 text-start', className)}
        overlayClassName={overlayClassName}
      >
        <DialogHeader>
          <DialogTitle className={cn('px-6 text-2xl', header && 'pb-3')}>{header}</DialogTitle>
          <div className="max-h-[80vh] overflow-y-auto px-6 pb-1">{children}</div>
        </DialogHeader>
        <DialogFooter className="px-6 pb-1">
          <Button
            variant="secondary"
            className="me-1"
            onClick={(e) => {
              e.stopPropagation()
              change(false)
            }}
          >
            {cancelButtonText}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || disabled}>
            {isSubmitting && <LoadingState variant="button" className="me-2 size-4" />}
            {actionButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

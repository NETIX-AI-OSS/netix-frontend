import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from './dialog'

const open = (extra: React.ComponentProps<typeof DialogContent> = {}) =>
  render(
    <Dialog defaultOpen>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent className="content" {...extra}>
        <DialogHeader className="header">
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogHeader>
        <DialogFooter className="footer">
          <DialogClose>Dismiss</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>,
  )

describe('Dialog', () => {
  it('renders every part and the close affordance by default', () => {
    open()
    expect(screen.getByRole('dialog')).toHaveClass('content')
    expect(screen.getByText('Title')).toHaveClass('font-semibold')
    expect(screen.getByText('Description')).toHaveClass('text-muted-foreground')
    expect(document.querySelector('[data-slot="dialog-header"]')).toHaveClass('header')
    expect(document.querySelector('[data-slot="dialog-footer"]')).toHaveClass('footer')
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('drops the corner close when hideClose is set', () => {
    open({ hideClose: true })
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
  })

  it('forwards overlayClassName to the overlay', () => {
    open({ overlayClassName: 'my-overlay' })
    expect(document.querySelector('[data-slot="dialog-overlay"]')).toHaveClass('my-overlay')
  })

  // The overlay is a DismissableLayerSurface, so it may stop propagation; Content must never do so.
  it('stops propagation on the overlay but not on the content', async () => {
    const onOuter = vi.fn()
    render(
      <div onClick={onOuter}>
        <Dialog defaultOpen modal={false}>
          <DialogContent hideClose>
            <DialogTitle>Title</DialogTitle>
            <button type="button" data-testid="inner">
              Inner
            </button>
          </DialogContent>
        </Dialog>
      </div>,
    )
    await userEvent.click(screen.getByTestId('inner'))
    expect(onOuter).toHaveBeenCalledOnce()
  })

  it('swallows clicks on the overlay', () => {
    const onOuter = vi.fn()
    render(
      <div onClick={onOuter}>
        <Dialog defaultOpen>
          <DialogContent hideClose>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      </div>,
    )
    fireEvent.click(document.querySelector('[data-slot="dialog-overlay"]') as HTMLElement)
    expect(onOuter).not.toHaveBeenCalled()
  })

  it('closes when the close button is pressed', async () => {
    open()
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders a standalone portal and overlay', () => {
    render(
      <Dialog defaultOpen>
        <DialogPortal>
          <DialogOverlay className="solo" />
        </DialogPortal>
      </Dialog>,
    )
    expect(document.querySelector('.solo')).toHaveClass('fixed')
  })
})

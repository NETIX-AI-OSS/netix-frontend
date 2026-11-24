import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog'

describe('Dialog', () => {
  it('uses a localized name for each close control', () => {
    render(
      <Dialog open>
        <DialogContent closeLabel="إغلاق النافذة">
          <DialogTitle>الأصول</DialogTitle>
          <DialogFooter showCloseButton closeLabel="إغلاق" />
        </DialogContent>
      </Dialog>,
    )
    expect(screen.getByRole('button', { name: 'إغلاق النافذة' })).toHaveClass('end-2')
    expect(screen.getByRole('button', { name: 'إغلاق' })).toBeVisible()
  })

  it('scrolls only the body, keeping the header and footer fixed', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assets</DialogTitle>
          </DialogHeader>
          <DialogBody>rows</DialogBody>
          <DialogFooter>actions</DialogFooter>
        </DialogContent>
      </Dialog>,
    )
    const body = screen.getByText('rows')
    expect(body).toHaveAttribute('data-slot', 'dialog-body')
    expect(body).toHaveClass('flex-1', 'min-h-0', 'overflow-y-auto')
    expect(screen.getByText('Assets').parentElement).toHaveClass('flex-none')
    expect(screen.getByText('actions')).toHaveClass('flex-none')
    // The popup is a bounded column, so the body has a height to scroll inside.
    expect(body.parentElement).toHaveClass('flex', 'flex-col', 'max-h-[85dvh]', 'overflow-hidden')
  })
})

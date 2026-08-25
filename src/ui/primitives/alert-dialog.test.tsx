import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog'

describe('AlertDialog', () => {
  it('renders every part when open', () => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent className="content">
          <AlertDialogHeader className="header">
            <AlertDialogTitle>Sure?</AlertDialogTitle>
            <AlertDialogDescription>No undo.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="footer">
            <AlertDialogCancel className="cancel">Cancel</AlertDialogCancel>
            <AlertDialogAction className="action">Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    )
    expect(screen.getByRole('alertdialog')).toHaveClass('content')
    expect(screen.getByText('Sure?')).toHaveClass('text-lg')
    expect(screen.getByText('No undo.')).toHaveClass('text-muted-foreground')
    expect(document.querySelector('[data-slot="alert-dialog-header"]')).toHaveClass('header')
    expect(document.querySelector('[data-slot="alert-dialog-footer"]')).toHaveClass('footer')
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveClass('cancel', 'border')
    expect(screen.getByRole('button', { name: 'Confirm' })).toHaveClass('action', 'bg-primary')
  })

  it('renders the portal and overlay standalone', () => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialogPortal>
          <AlertDialogOverlay className="overlay" />
        </AlertDialogPortal>
      </AlertDialog>,
    )
    expect(document.querySelector('.overlay')).toHaveClass('fixed', 'inset-0')
  })
})

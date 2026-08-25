import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet'

describe('Sheet', () => {
  it.each([
    ['right', 'border-l'],
    ['left', 'border-r'],
    ['top', 'border-b'],
    ['bottom', 'border-t'],
  ] as const)('renders the %s side', (side, expected) => {
    render(
      <Sheet defaultOpen>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent side={side} className="content">
          <SheetHeader className="header">
            <SheetTitle>Title</SheetTitle>
            <SheetDescription>Desc</SheetDescription>
          </SheetHeader>
          <SheetFooter className="footer">
            <SheetClose>Close me</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>,
    )
    expect(screen.getByRole('dialog')).toHaveClass('content', expected)
    expect(document.querySelector('[data-slot="sheet-header"]')).toHaveClass('header')
    expect(document.querySelector('[data-slot="sheet-footer"]')).toHaveClass('footer')
  })

  it('closes through SheetClose', async () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
          <SheetClose>Close me</SheetClose>
        </SheetContent>
      </Sheet>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Close me' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

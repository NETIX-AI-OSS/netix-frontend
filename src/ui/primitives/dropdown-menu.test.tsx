import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu'

describe('DropdownMenu', () => {
  it('renders every menu part when open', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent className="content">
          <DropdownMenuLabel inset>Label</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem inset>
              Plain
              <DropdownMenuShortcut className="shortcut">⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive">Danger</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="sep" />
          <DropdownMenuCheckboxItem checked>Checked</DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value="a">
            <DropdownMenuRadioItem value="a">Radio</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSub open>
            <DropdownMenuSubTrigger inset>More</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="sub">Nested</DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    expect(document.querySelector('[data-slot="dropdown-menu-content"]')).toHaveClass('content')
    expect(screen.getByText('Label')).toHaveAttribute('data-inset', 'true')
    expect(screen.getByText('Danger')).toHaveAttribute('data-variant', 'destructive')
    expect(screen.getByText('Plain')).toHaveAttribute('data-variant', 'default')
    expect(screen.getByText('⌘P')).toHaveClass('shortcut')
    expect(document.querySelector('[data-slot="dropdown-menu-separator"]')).toHaveClass('sep')
    expect(screen.getByRole('menuitemcheckbox')).toBeChecked()
    expect(screen.getByRole('menuitemradio')).toBeChecked()
    expect(screen.getByText('Nested')).toHaveClass('sub')
  })
})

'use client'

import { Bell, Folder, Moon, Search, Sun } from 'lucide-react'

import { AppTopbar as ShellTopbar } from '@/components/recipes'
import { LanguageSwitcher } from '@/components/sidebar/language-switcher'
import { useTheme } from '@/components/theme-context'
import { ProfileMenu } from '@/components/topbar/profile-menu'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const PROGRESSIVE_BLUR_LAYERS = [
  { blur: 0.5, solidUntil: 56, fadeUntil: 100 },
  { blur: 1, solidUntil: 48, fadeUntil: 85 },
  { blur: 1.5, solidUntil: 40, fadeUntil: 70 },
  { blur: 2, solidUntil: 32, fadeUntil: 58 },
  { blur: 2.5, solidUntil: 24, fadeUntil: 48 },
  { blur: 3, solidUntil: 16, fadeUntil: 38 },
] as const

function ProgressiveBlur() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-20 overflow-hidden">
      {PROGRESSIVE_BLUR_LAYERS.map(({ blur, solidUntil, fadeUntil }) => {
        const maskImage = `linear-gradient(to bottom, #000 0%, #000 ${solidUntil}%, transparent ${fadeUntil}%)`

        return (
          <div
            key={blur}
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
              maskImage,
              WebkitMaskImage: maskImage,
            }}
          />
        )
      })}
    </div>
  )
}

function ThemeMenu() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label="Change color theme" />}
      >
        <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppTopBar({ isHidden }: { isHidden: boolean }) {
  return (
    <ShellTopbar isHidden={isHidden}>
      <ProgressiveBlur />
      <div className="relative flex h-14 items-center gap-1.5 px-3 sm:px-4">
        <Button
          variant="ghost"
          size="default"
          className="hidden gap-2 bg-card/90 text-xs font-medium text-muted-foreground hover:bg-card md:inline-flex"
          aria-label="Open NETIX AI Assistant"
        >
          <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
          <span>NETIX AI Assistant</span>
        </Button>

        <button
          type="button"
          className="ml-auto flex h-8 w-40 items-center rounded-full bg-muted/90 px-3 text-left text-sm text-muted-foreground backdrop-blur sm:w-52"
        >
          <Search className="mr-2 size-3.5" />
          Search
        </button>

        <div
          role="group"
          aria-label="Workspace controls"
          className="ml-1 flex items-center gap-0.5 rounded-full bg-card/90 p-0.5 backdrop-blur"
        >
          <Button variant="ghost" size="icon-sm" aria-label="Files">
            <Folder className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="relative" aria-label="Notifications">
            <Bell className="size-4" />
            <span className="absolute right-0.5 top-0.5 size-1.5 rounded-full bg-primary ring-2 ring-card" />
          </Button>
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <ThemeMenu />
        </div>
        <ProfileMenu />
      </div>
    </ShellTopbar>
  )
}

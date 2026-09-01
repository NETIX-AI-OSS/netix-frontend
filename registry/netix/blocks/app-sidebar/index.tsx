import {
  Activity,
  Blocks,
  Building2,
  ChevronDown,
  CircleHelp,
  Home,
  LayoutGrid,
  LockKeyhole,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { type ReactElement, useState } from 'react'
import { NavLink } from 'react-router'

import CompanyLogo from '@/assets/logo.png'
import CompanyBrand from '@/assets/netix-ai.svg'
import { AppSidebar as ShellSidebar } from '@/components/recipes'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const workspaceNav = [
  { name: t('home'), url: '/', icon: Home, end: true },
  { name: t('profile'), url: '/profile', icon: UserRound },
  { name: t('permissions'), url: '/permissions', icon: ShieldCheck },
  { name: t('security'), url: '/security', icon: LockKeyhole },
]

const productAreas = [
  { name: 'Workspace', icon: LayoutGrid, active: true },
  { name: 'AI assistant', icon: Sparkles },
  { name: 'Messages', icon: MessageCircle, hasUpdate: true },
  { name: 'Operations', icon: Activity },
  { name: 'Apps', icon: Blocks },
]

function RailHint({
  label,
  collapsed,
  children,
}: {
  label: string
  collapsed: boolean
  children: ReactElement
}) {
  if (!collapsed) return children
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

export function AppSidebar() {
  const [expanded, setExpanded] = useState(false)

  return (
    <TooltipProvider>
      <ShellSidebar
        className={cn(
          'flex overflow-hidden border-r bg-card text-foreground transition-[width] duration-200 md:flex',
          expanded ? 'w-52' : 'w-14',
        )}
      >
        <nav aria-label="Product areas" className="flex w-full flex-col gap-2 p-3">
          <RailHint label="NETIX home" collapsed={!expanded}>
            <NavLink
              to="/"
              aria-label="NETIX home"
              className={cn(
                'mb-1 flex h-8 items-center text-sm font-semibold tracking-tight',
                expanded ? 'gap-2.5 rounded-lg' : 'justify-center rounded-full',
              )}
            >
              <img src={CompanyLogo} alt="" className="size-7 shrink-0" />
              {expanded && <img src={CompanyBrand} alt="NETIX" className="h-[18px] w-auto" />}
            </NavLink>
          </RailHint>

          {productAreas.map(({ name, icon: Icon, active, hasUpdate }) => (
            <RailHint key={name} label={name} collapsed={!expanded}>
              <button
                type="button"
                aria-label={name}
                className={cn(
                  'relative flex h-8 w-full items-center text-sm transition-colors',
                  expanded ? 'gap-3 rounded-lg px-2.5' : 'justify-center rounded-full',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="size-4 shrink-0" />
                {expanded && <span className="truncate">{name}</span>}
                {hasUpdate && (
                  <span className="absolute right-0 top-0 size-1.5 rounded-full bg-primary ring-2 ring-card" />
                )}
              </button>
            </RailHint>
          ))}

          <RailHint label="Add workspace" collapsed={!expanded}>
            <button
              type="button"
              aria-label="Add workspace"
              className={cn(
                'flex h-8 w-full items-center text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                expanded ? 'gap-3 rounded-lg px-2.5' : 'justify-center rounded-full',
              )}
            >
              <Plus className="size-4 shrink-0" />
              {expanded && <span className="whitespace-nowrap">Add workspace</span>}
            </button>
          </RailHint>

          <div className="mt-auto flex flex-col gap-1">
            {[
              { name: t('support'), url: '/support', icon: CircleHelp },
              { name: t('settings'), url: '/settings', icon: Settings },
            ].map(({ name, url, icon: Icon }) => (
              <RailHint key={url} label={name} collapsed={!expanded}>
                <NavLink
                  to={url}
                  aria-label={name}
                  className={cn(
                    'flex h-8 items-center text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                    expanded ? 'gap-3 rounded-lg px-2.5' : 'justify-center rounded-full',
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {expanded && <span>{name}</span>}
                </NavLink>
              </RailHint>
            ))}
            <button
              type="button"
              aria-label={expanded ? 'Collapse product rail' : 'Expand product rail'}
              onClick={() => setExpanded((value) => !value)}
              className={cn(
                'flex h-8 items-center text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                expanded ? 'gap-3 rounded-lg px-2.5' : 'justify-center rounded-full',
              )}
            >
              {expanded ? (
                <PanelLeftClose className="size-4" />
              ) : (
                <PanelLeftOpen className="size-4" />
              )}
              {expanded && <span>Collapse</span>}
            </button>
          </div>
        </nav>
      </ShellSidebar>
    </TooltipProvider>
  )
}

export function WorkspaceSidebar() {
  return (
    <aside className="hidden w-52 shrink-0 flex-col border-r bg-card md:flex">
      <div className="p-3">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-muted"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-subtle text-primary">
            <Building2 className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] text-muted-foreground">Current workspace</span>
            <span className="block truncate text-sm font-semibold">NETIX workspace</span>
          </span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-3">
        <p className="px-2 pb-2 pt-2 text-[11px] font-semibold uppercase tracking-[.12em] text-muted-foreground">
          Account
        </p>
        <nav aria-label="Workspace navigation" className="flex flex-col gap-1">
          {workspaceNav.map(({ name, url, icon: Icon, end }) => (
            <NavLink
              key={url}
              to={url}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex h-8 items-center gap-2 rounded-lg px-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              <Icon className="size-4" />
              <span>{name}</span>
            </NavLink>
          ))}
        </nav>

        <p className="mt-6 px-2 pb-2 text-[11px] font-semibold uppercase tracking-[.12em] text-muted-foreground">
          Resources
        </p>
        <NavLink
          to="/foundations/design-system"
          className={({ isActive }) =>
            cn(
              'flex h-8 items-center gap-2 rounded-lg px-2.5 text-sm transition-colors',
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )
          }
        >
          <Blocks className="size-4" />
          Design system
        </NavLink>

        <div className="mt-auto rounded-xl bg-muted p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Team plan</span>
            <span className="text-xs text-muted-foreground">12 of 20</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background">
            <div className="h-full w-3/5 rounded-full bg-primary" />
          </div>
          <button type="button" className="mt-3 text-xs font-medium text-primary">
            Manage seats
          </button>
        </div>
      </div>
    </aside>
  )
}

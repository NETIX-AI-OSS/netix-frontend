import { Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState, ErrorState } from '@/components/ui/feedback-state'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="mb-2 text-xs font-medium text-muted-foreground">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold tracking-[-0.025em] sm:text-[2rem]">{title}</h1>
        {description && (
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}
export function PageSection({
  title,
  description,
  children,
  className,
}: {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('flex flex-col gap-4', className)}>
      {title && (
        <div>
          <h2 className="font-semibold">{title}</h2>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      {children}
    </section>
  )
}

export function SettingsPanel({
  title,
  description,
  children,
  footer,
  className,
  headerClassName,
}: {
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
  headerClassName?: string
}) {
  return (
    <section className={cn('overflow-hidden rounded-xl border-0 bg-card shadow-none', className)}>
      <div className={cn('border-b px-5 py-4 sm:px-6', headerClassName)}>
        <h2 className="text-sm font-semibold">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
      {footer && (
        <div className="flex justify-end gap-2 border-t bg-muted/40 px-5 py-3 sm:px-6">
          {footer}
        </div>
      )}
    </section>
  )
}

export function SettingRow({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-4 border-b py-5 first:pt-0 last:border-0 last:pb-0 sm:grid-cols-[minmax(180px,.7fr)_minmax(0,1fr)] sm:gap-10">
      <div>
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
export function FilterBar({
  children,
  searchPlaceholder = 'Search',
}: {
  children?: React.ReactNode
  searchPlaceholder?: string
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card p-3 shadow-none sm:flex-row sm:items-center">
      <div className="relative min-w-52 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input aria-label={searchPlaceholder} placeholder={searchPlaceholder} className="pl-9" />
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  )
}
export const ListPageLayout = ({
  header,
  filters,
  children,
}: {
  header: React.ReactNode
  filters?: React.ReactNode
  children: React.ReactNode
}) => (
  <main className="flex flex-col gap-6 p-5 sm:p-7">
    {header}
    {filters}
    {children}
  </main>
)
export const DetailPageLayout = ({
  header,
  children,
}: {
  header: React.ReactNode
  children: React.ReactNode
}) => (
  <main className="flex max-w-6xl flex-col gap-6 p-5 sm:p-7">
    {header}
    {children}
  </main>
)
export const SettingsPageLayout = DetailPageLayout
export const DashboardGrid = ({ className, ...props }: React.ComponentProps<'div'>) => (
  <div className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-4', className)} {...props} />
)
export function MetricCard({
  label,
  value,
  change,
  icon,
  emphasis = false,
}: {
  label: string
  value: string
  change?: string
  icon: React.ReactNode
  emphasis?: boolean
}) {
  return (
    <Card className={cn('border-0 shadow-none', emphasis && 'bg-sidebar text-sidebar-foreground')}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={cn('rounded-xl p-2.5', emphasis ? 'bg-white/10' : 'bg-muted')}>
            {icon}
          </div>
          <span
            className={cn(
              'text-lg',
              emphasis ? 'text-sidebar-foreground' : 'text-muted-foreground',
            )}
          >
            ›
          </span>
        </div>
        <p className={cn('mt-4 text-sm font-semibold', emphasis && 'text-sidebar-foreground')}>
          {label}
        </p>
        <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
        {change && (
          <p
            className={cn(
              'mt-3 text-sm',
              emphasis ? 'text-sidebar-foreground/70' : 'text-muted-foreground',
            )}
          >
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
export function FeedbackState({
  type = 'empty',
  ...props
}: {
  type?: 'empty' | 'error'
  title?: string
  description?: string
  onRetry?: () => void
}) {
  return type === 'error' ? <ErrorState {...props} /> : <EmptyState {...props} />
}
export function DataTableShell({
  state = 'ready',
  children,
}: {
  state?: 'ready' | 'loading' | 'empty' | 'error'
  children?: React.ReactNode
}) {
  if (state === 'loading')
    return (
      <div className="flex flex-col gap-3 rounded-xl bg-card p-5 shadow-none">
        <div className="h-7 w-1/3 animate-pulse rounded bg-muted" />
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-10 animate-pulse rounded bg-muted" />
        ))}
      </div>
    )
  if (state === 'empty') return <EmptyState />
  if (state === 'error') return <ErrorState />
  return <div className="overflow-hidden rounded-xl bg-card shadow-none">{children}</div>
}
type ShellSlotProps = {
  children: React.ReactNode
  className?: string
}

export const AppShell = ({ children }: Pick<ShellSlotProps, 'children'>) => (
  <div className="h-dvh overflow-hidden bg-background">{children}</div>
)
export const AppSidebar = ({ children, className }: ShellSlotProps) => (
  <aside className={cn('hidden h-full shrink-0', className)}>{children}</aside>
)
export const AppTopbar = ({
  children,
  className,
  isHidden = false,
}: ShellSlotProps & {
  isHidden?: boolean
}) => (
  <header
    className={cn(
      'absolute inset-x-0 top-0 z-30 h-14 shadow-none transition-transform duration-300 ease-out',
      isHidden ? '-translate-y-full' : 'translate-y-0',
      className,
    )}
  >
    {children}
  </header>
)
export { Button }

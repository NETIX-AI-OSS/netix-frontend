import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export type LoadingVariant =
  'page' | 'route' | 'section' | 'card' | 'table' | 'chart' | 'inline' | 'button'

export type LoadingStateProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: LoadingVariant
  rows?: number
  lines?: number
  label?: string
  /** @deprecated pass `variant` instead */
  size?: number
  /** @deprecated no longer honoured */
  color?: string
  /** @deprecated pass `variant='section'` instead */
  center?: boolean
  /** @deprecated no longer honoured */
  name?: string
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function inferVariant({
  variant,
  center,
  size,
}: Pick<LoadingStateProps, 'variant' | 'center' | 'size'>): LoadingVariant {
  if (variant) return variant
  if (center) return 'section'
  if (typeof size === 'number' && size <= 24) return 'button'
  return 'inline'
}

function PageLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-80 w-full md:col-span-2 xl:col-span-3" />
      <Skeleton className="h-80 w-full xl:col-span-1" />
    </div>
  )
}

function RouteLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-5 w-96 max-w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

function SectionLoading() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-44 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}

function CardLoading({ lines }: { lines: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-9 w-28" />
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton key={index} className={cn('h-3', index === lines - 1 ? 'w-2/3' : 'w-full')} />
        ))}
      </div>
    </div>
  )
}

function TableLoading({ rows }: { rows: number }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="grid grid-cols-4 gap-2">
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-7 w-full" />
        </div>
      ))}
    </div>
  )
}

function ChartLoading() {
  return (
    <div className="flex h-full min-h-32 w-full flex-col gap-2.5">
      <div className="relative min-h-24 flex-1 overflow-hidden border-b border-l border-border/45">
        <span className="absolute inset-x-0 top-1/4 border-t border-dashed border-border/40" />
        <span className="absolute inset-x-0 top-1/2 border-t border-dashed border-border/40" />
        <span className="absolute inset-x-0 top-3/4 border-t border-dashed border-border/40" />
        <Skeleton className="absolute inset-x-0 bottom-0 h-[72%] rounded-none opacity-70 [clip-path:polygon(0_84%,8%_72%,16%_76%,25%_48%,34%_55%,43%_38%,51%_64%,60%_50%,69%_56%,78%_27%,88%_36%,100%_18%,100%_100%,0_100%)]" />
      </div>
      <Skeleton className="h-6 w-full rounded-sm opacity-75" />
    </div>
  )
}

const VARIANT_CLASS: Record<LoadingVariant, string> = {
  page: 'w-full space-y-4',
  route: 'w-full max-w-5xl space-y-4',
  section: 'w-full max-w-xl space-y-3',
  card: 'w-full space-y-3',
  table: 'w-full space-y-3',
  chart: 'w-full',
  inline: 'inline-flex items-center',
  button: 'inline-flex items-center',
}

export function LoadingState({
  variant,
  rows = 5,
  lines = 3,
  label = 'Loading',
  className,
  center,
  size,
  color,
  name,
  ...props
}: LoadingStateProps) {
  // Pulled out of the props so the dead compat props never reach the DOM.
  void color
  void name
  const resolvedVariant = inferVariant({ variant, center, size })
  const safeRows = clamp(rows, 1, 12)
  const safeLines = clamp(lines, 1, 6)

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      data-loading-variant={resolvedVariant}
      className={cn(
        center && 'flex h-full w-full items-center justify-center',
        VARIANT_CLASS[resolvedVariant],
        className,
      )}
      {...props}
    >
      <span className="sr-only">{label}</span>
      {resolvedVariant === 'page' && <PageLoading />}
      {resolvedVariant === 'route' && <RouteLoading />}
      {resolvedVariant === 'section' && <SectionLoading />}
      {resolvedVariant === 'card' && <CardLoading lines={safeLines} />}
      {resolvedVariant === 'table' && <TableLoading rows={safeRows} />}
      {resolvedVariant === 'chart' && <ChartLoading />}
      {resolvedVariant === 'inline' && <Skeleton className="h-4 w-20 rounded-sm" />}
      {resolvedVariant === 'button' && <Skeleton className="h-4 w-4 rounded-sm" />}
    </div>
  )
}

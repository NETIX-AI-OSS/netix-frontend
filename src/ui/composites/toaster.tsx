import { Toaster as Sonner, type ToasterProps } from 'sonner'

// theme is a prop: the fleet has three different theme providers and none can live in /ui.
export function Toaster({ theme = 'system', className, style, ...props }: ToasterProps) {
  return (
    <Sonner
      theme={theme}
      className={className ?? 'toaster group'}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          ...style,
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export type { ToasterProps }

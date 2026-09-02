import { FolderOpen } from 'lucide-react'

import { cn } from '@/lib/utils'

export type EmptyStateProps = {
  text?: string
  icon?: React.ReactNode
  className?: string
}

export function EmptyState({ text = 'No data found', icon, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'mt-32 flex items-center justify-center gap-2 text-secondary-foreground',
        className,
      )}
    >
      {icon ?? <FolderOpen />}
      <span className="text-lg">{text}</span>
    </div>
  )
}

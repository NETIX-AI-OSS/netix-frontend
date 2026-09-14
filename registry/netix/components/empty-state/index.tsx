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
        // Fill the space the parent gives us and centre in it; a hard `mt-32` dropped the
        // message 8rem below the header however tall the body actually was.
        'flex w-full flex-1 items-center justify-center gap-2 p-6 text-secondary-foreground',
        className,
      )}
    >
      {icon ?? <FolderOpen />}
      <span className="text-lg">{text}</span>
    </div>
  )
}

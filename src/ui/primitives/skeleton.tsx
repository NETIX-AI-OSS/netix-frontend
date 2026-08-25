import * as React from 'react'

import { cn } from '../../utils/cn'

type SkeletonProps = React.ComponentProps<'div'> & {
  animate?: boolean
  variant?: 'block' | 'text' | 'circle'
}

function Skeleton({ className, animate = true, variant = 'block', ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'bg-[var(--skeleton-base)]',
        animate &&
          'animate-shimmer bg-[linear-gradient(110deg,var(--skeleton-base)_8%,var(--skeleton-highlight)_18%,var(--skeleton-base)_33%)] bg-[length:220%_100%] motion-reduce:animate-none',
        variant === 'block' && 'h-4 w-full rounded-md',
        variant === 'text' && 'h-4 w-full rounded',
        variant === 'circle' && 'size-10 rounded-full',
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton, type SkeletonProps }

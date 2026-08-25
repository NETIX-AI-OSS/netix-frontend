import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '../../utils/cn'

const typographyVariants = cva('text-xl', {
  variants: {
    variant: {
      // Every fleet copy had 'lg: text-5xl'; the stray space killed both classes, so h1 never scaled.
      h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
      h2: 'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
      h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
      h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
      p: 'leading-7 [&:not(:first-child)]:mt-6',
    },
    affects: {
      default: '',
      lead: 'text-xl text-muted-foreground',
      large: 'text-lg font-semibold',
      small: 'text-sm font-medium leading-none',
      muted: 'text-sm text-muted-foreground',
      removePMargin: '[&:not(:first-child)]:mt-0',
    },
  },
  defaultVariants: { variant: 'h1', affects: 'default' },
})

type TypographyProps = React.HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof typographyVariants>

function Typography({ className, variant, affects, ...props }: TypographyProps) {
  const Comp = variant || 'p'
  return <Comp className={cn(typographyVariants({ variant, affects, className }))} {...props} />
}

// Named wrappers keep asset-ui's and viz-ui's call sites working on the cva component.
function TypographyH1(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return <Typography variant="h1" {...props} />
}

function TypographyH2(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return <Typography variant="h2" {...props} />
}

function TypographyH3(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return <Typography variant="h3" {...props} />
}

function TypographyH4(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return <Typography variant="h4" {...props} />
}

function TypographyP(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return <Typography variant="p" {...props} />
}

function TypographyMuted(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return <Typography variant="p" affects="muted" {...props} />
}

export {
  Typography,
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyMuted,
  TypographyP,
  type TypographyProps,
  typographyVariants,
}

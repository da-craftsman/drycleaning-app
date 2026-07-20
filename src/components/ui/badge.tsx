import * as React from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-label-sm uppercase',
  {
    variants: {
      variant: {
        neutral: 'bg-surface-container text-on-surface-variant',
        primary: 'bg-primary/10 text-primary',
        express: 'bg-secondary-container text-on-secondary-container',
        success: 'bg-success-green/10 text-success-green',
        urgent: 'bg-urgent-express/10 text-urgent-express',
        error: 'bg-error-container text-on-error-container',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />
}

export { Badge, badgeVariants }

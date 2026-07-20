import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-sans font-bold transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-on-primary hover:bg-primary/90 active:bg-primary/95',
        express:
          'bg-secondary-container text-on-secondary-container hover:bg-secondary-container/90 active:bg-secondary-container/95',
        ghost: 'border border-primary text-primary bg-transparent hover:bg-primary/5 active:bg-primary/10',
        outline:
          'border border-outline-variant text-on-surface bg-transparent hover:bg-surface-container-low',
        destructive: 'bg-error text-on-error hover:bg-error/90 active:bg-error/95',
        subtle: 'bg-surface-container text-on-surface hover:bg-surface-container-high',
        link: 'text-primary underline-offset-4 hover:underline p-0 h-auto font-semibold',
      },
      size: {
        sm: 'h-9 px-3 text-label-md',
        md: 'h-11 px-5 text-body-md',
        lg: 'h-13 px-6 text-body-lg',
        icon: 'h-11 w-11 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }

import * as React from 'react'
import { cn } from '@/lib/utils'

function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded bg-surface-container-lowest border border-outline-variant/40',
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-stack-sm p-stack-md', className)} {...props} />
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('font-display text-headline-md text-on-surface', className)} {...props} />
  )
}

function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-body-md text-on-surface-variant', className)} {...props} />
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-stack-md pt-0', className)} {...props} />
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center p-stack-md pt-0', className)} {...props} />
}

interface SelectionCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean
}

/** A pressable card used for tier/option selection — presses inward with a 2px primary stroke when selected. */
function SelectionCard({ className, selected, ...props }: SelectionCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'rounded border bg-surface-container-lowest p-stack-md text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        selected
          ? 'border-2 border-primary bg-primary/5 shadow-[inset_0_1px_2px_rgb(0,0,0,0.06)] translate-y-px'
          : 'border-outline-variant/40 hover:border-outline',
        className,
      )}
      {...props}
    />
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, SelectionCard }

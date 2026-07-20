import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, error, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded border bg-surface-container-lowest px-3 text-body-md text-on-surface placeholder:text-on-surface-variant/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50',
        error
          ? 'border-error bg-error-container/20 focus-visible:ring-error/40'
          : 'border-outline-variant focus-visible:border-primary',
        className,
      )}
      aria-invalid={error}
      {...props}
    />
  )
})
Input.displayName = 'Input'

function Textarea({ className, error, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return (
    <textarea
      className={cn(
        'flex min-h-24 w-full rounded border bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface placeholder:text-on-surface-variant/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50',
        error
          ? 'border-error bg-error-container/20 focus-visible:ring-error/40'
          : 'border-outline-variant focus-visible:border-primary',
        className,
      )}
      aria-invalid={error}
      {...props}
    />
  )
}

function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null
  return <p className="text-label-md text-error mt-1">{children}</p>
}

export { Input, Textarea, FieldError }

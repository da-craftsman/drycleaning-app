import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '@/lib/utils'

function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        'text-label-sm uppercase text-on-surface-variant tracking-wide',
        className,
      )}
      {...props}
    />
  )
}

export { Label }

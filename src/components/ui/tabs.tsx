import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  // min-w-0 lets TabsList's overflow-x-auto actually scroll instead of widening flex-col ancestors
  // (a flex item's automatic minimum size is its content size unless explicitly zeroed).
  return <TabsPrimitive.Root className={cn('min-w-0', className)} {...props} />
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        'flex min-w-0 items-center gap-1 overflow-x-auto scrollbar-none border-b border-outline-variant/40',
        className,
      )}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'shrink-0 whitespace-nowrap border-b-2 border-transparent px-4 py-3 text-label-md text-on-surface-variant transition-colors hover:text-on-surface data-[state=active]:border-primary data-[state=active]:text-primary focus-visible:outline-none',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn('focus-visible:outline-none', className)} {...props} />
}

export { Tabs, TabsList, TabsTrigger, TabsContent }

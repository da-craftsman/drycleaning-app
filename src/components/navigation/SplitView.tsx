import type * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Desktop ordering-flow layout: catalog on the left, a sticky live cart summary on the right.
 * Collapses to a single stacked column below `lg` — pair with a floating cart button there.
 */
function SplitView({
  main,
  aside,
  className,
}: {
  main: React.ReactNode
  aside: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('grid grid-cols-1 gap-stack-lg lg:grid-cols-[1fr_380px]', className)}>
      <div className="min-w-0">{main}</div>
      <aside className="min-w-0">
        <div className="lg:sticky lg:top-20">{aside}</div>
      </aside>
    </div>
  )
}

export { SplitView }

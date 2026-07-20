import { cn } from '@/lib/utils'
import type { OrderStatus, OrderStatusHistoryEntry } from '@/types/database'

const stages: { key: OrderStatus; label: string; description: string }[] = [
  { key: 'order_received', label: 'Order Received', description: "We've received your order and confirmed the details." },
  { key: 'collected', label: 'Collected', description: 'Your items have been picked up and logged in.' },
  { key: 'processing', label: 'Processing', description: 'Your items are being sorted and prepped for cleaning.' },
  { key: 'washing', label: 'Washing', description: 'Your clothes are being carefully washed right now.' },
  { key: 'ironing', label: 'Ironing', description: 'Your clothes are being pressed and neatly ironed.' },
  { key: 'quality_check', label: 'Quality Check', description: "We're inspecting every item before it's packed up." },
  { key: 'ready', label: 'Ready', description: 'Your order is packed and ready for delivery.' },
  { key: 'out_for_delivery', label: 'Out for Delivery', description: 'Your rider is on the way to you now.' },
  { key: 'completed', label: 'Completed', description: 'Delivered successfully. Thanks for choosing Shalah Rex Laundry!' },
]

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** Chronological tracking status feed: "Order Received" on top, progressing down to "Completed". */
function TrackingTimeline({ status, history }: { status: OrderStatus; history: OrderStatusHistoryEntry[] }) {
  if (status === 'cancelled') {
    return (
      <div className="rounded-lg border border-error/40 bg-error-container/30 p-stack-md text-center">
        <p className="text-label-md font-bold text-on-error-container">This order was cancelled.</p>
      </div>
    )
  }

  const currentIndex = stages.findIndex((s) => s.key === status)

  const rows = stages.map((stage, i) => ({
    stage,
    state: (i < currentIndex ? 'done' : i === currentIndex ? 'active' : 'upcoming') as 'done' | 'active' | 'upcoming',
    timestamp: history.find((h) => h.status === stage.key)?.created_at,
  }))

  return (
    <ol className="flex flex-col">
      {rows.map((row, i) => {
        const isLast = i === rows.length - 1
        const reached = row.state !== 'upcoming'
        return (
          <li key={row.stage.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              {row.state === 'active' ? (
                <span className="relative mt-1.5 flex h-2.5 w-2.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                </span>
              ) : (
                <span className={cn('mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full', reached ? 'bg-primary' : 'bg-outline-variant')} />
              )}
              {!isLast && <span className={cn('w-px flex-1 min-h-12', reached ? 'bg-primary/40' : 'bg-outline-variant')} />}
            </div>
            <div className="pb-stack-md">
              <p className={cn('text-label-md', reached ? 'font-bold text-on-surface' : 'text-on-surface-variant')}>{row.stage.label}</p>
              <p className="text-label-sm text-on-surface-variant">{row.stage.description}</p>
              {row.timestamp && <p className="mt-0.5 text-label-sm text-on-surface-variant/70">{formatTimestamp(row.timestamp)}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export { TrackingTimeline, stages }

import { useMemo } from 'react'
import { OrdersList } from '@/features/dashboard/OrdersList'
import { useAuth } from '@/hooks/useAuth'
import { useOrdersForUser } from '@/lib/queries/useOrders'
import { groupOrdersByYearMonth } from '@/lib/orderHistory'
import { Skeleton } from '@/components/ui/skeleton'

export default function AccountHistoryPage() {
  const { profile } = useAuth()
  const { data: orders, isLoading } = useOrdersForUser(profile?.id)

  const yearGroups = useMemo(() => groupOrdersByYearMonth(orders ?? []), [orders])

  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl px-margin-mobile py-stack-lg md:px-gutter">
      <h1 className="mb-stack-md text-headline-lg-mobile font-display text-laundry-blue-deep md:text-headline-lg">History</h1>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : yearGroups.length === 0 ? (
        <p className="py-stack-lg text-center text-body-md text-on-surface-variant">No orders yet.</p>
      ) : (
        <div className="flex flex-col gap-stack-lg">
          {yearGroups.map(({ year, months }) => (
            <section key={year}>
              <h2 className="mb-stack-sm text-headline-md font-display text-on-surface">{year}</h2>
              <div className="flex flex-col gap-stack-md">
                {months.map(({ month, monthLabel, orders: monthOrders }) => (
                  <div key={month}>
                    <h3 className="mb-stack-sm text-label-md font-bold uppercase text-on-surface-variant">{monthLabel}</h3>
                    <OrdersList orders={monthOrders} isLoading={false} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

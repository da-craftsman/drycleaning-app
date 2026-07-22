import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { OrdersTable } from '@/features/admin/OrdersTable'
import { useAllOrders } from '@/lib/queries/useOrders'
import { groupOrdersByYearMonth } from '@/lib/orderHistory'

export default function AdminOrderHistoryPage() {
  const { data: orders, isLoading } = useAllOrders()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!orders) return orders
    const q = search.trim().toLowerCase()
    if (!q) return orders
    return orders.filter((o) => o.display_id.toLowerCase().includes(q))
  }, [orders, search])

  const yearGroups = useMemo(() => groupOrdersByYearMonth(filtered ?? []), [filtered])

  return (
    <div className="mx-auto w-full min-w-0 max-w-shell px-margin-mobile py-stack-lg md:px-gutter">
      <h1 className="mb-stack-md text-headline-lg-mobile font-display text-laundry-blue-deep md:text-headline-lg">Order History</h1>
      <p className="mb-stack-md text-label-sm text-on-surface-variant">
        Every order ever placed, archived by year and month. This month's orders also still appear on the Orders page.
      </p>
      <Input
        placeholder="Search by order number…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-stack-md max-w-sm"
      />

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : yearGroups.length === 0 ? (
        <p className="py-stack-lg text-center text-body-md text-on-surface-variant">No orders found.</p>
      ) : (
        <div className="flex flex-col gap-stack-lg">
          {yearGroups.map(({ year, months }) => (
            <section key={year}>
              <h2 className="mb-stack-sm text-headline-md font-display text-on-surface">{year}</h2>
              <div className="flex flex-col gap-stack-md">
                {months.map(({ month, monthLabel, orders: monthOrders }) => (
                  <div key={month}>
                    <h3 className="mb-stack-sm text-label-md font-bold uppercase text-on-surface-variant">{monthLabel}</h3>
                    <OrdersTable orders={monthOrders} isLoading={false} />
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

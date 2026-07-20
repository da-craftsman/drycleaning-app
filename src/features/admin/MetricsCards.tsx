import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatNaira } from '@/features/catalog/ItemCard'
import type { Order } from '@/types/database'

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

function isSameDay(a: Date, b: Date) {
  return isSameMonth(a, b) && a.getDate() === b.getDate()
}

const PENDING_LOGISTICS = new Set(['order_received', 'collected', 'processing'])

function MetricsCards({ orders, isLoading }: { orders?: Order[]; isLoading: boolean }) {
  if (isLoading || !orders) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  const now = new Date()
  const monthlyRevenue = orders
    .filter((o) => isSameMonth(new Date(o.created_at), now) && o.payment_status === 'paid')
    .reduce((sum, o) => sum + o.total, 0)
  const todaysOrders = orders.filter((o) => isSameDay(new Date(o.created_at), now)).length
  const pendingLogistics = orders.filter((o) => PENDING_LOGISTICS.has(o.status)).length

  const userOrderCounts = new Map<string, number>()
  orders.forEach((o) => userOrderCounts.set(o.user_id, (userOrderCounts.get(o.user_id) ?? 0) + 1))
  const repeatCustomers = [...userOrderCounts.values()].filter((n) => n > 1).length

  const stats = [
    { label: "This Month's Revenue", value: formatNaira(monthlyRevenue) },
    { label: "Today's Orders", value: String(todaysOrders) },
    { label: 'Pending Logistics', value: String(pendingLogistics) },
    { label: 'Repeat Customers', value: String(repeatCustomers) },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="pt-stack-md">
            <p className="text-label-sm uppercase text-on-surface-variant">{stat.label}</p>
            <p className="mt-1 text-headline-md font-display text-on-surface">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export { MetricsCards }

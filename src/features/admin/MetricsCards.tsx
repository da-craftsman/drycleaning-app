import { Repeat, ShoppingBag, Truck, Wallet } from 'lucide-react'
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
    { label: "This Month's Revenue", value: formatNaira(monthlyRevenue), icon: Wallet },
    { label: "Today's Orders", value: String(todaysOrders), icon: ShoppingBag },
    { label: 'Pending Logistics', value: String(pendingLogistics), icon: Truck },
    { label: 'Repeat Customers', value: String(repeatCustomers), icon: Repeat },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <Card key={label}>
          <CardContent className="flex items-start justify-between gap-2 pt-stack-md">
            <div className="min-w-0">
              <p className="text-label-sm uppercase text-on-surface-variant">{label}</p>
              <p className="mt-1 truncate text-headline-md font-display text-on-surface">{value}</p>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export { MetricsCards }

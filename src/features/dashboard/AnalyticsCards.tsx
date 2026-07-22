import { useQueries } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getOrderItems } from '@/lib/data/orders'
import { queryKeys } from '@/lib/queries/keys'
import { paths } from '@/routes/paths'
import type { Order } from '@/types/database'

function AnalyticsCards({ orders, isLoading }: { orders?: Order[]; isLoading: boolean }) {
  const itemQueries = useQueries({
    queries: (orders ?? []).map((o) => ({
      queryKey: queryKeys.orderItems(o.id),
      queryFn: () => getOrderItems(o.id),
      enabled: Boolean(orders),
    })),
  })

  const totalOrders = orders?.length ?? 0

  const itemCounts = new Map<string, number>()
  itemQueries.forEach((q) => {
    q.data?.forEach((line) => {
      itemCounts.set(line.item_name, (itemCounts.get(line.item_name) ?? 0) + line.quantity)
    })
  })
  const mostCleaned = [...itemCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  const stats = [
    { label: 'Total Orders', value: String(totalOrders) },
    { label: 'Most Cleaned Item', value: mostCleaned ?? 'N/A' },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="pt-stack-md">
            <p className="text-label-sm uppercase text-on-surface-variant">{stat.label}</p>
            <p className="mt-1 text-headline-md font-display text-on-surface">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
      <Link to={paths.accountHistory}>
        <Card className="h-full transition-shadow hover:shadow-soft-lift">
          <CardContent className="flex h-full flex-col justify-center gap-2 pt-stack-md">
            <Clock className="h-5 w-5 text-primary" />
            <p className="text-label-sm uppercase text-on-surface-variant">History</p>
            <p className="text-label-md font-bold normal-case text-on-surface">View past orders by month</p>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}

export { AnalyticsCards }

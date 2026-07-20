import { useQueries } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatNaira } from '@/features/catalog/ItemCard'
import { getOrderItems } from '@/lib/data/orders'
import { queryKeys } from '@/lib/queries/keys'
import type { Order } from '@/types/database'

function AnalyticsCards({ orders, isLoading }: { orders?: Order[]; isLoading: boolean }) {
  const itemQueries = useQueries({
    queries: (orders ?? []).map((o) => ({
      queryKey: queryKeys.orderItems(o.id),
      queryFn: () => getOrderItems(o.id),
      enabled: Boolean(orders),
    })),
  })

  const totalSpent = orders?.reduce((sum, o) => sum + o.total, 0) ?? 0
  const totalOrders = orders?.length ?? 0

  const itemCounts = new Map<string, number>()
  itemQueries.forEach((q) => {
    q.data?.forEach((line) => {
      itemCounts.set(line.item_name, (itemCounts.get(line.item_name) ?? 0) + line.quantity)
    })
  })
  const favorite = [...itemCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]

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
    { label: 'Total Spent', value: formatNaira(totalSpent) },
    { label: 'Total Orders', value: String(totalOrders) },
    { label: 'Favorite Item', value: favorite ?? 'N/A' },
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
    </div>
  )
}

export { AnalyticsCards }

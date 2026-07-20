import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { OrderStatusBadge } from '@/features/dashboard/OrderStatusBadge'
import { formatNaira } from '@/features/catalog/ItemCard'
import { paths } from '@/routes/paths'
import type { Order } from '@/types/database'

function OrdersList({
  orders,
  isLoading,
  emptyLabel = 'No orders yet.',
  linkTo = paths.accountOrder,
}: {
  orders?: Order[]
  isLoading: boolean
  emptyLabel?: string
  /** Defaults to the customer account order route — pass paths.adminOrder when rendering inside admin. */
  linkTo?: (id: string) => string
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-stack-lg text-center">
        <Package className="h-8 w-8 text-outline" strokeWidth={1.5} />
        <p className="text-body-md text-on-surface-variant">{emptyLabel}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {orders.map((order) => (
        <Link key={order.id} to={linkTo(order.id)}>
          <Card className="transition-shadow hover:shadow-soft-lift">
            <CardContent className="flex items-center justify-between gap-3 pt-stack-md">
              <div className="flex flex-col gap-1">
                <p className="text-label-md font-bold normal-case text-on-surface">{order.display_id}</p>
                <p className="text-label-sm text-on-surface-variant">
                  {new Date(order.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <OrderStatusBadge status={order.status} />
                <p className="text-label-md font-bold text-on-surface">{formatNaira(order.total)}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

export { OrdersList }

import { Link } from 'react-router-dom'
import { OrderStatusBadge } from '@/features/dashboard/OrderStatusBadge'
import { formatNaira } from '@/features/catalog/ItemCard'
import { paths } from '@/routes/paths'
import type { Order } from '@/types/database'

/** One line per order, dense enough that 15-20 fit on screen at once — for History views where
 * users are scanning for a specific order rather than acting on its current status. */
function CompactOrdersList({ orders, linkTo = paths.accountOrder }: { orders: Order[]; linkTo?: (id: string) => string }) {
  return (
    <div className="flex flex-col divide-y divide-outline-variant/40 rounded border border-outline-variant/40">
      {orders.map((order) => (
        <Link
          key={order.id}
          to={linkTo(order.id)}
          className="flex items-center justify-between gap-3 px-3 py-2 text-body-sm transition-colors hover:bg-surface-container-low"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="shrink-0 font-bold text-on-surface">{order.display_id}</span>
            <span className="shrink-0 text-label-sm text-on-surface-variant">
              {new Date(order.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="font-bold text-on-surface">{formatNaira(order.total)}</span>
            <OrderStatusBadge status={order.status} />
          </div>
        </Link>
      ))}
    </div>
  )
}

export { CompactOrdersList }

import { Bell } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/useAuth'
import { useOrdersForUser } from '@/lib/queries/useOrders'
import { orderStatusLabels } from '@/features/dashboard/OrderStatusBadge'
import { Link } from 'react-router-dom'
import { paths } from '@/routes/paths'

/** Shows the signed-in customer's most recent order status as a lightweight activity feed. */
function NotificationBell() {
  const { profile } = useAuth()
  const { data: orders } = useOrdersForUser(profile?.id)
  const recent = orders?.slice(0, 3)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <p className="px-2 py-1.5 text-label-sm uppercase text-on-surface-variant">Order Updates</p>
        {!profile ? (
          <p className="px-2 py-2 text-body-md text-on-surface-variant">Log in to see updates on your orders.</p>
        ) : !recent || recent.length === 0 ? (
          <p className="px-2 py-2 text-body-md text-on-surface-variant">No orders yet.</p>
        ) : (
          recent.map((order) => (
            <DropdownMenuItem key={order.id} asChild>
              <Link to={paths.accountOrder(order.id)} className="flex flex-col items-start gap-0.5">
                <span className="text-label-md font-bold normal-case text-on-surface">{order.display_id}</span>
                <span className="text-label-sm text-on-surface-variant">{orderStatusLabels[order.status]}</span>
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { NotificationBell }

import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, MessageSquare, Menu, Plus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUnreadNotifications } from '@/lib/queries/useNotifications'
import { paths } from '@/routes/paths'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import type { AdminPermission, NotificationType } from '@/types/database'

const items: { to: string; label: string; icon: typeof LayoutDashboard; end: boolean; dotType?: NotificationType; permission?: AdminPermission }[] = [
  { to: paths.admin, label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: paths.adminOrders, label: 'Orders', icon: ClipboardList, end: false, dotType: 'new_order', permission: 'orders' },
  { to: paths.adminTickets, label: 'Tickets', icon: MessageSquare, end: false, dotType: 'new_ticket', permission: 'tickets' },
  { to: paths.adminSettings, label: 'Menu', icon: Menu, end: false },
]

/** Admin mobile bottom nav — Dashboard/Orders/Tickets/Menu plus a central FAB for walk-in orders. */
function AdminBottomNav() {
  const [walkInOpen, setWalkInOpen] = useState(false)
  const { profile, hasPermission } = useAuth()
  const { data: unread } = useUnreadNotifications(profile?.id)
  const visibleItems = items.filter((item) => !item.permission || hasPermission(item.permission))
  const [before, after] = [visibleItems.slice(0, 2), visibleItems.slice(2)]

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-outline-variant/40 bg-surface-container-lowest/90 backdrop-blur-md pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="Admin"
      >
        {before.map((item) => (
          <AdminNavItem key={item.to} {...item} showDot={Boolean(item.dotType && (unread ?? []).some((n) => n.type === item.dotType))} />
        ))}

        <button
          type="button"
          onClick={() => setWalkInOpen(true)}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-label-sm text-on-surface-variant"
        >
          <span className="-mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container shadow-soft-lift">
            <Plus className="h-6 w-6" />
          </span>
          <span className="mt-0.5">Walk-in</span>
        </button>

        {after.map((item) => (
          <AdminNavItem key={item.to} {...item} showDot={Boolean(item.dotType && (unread ?? []).some((n) => n.type === item.dotType))} />
        ))}
      </nav>

      <Dialog open={walkInOpen} onOpenChange={setWalkInOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Walk-in Order</DialogTitle>
            <DialogDescription>
              Build an order on behalf of a customer who dropped off in person.
            </DialogDescription>
          </DialogHeader>
          <p className="text-body-md text-on-surface-variant">
            Catalog and cart picker coming in a later build phase.
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}

function AdminNavItem({
  to,
  label,
  icon: Icon,
  end,
  showDot,
}: {
  to: string
  label: string
  icon: typeof LayoutDashboard
  end: boolean
  showDot?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-label-sm transition-colors',
          isActive ? 'text-primary' : 'text-on-surface-variant',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span className="relative flex">
            <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
            {showDot && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-error" />}
          </span>
          <span>{label}</span>
        </>
      )}
    </NavLink>
  )
}

export { AdminBottomNav }

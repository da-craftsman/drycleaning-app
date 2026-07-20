import { NavLink } from 'react-router-dom'
import { Home, Shirt, Package, User } from 'lucide-react'
import { paths } from '@/routes/paths'
import { cn } from '@/lib/utils'

const items = [
  { to: paths.home, label: 'Home', icon: Home, end: true },
  { to: paths.order, label: 'New Order', icon: Shirt, end: false },
  { to: paths.accountOrders, label: 'Track', icon: Package, end: false },
  { to: paths.account, label: 'Account', icon: User, end: true },
]

/** Persistent mobile bottom nav — frosted glass, "New Order" as the highlighted central action. */
function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-outline-variant/40 bg-surface-container-lowest/90 backdrop-blur-md pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Primary"
    >
      {items.map(({ to, label, icon: Icon, end }) => {
        const isCentral = to === paths.order
        return (
          <NavLink
            key={to}
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
                <span
                  className={cn(
                    'flex items-center justify-center rounded-full',
                    isCentral ? '-mt-6 h-12 w-12 bg-primary text-on-primary shadow-soft-lift' : 'h-6 w-6',
                  )}
                >
                  <Icon className={isCentral ? 'h-6 w-6' : 'h-6 w-6'} strokeWidth={isActive ? 2.5 : 2} />
                </span>
                <span className={isCentral ? 'mt-0.5' : undefined}>{label}</span>
              </>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}

export { BottomNav }

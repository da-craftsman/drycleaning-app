import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Shirt, Package, Menu as MenuIcon } from 'lucide-react'
import { paths } from '@/routes/paths'
import { cn } from '@/lib/utils'
import { MobileMenuSheet } from '@/components/navigation/MobileMenu'

const navItems = [
  { to: paths.home, label: 'Home', icon: Home, end: true },
  { to: paths.order, label: 'New Order', icon: Shirt, end: false },
  { to: paths.accountOrders, label: 'Track', icon: Package, end: false },
]

/** Persistent mobile bottom nav — frosted glass, "New Order" as the highlighted central action.
 * "Menu" opens the same hamburger sheet as the header's menu button, rather than navigating anywhere. */
function BottomNav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-outline-variant/40 bg-surface-container-lowest/90 backdrop-blur-md pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="Primary"
      >
        {navItems.map(({ to, label, icon: Icon, end }) => {
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

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-label-sm text-on-surface-variant transition-colors"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full">
            <MenuIcon className="h-6 w-6" strokeWidth={2} />
          </span>
          <span>Menu</span>
        </button>
      </nav>

      <MobileMenuSheet open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  )
}

export { BottomNav }

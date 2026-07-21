import { NavLink, Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogIn, LogOut, Package, ShoppingBasket, User, UserPlus } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { paths } from '@/routes/paths'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useCartStore } from '@/store/useCartStore'
import { MobileMenu } from '@/components/navigation/MobileMenu'
import { NotificationBell } from '@/components/navigation/NotificationBell'
import { services } from '@/lib/services'

const navLinks = [
  { to: paths.blog, label: 'Blog', end: false },
  { to: paths.about, label: 'About', end: false },
  { to: paths.support, label: 'Support', end: false },
]

/** Services nav item with a hover/focus dropdown listing every individual service, alongside its own link to the Services overview. */
function ServicesNavItem() {
  return (
    <div className="group relative">
      <NavLink
        to={paths.services}
        className={({ isActive }) =>
          cn(
            'border-b-2 border-transparent px-0.5 pb-1.5 pt-1 text-label-md text-on-surface-variant transition-colors hover:text-on-surface hover:border-outline-variant',
            isActive && 'border-primary text-primary hover:border-primary',
          )
        }
      >
        Services
      </NavLink>
      <div className="invisible absolute left-1/2 top-full z-40 w-56 -translate-x-1/2 pt-3 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div className="overflow-hidden rounded border border-outline-variant/40 bg-surface-container-lowest p-1 shadow-soft-lift">
          {services.map((s) => (
            <Link
              key={s.slug}
              to={paths.serviceDetail(s.slug)}
              className="block rounded-sm px-3 py-2 text-body-md text-on-surface transition-colors hover:bg-surface-container-low"
            >
              {s.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Top nav — a floating rounded pill bar fixed over page content on desktop; a slim hamburger+logo+bell bar on mobile (bottom nav covers primary nav there). */
function Header() {
  const itemCount = useCartStore((state) => state.itemCount())
  const { isAuthenticated, isAdmin, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate(paths.home)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-30 bg-transparent px-margin-mobile pt-2 md:px-gutter md:pt-3">
      <div className="mx-auto flex h-16 w-full min-w-0 max-w-shell items-center justify-between gap-4 rounded-full border border-outline-variant/40 bg-surface-container-lowest px-4 shadow-soft-lift md:px-3">
        <div className="flex items-center gap-1">
          <MobileMenu />
          <Link to={paths.home} className="shrink-0 pl-1">
            <Logo />
          </Link>
        </div>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          <NavLink
            to={paths.home}
            end
            className={({ isActive }) =>
              cn(
                'border-b-2 border-transparent px-0.5 pb-1.5 pt-1 text-label-md text-on-surface-variant transition-colors hover:text-on-surface hover:border-outline-variant',
                isActive && 'border-primary text-primary hover:border-primary',
              )
            }
          >
            Home
          </NavLink>
          <ServicesNavItem />
          {navLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'border-b-2 border-transparent px-0.5 pb-1.5 pt-1 text-label-md text-on-surface-variant transition-colors hover:text-on-surface hover:border-outline-variant',
                  isActive && 'border-primary text-primary hover:border-primary',
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <NotificationBell />
          <Link
            to={paths.order}
            className="relative hidden h-11 w-11 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface md:flex"
            aria-label="Cart"
          >
            <ShoppingBasket className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary-container px-1 text-[10px] font-bold leading-none text-on-secondary-container">
                {itemCount}
              </span>
            )}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="hidden h-11 w-11 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface md:flex"
                aria-label="Account"
              >
                <User className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isAuthenticated && profile ? (
                <>
                  <DropdownMenuLabel>{profile.full_name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin ? (
                    <DropdownMenuItem asChild>
                      <Link to={paths.admin}>
                        <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to={paths.account}>
                          <User className="h-4 w-4" /> My Account
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={paths.accountOrders}>
                          <Package className="h-4 w-4" /> My Orders
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleSignOut} className="text-error data-[highlighted]:bg-error-container/40">
                    <LogOut className="h-4 w-4" /> Log Out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link to={paths.login}>
                      <LogIn className="h-4 w-4" /> Log In
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={paths.signup}>
                      <UserPlus className="h-4 w-4" /> Sign Up
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button asChild size="sm" className="ml-1 hidden rounded-full md:inline-flex">
            <Link to={paths.order}>
              <Package className="h-4 w-4" /> Place Order
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

export { Header }

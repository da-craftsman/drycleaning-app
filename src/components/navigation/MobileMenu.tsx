import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Menu,
  Home,
  Shirt,
  Package,
  MessageSquare,
  User,
  Info,
  Newspaper,
  LifeBuoy,
  LogIn,
  UserPlus,
  LogOut,
  LayoutDashboard,
  ShoppingBasket,
} from 'lucide-react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/brand/Logo'
import { useAuth } from '@/hooks/useAuth'
import { useCartStore } from '@/store/useCartStore'
import { paths } from '@/routes/paths'
import { cn } from '@/lib/utils'

interface MenuLink {
  to: string
  label: string
  icon: typeof Home
  badge?: number
}

function MobileMenu() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, isAdmin, profile, signOut } = useAuth()
  const itemCount = useCartStore((s) => s.itemCount())
  const navigate = useNavigate()

  const browseLinks: MenuLink[] = [
    { to: paths.home, label: 'Home', icon: Home },
    { to: paths.order, label: 'New Order', icon: Shirt },
    { to: paths.order, label: 'Cart', icon: ShoppingBasket, badge: itemCount },
    { to: paths.trackLookup, label: 'Track an Order', icon: Package },
    { to: paths.services, label: 'Services & Pricing', icon: Info },
    { to: paths.blog, label: 'Blog', icon: Newspaper },
    { to: paths.about, label: 'About', icon: Info },
    { to: paths.support, label: 'Support', icon: LifeBuoy },
  ]

  const accountLinks: MenuLink[] = isAuthenticated
    ? [
        { to: paths.accountOrders, label: 'My Orders', icon: Package },
        { to: paths.accountTickets, label: 'Support Tickets', icon: MessageSquare },
        { to: paths.accountProfile, label: 'Profile', icon: User },
      ]
    : []

  const handleSignOut = async () => {
    setOpen(false)
    await signOut()
    navigate(paths.home)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="flex max-h-[90svh] flex-col overflow-y-auto">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <Logo className="mb-stack-md" />

          {isAuthenticated && profile && (
            <div className="mb-stack-sm rounded border border-outline-variant/40 bg-surface-container-low p-stack-sm">
              <p className="text-label-md font-bold normal-case text-on-surface">{profile.full_name}</p>
              <p className="text-label-sm text-on-surface-variant">{profile.email}</p>
            </div>
          )}

          <nav className="flex flex-col gap-1" aria-label="Menu">
            {browseLinks.map((link) => (
              <MenuItem key={link.label} link={link} onClick={() => setOpen(false)} />
            ))}
          </nav>

          {accountLinks.length > 0 && (
            <>
              <p className="mb-1 mt-stack-md text-label-sm uppercase text-on-surface-variant">Account</p>
              <nav className="flex flex-col gap-1" aria-label="Account">
                {accountLinks.map((link) => (
                  <MenuItem key={link.label} link={link} onClick={() => setOpen(false)} />
                ))}
              </nav>
            </>
          )}

          {isAdmin && (
            <>
              <p className="mb-1 mt-stack-md text-label-sm uppercase text-on-surface-variant">Admin</p>
              <nav className="flex flex-col gap-1" aria-label="Admin">
                <MenuItem
                  link={{ to: paths.admin, label: 'Admin Dashboard', icon: LayoutDashboard }}
                  onClick={() => setOpen(false)}
                />
              </nav>
            </>
          )}

          <div className="mt-stack-md border-t border-outline-variant/40 pt-stack-md">
            {isAuthenticated ? (
              <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" /> Log Out
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <Button asChild onClick={() => setOpen(false)}>
                  <Link to={paths.login}>
                    <LogIn className="h-4 w-4" /> Log In
                  </Link>
                </Button>
                <Button variant="outline" asChild onClick={() => setOpen(false)}>
                  <Link to={paths.signup}>
                    <UserPlus className="h-4 w-4" /> Sign Up
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

function MenuItem({ link, onClick }: { link: MenuLink; onClick: () => void }) {
  return (
    <Link
      to={link.to}
      onClick={onClick}
      className={cn(
        'flex items-center justify-between rounded px-3 py-2.5 text-label-md text-on-surface transition-colors hover:bg-surface-container-low',
      )}
    >
      <span className="flex items-center gap-3">
        <link.icon className="h-5 w-5 text-on-surface-variant" />
        {link.label}
      </span>
      {Boolean(link.badge) && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary-container px-1 text-label-sm font-bold text-on-secondary-container">
          {link.badge}
        </span>
      )}
    </Link>
  )
}

export { MobileMenu }

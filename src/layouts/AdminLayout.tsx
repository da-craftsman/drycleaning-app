import { Suspense } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, Users, Tags, MapPin, Image as ImageIcon, MessageSquare, Newspaper, Settings, LogOut } from 'lucide-react'
import { Logo, LogoMark } from '@/components/brand/Logo'
import { AdminBottomNav } from '@/components/navigation/AdminBottomNav'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/toaster'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useUnreadNotifications } from '@/lib/queries/useNotifications'
import { paths } from '@/routes/paths'
import { cn } from '@/lib/utils'
import type { NotificationType } from '@/types/database'

const sidebarLinks: { to: string; label: string; icon: typeof LayoutDashboard; end: boolean; dotType?: NotificationType }[] = [
  { to: paths.admin, label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: paths.adminOrders, label: 'Orders', icon: ClipboardList, end: false, dotType: 'new_order' },
  { to: paths.adminCustomers, label: 'Customers', icon: Users, end: false },
  { to: paths.adminCatalog, label: 'Catalog & Pricing', icon: Tags, end: false },
  { to: paths.adminZones, label: 'Zones', icon: MapPin, end: false },
  { to: paths.adminBanner, label: 'Banner', icon: ImageIcon, end: false },
  { to: paths.adminTickets, label: 'Tickets', icon: MessageSquare, end: false, dotType: 'new_ticket' },
  { to: paths.adminBlog, label: 'Blog', icon: Newspaper, end: false },
  { to: paths.adminSettings, label: 'Settings', icon: Settings, end: false },
]

/** Admin shell: desktop sidebar, mobile bottom nav with a walk-in-order FAB. */
function AdminLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const { data: unread } = useUnreadNotifications(profile?.id)

  const handleSignOut = async () => {
    await signOut()
    navigate(paths.home)
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-svh w-full min-w-0">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-outline-variant/40 bg-surface-container-lowest md:sticky md:top-0 md:flex md:h-svh">
          <Link to={paths.admin} className="flex h-16 shrink-0 items-center border-b border-outline-variant/40 px-stack-md">
            <Logo />
          </Link>
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-stack-md" aria-label="Admin">
            {sidebarLinks.map(({ to, label, icon: Icon, end, dotType }) => {
              const showDot = dotType ? (unread ?? []).some((n) => n.type === dotType) : false
              return (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded px-3 py-2.5 text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface',
                      isActive && 'bg-primary/10 text-primary',
                    )
                  }
                >
                  <span className="relative flex">
                    <Icon className="h-5 w-5" />
                    {showDot && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-error" />}
                  </span>
                  {label}
                </NavLink>
              )
            })}
          </nav>
          <div className="border-t border-outline-variant/40 p-stack-md">
            {profile && <p className="mb-2 truncate text-label-sm text-on-surface-variant">{profile.full_name}</p>}
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" /> Log Out
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-outline-variant/40 bg-surface-container-lowest px-margin-mobile md:hidden">
            <Link to={paths.admin}>
              <LogoMark />
            </Link>
            <span className="text-label-md font-bold uppercase text-on-surface-variant">Admin</span>
          </header>

          <main className="w-full min-w-0 flex-1 pb-20 md:pb-0">
            <Suspense fallback={<Skeleton className="m-margin-mobile h-40" />}>
              <Outlet />
            </Suspense>
          </main>
        </div>

        <AdminBottomNav />
        <Toaster />
      </div>
    </TooltipProvider>
  )
}

export { AdminLayout }

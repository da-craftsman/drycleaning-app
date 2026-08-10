import { Link, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/brand/Logo'
import { useAuth } from '@/hooks/useAuth'
import { useUnreadNotifications } from '@/lib/queries/useNotifications'
import { adminSidebarLinks } from '@/lib/adminNav'
import { cn } from '@/lib/utils'

/** The admin console's mobile menu sheet — opened from the bottom nav's Menu tab, listing every
 * section the signed-in admin has access to (same permission filtering as the desktop sidebar). */
function AdminMobileMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { profile, hasPermission, isSuperAdmin, signOut } = useAuth()
  const { data: unread } = useUnreadNotifications(profile?.id)
  const navigate = useNavigate()

  const visibleLinks = adminSidebarLinks.filter(
    (link) => (!link.permission || hasPermission(link.permission)) && (!link.superAdminOnly || isSuperAdmin),
  )

  const handleNavigate = () => onOpenChange(false)

  const handleSignOut = async () => {
    onOpenChange(false)
    await signOut()
    navigate('/')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex max-h-[90svh] flex-col overflow-y-auto">
        <SheetTitle className="sr-only">Admin Menu</SheetTitle>
        <Logo className="mb-stack-md self-start" />

        {profile && (
          <div className="mb-stack-sm rounded border border-outline-variant/40 bg-surface-container-low p-stack-sm">
            <p className="text-label-md font-bold normal-case text-on-surface">{profile.full_name}</p>
            <p className="text-label-sm text-on-surface-variant">{profile.email}</p>
          </div>
        )}

        <nav className="flex flex-col gap-1" aria-label="Admin">
          {visibleLinks.map(({ to, label, icon: Icon, dotType }) => {
            const showDot = dotType ? (unread ?? []).some((n) => n.type === dotType) : false
            return (
              <Link
                key={to}
                to={to}
                onClick={handleNavigate}
                className={cn(
                  'flex items-center gap-3 rounded px-3 py-2.5 text-label-md text-on-surface transition-colors hover:bg-surface-container-low',
                )}
              >
                <span className="relative flex">
                  <Icon className="h-5 w-5 text-on-surface-variant" />
                  {showDot && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-error" />}
                </span>
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-stack-md border-t border-outline-variant/40 pt-stack-md">
          <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" /> Log Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export { AdminMobileMenu }

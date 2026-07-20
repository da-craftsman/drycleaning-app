import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/useAuth'
import { useMarkAllNotificationsRead, useNotifications, useUnreadNotifications } from '@/lib/queries/useNotifications'

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
}

/** Order status changes and ticket replies from admin, most recent first — unread ones clear as soon as the dropdown is opened. */
function NotificationBell() {
  const { profile } = useAuth()
  const { data: notifications } = useNotifications(profile?.id)
  const { data: unread } = useUnreadNotifications(profile?.id)
  const markAllRead = useMarkAllNotificationsRead(profile?.id)
  const hasUnread = Boolean(unread && unread.length > 0)

  const handleOpenChange = (open: boolean) => {
    if (open && hasUnread) markAllRead.mutate()
  }

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {hasUnread && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error" />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <p className="px-2 py-1.5 text-label-sm uppercase text-on-surface-variant">Notifications</p>
        {!profile ? (
          <p className="px-2 py-2 text-body-md text-on-surface-variant">Log in to see updates on your orders.</p>
        ) : !notifications || notifications.length === 0 ? (
          <p className="px-2 py-2 text-body-md text-on-surface-variant">No notifications yet.</p>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem key={n.id} asChild>
              <Link to={n.link_path} className="flex flex-col items-start gap-0.5 whitespace-normal">
                <span className="text-label-md font-bold normal-case text-on-surface">{n.title}</span>
                <span className="line-clamp-2 text-label-sm normal-case text-on-surface-variant">{n.body}</span>
                <span className="text-label-sm text-on-surface-variant/70">{formatWhen(n.created_at)}</span>
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { NotificationBell }

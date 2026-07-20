import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { TicketThread } from '@/features/tickets/TicketThread'
import { useAuth } from '@/hooks/useAuth'
import { useMarkNotificationsReadForTicket } from '@/lib/queries/useNotifications'
import { paths } from '@/routes/paths'

export default function AdminTicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const markNotificationsRead = useMarkNotificationsReadForTicket(profile?.id)

  useEffect(() => {
    if (id && profile?.id) markNotificationsRead.mutate(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, profile?.id])

  if (!id || !profile) return null

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-stack-md px-margin-mobile py-stack-lg md:px-gutter">
      <Link to={paths.adminTickets} className="flex items-center gap-1 text-label-md text-on-surface-variant hover:text-on-surface">
        <ChevronLeft className="h-4 w-4" /> Tickets
      </Link>
      <TicketThread ticketId={id} viewerRole="admin" viewerName={profile.full_name} />
    </div>
  )
}

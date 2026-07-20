import { useParams, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { TicketThread } from '@/features/tickets/TicketThread'
import { useAuth } from '@/hooks/useAuth'
import { paths } from '@/routes/paths'

export default function AccountTicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()

  if (!id || !profile) return null

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-stack-md px-margin-mobile py-stack-lg md:px-gutter">
      <Link to={paths.accountTickets} className="flex items-center gap-1 text-label-md text-on-surface-variant hover:text-on-surface">
        <ChevronLeft className="h-4 w-4" /> Support Tickets
      </Link>
      <TicketThread ticketId={id} viewerRole="customer" viewerName={profile.full_name} />
    </div>
  )
}

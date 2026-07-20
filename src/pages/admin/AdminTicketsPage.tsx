import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAllTickets } from '@/lib/queries/useTickets'
import { paths } from '@/routes/paths'
import type { TicketPriority, TicketStatus } from '@/types/database'

const statusVariant: Record<TicketStatus, 'primary' | 'success' | 'neutral'> = {
  open: 'primary',
  in_progress: 'neutral',
  resolved: 'success',
}

const priorityVariant: Record<TicketPriority, 'neutral' | 'urgent' | 'error'> = {
  low: 'neutral',
  normal: 'neutral',
  high: 'urgent',
  urgent: 'error',
}

export default function AdminTicketsPage() {
  const { data: tickets, isLoading } = useAllTickets()

  return (
    <div className="mx-auto w-full min-w-0 max-w-shell px-margin-mobile py-stack-lg md:px-gutter">
      <h1 className="mb-stack-md text-headline-lg-mobile font-display text-laundry-blue-deep md:text-headline-lg">Tickets</h1>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : !tickets || tickets.length === 0 ? (
        <p className="py-stack-lg text-center text-body-md text-on-surface-variant">No tickets.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {tickets.map((ticket) => (
            <Link key={ticket.id} to={paths.adminTicket(ticket.id)}>
              <Card className="transition-shadow hover:shadow-soft-lift">
                <CardContent className="flex items-center justify-between gap-3 pt-stack-md">
                  <div>
                    <p className="text-label-md font-bold normal-case text-on-surface">{ticket.subject}</p>
                    <p className="text-label-sm capitalize text-on-surface-variant">
                      {ticket.category.replace('_', ' ')} ·{' '}
                      {new Date(ticket.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={priorityVariant[ticket.priority]}>{ticket.priority}</Badge>
                    <Badge variant={statusVariant[ticket.status]}>{ticket.status.replace('_', ' ')}</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

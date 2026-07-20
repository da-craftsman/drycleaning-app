import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquarePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { NewTicketForm } from '@/features/tickets/NewTicketForm'
import { useAuth } from '@/hooks/useAuth'
import { useTicketsForUser } from '@/lib/queries/useTickets'
import { paths } from '@/routes/paths'
import type { TicketStatus } from '@/types/database'

const statusVariant: Record<TicketStatus, 'primary' | 'success' | 'neutral'> = {
  open: 'primary',
  in_progress: 'neutral',
  resolved: 'success',
}

export default function AccountTicketsPage() {
  const { profile } = useAuth()
  const { data: tickets, isLoading } = useTicketsForUser(profile?.id)
  const [open, setOpen] = useState(false)

  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl px-margin-mobile py-stack-lg md:px-gutter">
      <div className="mb-stack-md flex items-center justify-between">
        <h1 className="text-headline-lg-mobile font-display text-laundry-blue-deep md:text-headline-lg">Support Tickets</h1>
        <Button size="sm" onClick={() => setOpen(true)}>
          <MessageSquarePlus className="h-4 w-4" /> New Ticket
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : !tickets || tickets.length === 0 ? (
        <p className="py-stack-lg text-center text-body-md text-on-surface-variant">
          No tickets yet. If something's wrong with an order, let us know.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {tickets.map((ticket) => (
            <Link key={ticket.id} to={paths.accountTicket(ticket.id)}>
              <Card className="transition-shadow hover:shadow-soft-lift">
                <CardContent className="flex items-center justify-between gap-3 pt-stack-md">
                  <div>
                    <p className="text-label-md font-bold normal-case text-on-surface">{ticket.subject}</p>
                    <p className="text-label-sm text-on-surface-variant">
                      {new Date(ticket.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <Badge variant={statusVariant[ticket.status]}>{ticket.status.replace('_', ' ')}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Support Ticket</DialogTitle>
            <DialogDescription>Tell us what happened and we'll get back to you.</DialogDescription>
          </DialogHeader>
          {profile && <NewTicketForm userId={profile.id} authorName={profile.full_name} onCreated={() => setOpen(false)} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

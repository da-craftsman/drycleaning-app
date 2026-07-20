import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useTicket, useTicketMessages, useAddTicketMessage, useUpdateTicketStatus } from '@/lib/queries/useTickets'
import type { TicketStatus, UserRole } from '@/types/database'

const statusVariant: Record<TicketStatus, 'primary' | 'success' | 'neutral'> = {
  open: 'primary',
  in_progress: 'neutral',
  resolved: 'success',
}

function TicketThread({
  ticketId,
  viewerRole,
  viewerName,
}: {
  ticketId: string
  viewerRole: UserRole
  viewerName: string
}) {
  const { data: ticket, isLoading } = useTicket(ticketId)
  const { data: messages } = useTicketMessages(ticketId)
  const addMessage = useAddTicketMessage()
  const updateStatus = useUpdateTicketStatus()
  const [reply, setReply] = useState('')

  if (isLoading || !ticket) {
    return <Skeleton className="h-64 w-full" />
  }

  const handleReply = async () => {
    if (!reply.trim()) return
    await addMessage.mutateAsync({ ticketId, authorRole: viewerRole, authorName: viewerName, message: reply.trim() })
    setReply('')
  }

  return (
    <div className="flex flex-col gap-stack-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-headline-md font-display text-on-surface">{ticket.subject}</p>
          <p className="text-label-sm capitalize text-on-surface-variant">
            {ticket.category.replace('_', ' ')} · {ticket.priority} priority
          </p>
        </div>
        <Badge variant={statusVariant[ticket.status]}>{ticket.status.replace('_', ' ')}</Badge>
      </div>

      {ticket.photo_url && (
        <img src={ticket.photo_url} alt="Ticket attachment" className="h-32 w-32 rounded border border-outline-variant/40 object-cover" />
      )}

      <div className="flex flex-col gap-2">
        {messages?.map((m) => (
          <div
            key={m.id}
            className={cn(
              'max-w-[85%] rounded-lg px-3 py-2',
              m.author_role === viewerRole ? 'self-end bg-primary/10' : 'self-start bg-surface-container-low',
            )}
          >
            <p className="text-label-sm font-bold text-on-surface-variant">{m.author_name}</p>
            <p className="text-body-md text-on-surface">{m.message}</p>
            <p className="mt-0.5 text-label-sm text-on-surface-variant">
              {new Date(m.created_at).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
            </p>
          </div>
        ))}
      </div>

      {ticket.status !== 'resolved' && (
        <Card>
          <CardContent className="flex flex-col gap-2 pt-stack-md">
            <Textarea
              placeholder={viewerRole === 'admin' ? 'Reply to customer…' : 'Add a message…'}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
            />
            <div className="flex justify-between gap-2">
              {viewerRole === 'admin' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateStatus.mutate({ ticketId, status: 'resolved' })}
                  disabled={updateStatus.isPending}
                >
                  Mark Resolved
                </Button>
              )}
              <Button size="sm" onClick={handleReply} disabled={addMessage.isPending || !reply.trim()} className="ml-auto">
                {addMessage.isPending ? 'Sending…' : 'Send'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export { TicketThread }

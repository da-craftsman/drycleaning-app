import { db, delay, persist } from '@/lib/data/mock/store'
import { notifyAdminsNewTicketMock, notifyCustomerTicketReplyMock } from '@/lib/data/mock/notifications.mock'
import type { ComplaintTicket, TicketMessage, TicketStatus } from '@/types/database'
import type { NewTicketInput } from '@/types/domain'

export function getTicketsForUserMock(userId: string): Promise<ComplaintTicket[]> {
  return delay(
    db.complaintTickets.filter((t) => t.user_id === userId).sort((a, b) => b.created_at.localeCompare(a.created_at)),
  )
}

export function getAllTicketsMock(): Promise<ComplaintTicket[]> {
  return delay([...db.complaintTickets].sort((a, b) => b.created_at.localeCompare(a.created_at)))
}

export function getTicketMock(ticketId: string): Promise<ComplaintTicket | null> {
  return delay(db.complaintTickets.find((t) => t.id === ticketId) ?? null)
}

export function getTicketMessagesMock(ticketId: string): Promise<TicketMessage[]> {
  return delay(
    db.ticketMessages.filter((m) => m.ticket_id === ticketId).sort((a, b) => a.created_at.localeCompare(b.created_at)),
  )
}

export function createTicketMock(
  userId: string,
  authorName: string,
  input: NewTicketInput,
): Promise<ComplaintTicket> {
  const now = new Date().toISOString()
  const ticket: ComplaintTicket = {
    id: `ticket-${crypto.randomUUID()}`,
    user_id: userId,
    order_id: input.orderId,
    subject: input.subject,
    description: input.description,
    category: input.category,
    priority: input.priority,
    status: 'open',
    photo_url: input.photoDataUrl,
    created_at: now,
  }
  db.complaintTickets.push(ticket)
  db.ticketMessages.push({
    id: `tm-${crypto.randomUUID()}`,
    ticket_id: ticket.id,
    author_role: 'customer',
    author_name: authorName,
    message: input.description,
    created_at: now,
  })
  persist()
  // Mirrors the real schema's trg_notify_admins_new_ticket trigger (see supabase/schema.sql).
  notifyAdminsNewTicketMock(ticket)
  return delay(ticket, 500)
}

export function addTicketMessageMock(
  ticketId: string,
  authorRole: TicketMessage['author_role'],
  authorName: string,
  message: string,
): Promise<TicketMessage> {
  const ticket = db.complaintTickets.find((t) => t.id === ticketId)
  if (!ticket) throw new Error(`Ticket ${ticketId} not found`)
  const entry: TicketMessage = {
    id: `tm-${crypto.randomUUID()}`,
    ticket_id: ticketId,
    author_role: authorRole,
    author_name: authorName,
    message,
    created_at: new Date().toISOString(),
  }
  db.ticketMessages.push(entry)
  if (authorRole === 'admin' && ticket.status === 'open') ticket.status = 'in_progress'
  persist()
  // Mirrors the real schema's trg_notify_customer_ticket_reply trigger (see supabase/schema.sql).
  if (authorRole === 'admin') notifyCustomerTicketReplyMock(ticket, message)
  return delay(entry)
}

export function updateTicketStatusMock(ticketId: string, status: TicketStatus): Promise<ComplaintTicket> {
  const ticket = db.complaintTickets.find((t) => t.id === ticketId)
  if (!ticket) throw new Error(`Ticket ${ticketId} not found`)
  ticket.status = status
  persist()
  return delay(ticket)
}

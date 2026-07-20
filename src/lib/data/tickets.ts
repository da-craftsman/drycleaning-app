import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import {
  addTicketMessageMock,
  createTicketMock,
  getAllTicketsMock,
  getTicketMessagesMock,
  getTicketMock,
  getTicketsForUserMock,
  updateTicketStatusMock,
} from '@/lib/data/mock/tickets.mock'
import type { ComplaintTicket, TicketMessage, TicketStatus, UserRole } from '@/types/database'
import type { NewTicketInput } from '@/types/domain'

export async function getTicketsForUser(userId: string): Promise<ComplaintTicket[]> {
  if (!isSupabaseConfigured) return getTicketsForUserMock(userId)
  const { data, error } = await supabase!
    .from('complaint_tickets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getAllTickets(): Promise<ComplaintTicket[]> {
  if (!isSupabaseConfigured) return getAllTicketsMock()
  const { data, error } = await supabase!.from('complaint_tickets').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getTicket(ticketId: string): Promise<ComplaintTicket | null> {
  if (!isSupabaseConfigured) return getTicketMock(ticketId)
  const { data, error } = await supabase!.from('complaint_tickets').select('*').eq('id', ticketId).maybeSingle()
  if (error) throw error
  return data
}

export async function getTicketMessages(ticketId: string): Promise<TicketMessage[]> {
  if (!isSupabaseConfigured) return getTicketMessagesMock(ticketId)
  const { data, error } = await supabase!
    .from('ticket_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at')
  if (error) throw error
  return data
}

export async function createTicket(userId: string, authorName: string, input: NewTicketInput): Promise<ComplaintTicket> {
  if (!isSupabaseConfigured) return createTicketMock(userId, authorName, input)
  const { data, error } = await supabase!
    .from('complaint_tickets')
    .insert({
      user_id: userId,
      order_id: input.orderId,
      subject: input.subject,
      description: input.description,
      category: input.category,
      priority: input.priority,
      photo_url: input.photoDataUrl,
    })
    .select()
    .single()
  if (error) throw error
  await supabase!.from('ticket_messages').insert({
    ticket_id: data.id,
    author_role: 'customer',
    author_name: authorName,
    message: input.description,
  })
  return data
}

export async function addTicketMessage(
  ticketId: string,
  authorRole: UserRole,
  authorName: string,
  message: string,
): Promise<TicketMessage> {
  if (!isSupabaseConfigured) return addTicketMessageMock(ticketId, authorRole, authorName, message)
  const { data, error } = await supabase!
    .from('ticket_messages')
    .insert({ ticket_id: ticketId, author_role: authorRole, author_name: authorName, message })
    .select()
    .single()
  if (error) throw error
  if (authorRole === 'admin') {
    await supabase!.from('complaint_tickets').update({ status: 'in_progress' }).eq('id', ticketId).eq('status', 'open')
  }
  return data
}

export async function updateTicketStatus(ticketId: string, status: TicketStatus): Promise<ComplaintTicket> {
  if (!isSupabaseConfigured) return updateTicketStatusMock(ticketId, status)
  const { data, error } = await supabase!.from('complaint_tickets').update({ status }).eq('id', ticketId).select().single()
  if (error) throw error
  return data
}

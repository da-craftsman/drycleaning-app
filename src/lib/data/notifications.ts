import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import {
  getNotificationsMock,
  getUnreadNotificationsMock,
  markAllNotificationsReadMock,
  markNotificationReadMock,
  markNotificationsReadForOrderMock,
  markNotificationsReadForTicketMock,
} from '@/lib/data/mock/notifications.mock'
import type { Notification } from '@/types/database'

export async function getNotifications(userId: string, limit = 20): Promise<Notification[]> {
  if (!isSupabaseConfigured) return getNotificationsMock(userId, limit)
  const { data, error } = await supabase!
    .from('notifications')
    .select('*')
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

/** All-unread rows (no limit) — used to compute the admin sidebar red dots and the bell badge, not for display. */
export async function getUnreadNotifications(userId: string): Promise<Notification[]> {
  if (!isSupabaseConfigured) return getUnreadNotificationsMock(userId)
  const { data, error } = await supabase!.from('notifications').select('*').eq('recipient_id', userId).is('read_at', null)
  if (error) throw error
  return data
}

export async function markNotificationRead(userId: string, notificationId: string): Promise<void> {
  if (!isSupabaseConfigured) return markNotificationReadMock(userId, notificationId)
  const { error } = await supabase!
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('recipient_id', userId)
  if (error) throw error
}

/** Marks every unread notification tied to one order read at once — used when that order's detail page is opened. */
export async function markNotificationsReadForOrder(userId: string, orderId: string): Promise<void> {
  if (!isSupabaseConfigured) return markNotificationsReadForOrderMock(userId, orderId)
  const { error } = await supabase!
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('recipient_id', userId)
    .eq('related_order_id', orderId)
    .is('read_at', null)
  if (error) throw error
}

/** Marks every unread notification tied to one ticket read at once — used when that ticket's detail page is opened. */
export async function markNotificationsReadForTicket(userId: string, ticketId: string): Promise<void> {
  if (!isSupabaseConfigured) return markNotificationsReadForTicketMock(userId, ticketId)
  const { error } = await supabase!
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('recipient_id', userId)
    .eq('related_ticket_id', ticketId)
    .is('read_at', null)
  if (error) throw error
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  if (!isSupabaseConfigured) return markAllNotificationsReadMock(userId)
  const { error } = await supabase!
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('recipient_id', userId)
    .is('read_at', null)
  if (error) throw error
}

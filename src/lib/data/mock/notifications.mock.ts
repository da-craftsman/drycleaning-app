import { db, delay, persist } from '@/lib/data/mock/store'
import type { ComplaintTicket, Notification, Order } from '@/types/database'

// Mock mode has no database triggers, so these four helpers are called directly from
// orders.mock.ts / tickets.mock.ts wherever the real schema's trigger functions would fire
// (see the "Notification triggers" section of supabase/schema.sql) — one per trigger.

export function notifyAdminsNewOrderMock(order: Order) {
  const now = new Date().toISOString()
  db.profiles
    .filter((p) => p.role === 'admin' || p.role === 'superadmin')
    .forEach((admin) => {
      db.notifications.push({
        id: `notif-${db.notifications.length}`,
        recipient_id: admin.id,
        type: 'new_order',
        title: `New order ${order.display_id}`,
        body: 'A new order has been placed.',
        link_path: `/admin/orders/${order.id}`,
        related_order_id: order.id,
        related_ticket_id: null,
        read_at: null,
        created_at: now,
      })
    })
  persist()
}

export function notifyCustomerOrderStatusMock(order: Order) {
  db.notifications.push({
    id: `notif-${db.notifications.length}`,
    recipient_id: order.user_id,
    type: 'order_status_changed',
    title: `Order ${order.display_id} updated`,
    body: `Your order status is now: ${order.status.replace(/_/g, ' ')}`,
    link_path: `/account/orders/${order.id}`,
    related_order_id: order.id,
    related_ticket_id: null,
    read_at: null,
    created_at: new Date().toISOString(),
  })
  persist()
}

export function notifyAdminsNewTicketMock(ticket: ComplaintTicket) {
  const now = new Date().toISOString()
  db.profiles
    .filter((p) => p.role === 'admin' || p.role === 'superadmin')
    .forEach((admin) => {
      db.notifications.push({
        id: `notif-${db.notifications.length}`,
        recipient_id: admin.id,
        type: 'new_ticket',
        title: `New ticket: ${ticket.subject}`,
        body: 'A customer submitted a new support ticket.',
        link_path: `/admin/tickets/${ticket.id}`,
        related_order_id: null,
        related_ticket_id: ticket.id,
        read_at: null,
        created_at: now,
      })
    })
  persist()
}

export function notifyCustomerTicketReplyMock(ticket: ComplaintTicket, message: string) {
  db.notifications.push({
    id: `notif-${db.notifications.length}`,
    recipient_id: ticket.user_id,
    type: 'ticket_reply',
    title: 'New reply on your ticket',
    body: message,
    link_path: `/account/tickets/${ticket.id}`,
    related_order_id: null,
    related_ticket_id: ticket.id,
    read_at: null,
    created_at: new Date().toISOString(),
  })
  persist()
}

export function getNotificationsMock(userId: string, limit: number): Promise<Notification[]> {
  return delay(
    db.notifications
      .filter((n) => n.recipient_id === userId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit),
  )
}

export function getUnreadNotificationsMock(userId: string): Promise<Notification[]> {
  return delay(db.notifications.filter((n) => n.recipient_id === userId && !n.read_at))
}

export function markNotificationReadMock(userId: string, notificationId: string): Promise<void> {
  const notification = db.notifications.find((n) => n.id === notificationId && n.recipient_id === userId)
  if (notification) notification.read_at = new Date().toISOString()
  persist()
  return delay(undefined)
}

export function markNotificationsReadForOrderMock(userId: string, orderId: string): Promise<void> {
  const now = new Date().toISOString()
  db.notifications
    .filter((n) => n.recipient_id === userId && n.related_order_id === orderId && !n.read_at)
    .forEach((n) => {
      n.read_at = now
    })
  persist()
  return delay(undefined)
}

export function markNotificationsReadForTicketMock(userId: string, ticketId: string): Promise<void> {
  const now = new Date().toISOString()
  db.notifications
    .filter((n) => n.recipient_id === userId && n.related_ticket_id === ticketId && !n.read_at)
    .forEach((n) => {
      n.read_at = now
    })
  persist()
  return delay(undefined)
}

export function markAllNotificationsReadMock(userId: string): Promise<void> {
  const now = new Date().toISOString()
  db.notifications
    .filter((n) => n.recipient_id === userId && !n.read_at)
    .forEach((n) => {
      n.read_at = now
    })
  persist()
  return delay(undefined)
}

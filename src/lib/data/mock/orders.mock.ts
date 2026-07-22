import { db, delay, persist } from '@/lib/data/mock/store'
import { notifyAdminsNewOrderMock, notifyCustomerOrderStatusMock } from '@/lib/data/mock/notifications.mock'
import { generateOrderDisplayId } from '@/lib/utils'
import { isMixedExpress } from '@/lib/orderTiers'
import type { Order, OrderItem, OrderStatus, OrderStatusHistoryEntry } from '@/types/database'
import type { AdminOrderSummary, CreateOrderInput } from '@/types/domain'

export function getOrdersForUserMock(userId: string): Promise<Order[]> {
  return delay(
    db.orders.filter((o) => o.user_id === userId).sort((a, b) => b.created_at.localeCompare(a.created_at)),
  )
}

export function getAllOrdersMock(): Promise<AdminOrderSummary[]> {
  return delay(
    [...db.orders]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((order) => ({
        ...order,
        hasMixedExpress: isMixedExpress(db.orderItems.filter((oi) => oi.order_id === order.id).map((oi) => oi.service_tier)),
      })),
  )
}

export function getOrderMock(orderId: string): Promise<Order | null> {
  return delay(db.orders.find((o) => o.id === orderId) ?? null)
}

export function getOrderByDisplayIdMock(displayId: string): Promise<Order | null> {
  return delay(db.orders.find((o) => o.display_id.toLowerCase() === displayId.toLowerCase()) ?? null)
}

export function getOrderItemsMock(orderId: string): Promise<OrderItem[]> {
  return delay(db.orderItems.filter((oi) => oi.order_id === orderId))
}

export function getOrderImagesMock(orderId: string): Promise<string[]> {
  return delay(db.orderImages.filter((img) => img.order_id === orderId).map((img) => img.image_url))
}

export function getOrderStatusHistoryMock(orderId: string): Promise<OrderStatusHistoryEntry[]> {
  return delay(
    db.orderStatusHistory.filter((h) => h.order_id === orderId).sort((a, b) => a.created_at.localeCompare(b.created_at)),
  )
}

export async function createOrderMock(input: CreateOrderInput): Promise<Order> {
  const subtotal = input.items.reduce((sum, li) => sum + li.unitPrice * li.quantity, 0)
  const total = subtotal + input.deliveryFee
  const now = new Date().toISOString()

  const order: Order = {
    id: `order-${crypto.randomUUID()}`,
    display_id: generateOrderDisplayId(),
    user_id: input.userId,
    status: 'order_received',
    logistics_type: input.logisticsType,
    zone_id: input.zoneId,
    address: input.details.address,
    phone: input.details.phone,
    whatsapp: input.details.whatsapp || null,
    special_instructions: input.details.specialInstructions || null,
    rider_name: null,
    subtotal,
    delivery_fee: input.deliveryFee,
    total,
    payment_method: input.paymentMethod,
    payment_status: 'pending',
    paystack_reference: null,
    confirmation_email_sent_at: null,
    ready_email_sent_at: null,
    created_at: now,
    updated_at: now,
  }

  const orderItems: OrderItem[] = input.items.map((line, i) => ({
    id: `${order.id}-item-${i}`,
    order_id: order.id,
    item_id: line.itemId,
    item_name: line.name,
    service_tier: line.tier,
    quantity: line.quantity,
    unit_price: line.unitPrice,
    line_total: line.unitPrice * line.quantity,
  }))

  const orderImages = input.imageDataUrls.map((url, i) => ({
    id: `${order.id}-img-${i}`,
    order_id: order.id,
    image_url: url,
  }))

  db.orders.push(order)
  db.orderItems.push(...orderItems)
  db.orderImages.push(...orderImages)
  db.orderStatusHistory.push({ id: `${order.id}-hist-0`, order_id: order.id, status: order.status, created_at: now })
  persist()
  // Mirrors the real schema's trg_notify_admins_new_order trigger (see supabase/schema.sql) —
  // mock mode has no database triggers, so this has to be done explicitly here.
  notifyAdminsNewOrderMock(order)

  return delay(order, 600)
}

/** No real backend to verify against in mock mode — just marks the order paid, like the real Edge Function would after a genuine successful transaction. */
export function verifyPaystackPaymentMock(orderId: string, reference: string): Promise<{ verified: boolean }> {
  const order = db.orders.find((o) => o.id === orderId)
  if (!order) return delay({ verified: false })
  order.payment_status = 'paid'
  order.paystack_reference = reference
  order.updated_at = new Date().toISOString()
  persist()
  return delay({ verified: true }, 500)
}

export function markOrderPaidMock(orderId: string): Promise<Order> {
  const order = db.orders.find((o) => o.id === orderId)
  if (!order) throw new Error(`Order ${orderId} not found`)
  order.payment_status = 'paid'
  order.updated_at = new Date().toISOString()
  persist()
  return delay(order)
}

export function updateOrderStatusMock(orderId: string, status: OrderStatus, riderName?: string): Promise<Order> {
  const order = db.orders.find((o) => o.id === orderId)
  if (!order) throw new Error(`Order ${orderId} not found`)
  const now = new Date().toISOString()
  // Only log a history entry when the status genuinely changes, since this is also called for
  // rider-only saves (same status re-submitted) which shouldn't spam the Activity tab.
  const statusChanged = order.status !== status
  if (statusChanged) {
    db.orderStatusHistory.push({ id: `${orderId}-hist-${db.orderStatusHistory.length}`, order_id: orderId, status, created_at: now })
  }
  order.status = status
  if (riderName !== undefined) order.rider_name = riderName
  order.updated_at = now
  persist()
  // Mirrors the real schema's trg_notify_customer_order_status trigger (see supabase/schema.sql).
  if (statusChanged) notifyCustomerOrderStatusMock(order)
  return delay(order)
}

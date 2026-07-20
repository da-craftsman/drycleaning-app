import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { generateOrderDisplayId } from '@/lib/utils'
import {
  createOrderMock,
  getAllOrdersMock,
  getOrderByDisplayIdMock,
  getOrderImagesMock,
  getOrderItemsMock,
  getOrderMock,
  getOrderStatusHistoryMock,
  getOrdersForUserMock,
  updateOrderStatusMock,
  verifyPaystackPaymentMock,
} from '@/lib/data/mock/orders.mock'
import type { Order, OrderItem, OrderStatus, OrderStatusHistoryEntry } from '@/types/database'
import type { CreateOrderInput } from '@/types/domain'

export async function getOrdersForUser(userId: string): Promise<Order[]> {
  if (!isSupabaseConfigured) return getOrdersForUserMock(userId)
  const { data, error } = await supabase!
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getAllOrders(): Promise<Order[]> {
  if (!isSupabaseConfigured) return getAllOrdersMock()
  const { data, error } = await supabase!.from('orders').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getOrder(orderId: string): Promise<Order | null> {
  if (!isSupabaseConfigured) return getOrderMock(orderId)
  const { data, error } = await supabase!.from('orders').select('*').eq('id', orderId).maybeSingle()
  if (error) throw error
  return data
}

export async function getOrderByDisplayId(displayId: string): Promise<Order | null> {
  if (!isSupabaseConfigured) return getOrderByDisplayIdMock(displayId)
  const { data, error } = await supabase!.from('orders').select('*').ilike('display_id', displayId).maybeSingle()
  if (error) throw error
  return data
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  if (!isSupabaseConfigured) return getOrderItemsMock(orderId)
  const { data, error } = await supabase!.from('order_items').select('*').eq('order_id', orderId)
  if (error) throw error
  return data
}

export async function getOrderImages(orderId: string): Promise<string[]> {
  if (!isSupabaseConfigured) return getOrderImagesMock(orderId)
  const { data, error } = await supabase!.from('order_images').select('image_url').eq('order_id', orderId)
  if (error) throw error
  return data.map((row) => row.image_url)
}

export async function getOrderStatusHistory(orderId: string): Promise<OrderStatusHistoryEntry[]> {
  if (!isSupabaseConfigured) return getOrderStatusHistoryMock(orderId)
  const { data, error } = await supabase!
    .from('order_status_history')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  if (!isSupabaseConfigured) return createOrderMock(input)

  // Best done as a single Postgres RPC/Edge Function for atomicity; sequential
  // inserts here as a straightforward default once real credentials are wired up.
  const subtotal = input.items.reduce((sum, li) => sum + li.unitPrice * li.quantity, 0)
  const { data: order, error: orderError } = await supabase!
    .from('orders')
    .insert({
      user_id: input.userId,
      status: 'order_received',
      logistics_type: input.logisticsType,
      zone_id: input.zoneId,
      address: input.details.address,
      phone: input.details.phone,
      whatsapp: input.details.whatsapp || null,
      special_instructions: input.details.specialInstructions || null,
      subtotal,
      delivery_fee: input.deliveryFee,
      total: subtotal + input.deliveryFee,
      payment_method: input.paymentMethod,
      // Always starts pending, regardless of method — RLS only allows customers to insert/update
      // orders while payment_status stays 'pending'. Only the verify-payment Edge Function (service
      // role, after confirming with Paystack) can flip it to 'paid'. Cash-on-delivery orders stay
      // pending until an admin marks them paid on delivery.
      payment_status: 'pending',
      display_id: generateOrderDisplayId(),
    })
    .select()
    .single()
  if (orderError) throw orderError

  const { error: itemsError } = await supabase!.from('order_items').insert(
    input.items.map((line) => ({
      order_id: order.id,
      item_id: line.itemId,
      item_name: line.name,
      service_tier: line.tier,
      quantity: line.quantity,
      unit_price: line.unitPrice,
      line_total: line.unitPrice * line.quantity,
    })),
  )
  if (itemsError) throw itemsError

  if (input.imageDataUrls.length > 0) {
    const { error: imagesError } = await supabase!
      .from('order_images')
      .insert(input.imageDataUrls.map((url) => ({ order_id: order.id, image_url: url })))
    if (imagesError) throw imagesError
  }

  await supabase!.from('order_status_history').insert({ order_id: order.id, status: order.status })

  return order
}

/** Confirms a Paystack transaction server-side and, only if genuinely successful, marks the order paid. */
export async function verifyPaystackPayment(orderId: string, reference: string): Promise<{ verified: boolean; error?: string }> {
  if (!isSupabaseConfigured) return verifyPaystackPaymentMock(orderId, reference)
  const { data, error } = await supabase!.functions.invoke('verify-payment', { body: { orderId, reference } })
  if (error) return { verified: false, error: error.message }
  return data
}

/** Emails the customer an order confirmation with a link to view/download their receipt. Best-effort — a failed send shouldn't block checkout. */
export async function sendOrderConfirmationEmail(orderId: string): Promise<void> {
  if (!isSupabaseConfigured) return
  const { error } = await supabase!.functions.invoke('send-order-confirmation', { body: { orderId } })
  if (error) throw error
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, riderName?: string): Promise<Order> {
  if (!isSupabaseConfigured) return updateOrderStatusMock(orderId, status, riderName)

  // Fetched separately (rather than trusting the caller's in-memory `order.status`) so a history
  // row only gets written when the status genuinely changes — the same mutation also fires for
  // rider-only saves, which shouldn't spam the Activity tab with duplicate entries.
  const { data: existing } = await supabase!.from('orders').select('status').eq('id', orderId).single()

  const { data, error } = await supabase!
    .from('orders')
    .update({ status, ...(riderName !== undefined ? { rider_name: riderName } : {}), updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single()
  if (error) throw error

  if (existing && existing.status !== status) {
    await supabase!.from('order_status_history').insert({ order_id: orderId, status })
  }

  return data
}

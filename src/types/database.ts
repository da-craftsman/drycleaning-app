export type UserRole = 'customer' | 'admin' | 'superadmin'

export type AdminPermission = 'orders' | 'customers' | 'catalog' | 'zones' | 'banner' | 'tickets' | 'blog' | 'walkin'

export type ServiceTier = 'regular' | 'white' | 'express'

export type LogisticsType = 'self_dropoff' | 'pickup_only' | 'delivery_only' | 'pickup_and_delivery'

export type PaymentMethod = 'paystack' | 'cash_on_delivery'

export type PaymentStatus = 'pending' | 'paid' | 'failed'

export type OrderStatus =
  | 'order_received'
  | 'collected'
  | 'processing'
  | 'washing'
  | 'ironing'
  | 'quality_check'
  | 'ready'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled'

export type TicketStatus = 'open' | 'in_progress' | 'resolved'

export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent'

export type TicketCategory = 'damaged_item' | 'missing_item' | 'delay' | 'billing' | 'quality' | 'other'

export type NotificationType = 'new_order' | 'order_status_changed' | 'new_ticket' | 'ticket_reply'

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  phone: string
  whatsapp: string | null
  address: string | null
  email: string
  email_verified_at: string | null
  permissions: AdminPermission[]
  created_at: string
}

export interface ClothingCategory {
  id: string
  name: string
  display_order: number
}

export interface ClothingItem {
  id: string
  category_id: string
  name: string
  thumbnail_url: string | null
  // Null means that tier isn't offered for this item (e.g. no express option) — not free.
  price_regular: number | null
  price_white: number | null
  price_express: number | null
  time_regular: string | null
  time_white: string | null
  time_express: string | null
  is_active: boolean
}

export interface DeliveryZone {
  id: string
  name: string
  /** Charged when the customer picks 'pickup_only'; also added to 'delivery_fee' for 'pickup_and_delivery'. */
  pickup_fee: number
  /** Charged when the customer picks 'delivery_only'; also added to 'pickup_fee' for 'pickup_and_delivery'. */
  delivery_fee: number
}

export interface PromoBanner {
  id: string
  title: string
  subtitle: string
  image_url: string | null
  link_url: string
  is_active: boolean
}

export interface Order {
  id: string
  display_id: string
  user_id: string
  status: OrderStatus
  logistics_type: LogisticsType
  zone_id: string | null
  address: string
  phone: string
  whatsapp: string | null
  special_instructions: string | null
  rider_name: string | null
  subtotal: number
  delivery_fee: number
  total: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  paystack_reference: string | null
  confirmation_email_sent_at: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  item_id: string
  item_name: string
  service_tier: ServiceTier
  quantity: number
  unit_price: number
  line_total: number
}

export interface OrderImage {
  id: string
  order_id: string
  image_url: string
}

export interface OrderStatusHistoryEntry {
  id: string
  order_id: string
  status: OrderStatus
  created_at: string
}

export interface ComplaintTicket {
  id: string
  user_id: string
  order_id: string | null
  subject: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  photo_url: string | null
  created_at: string
}

export interface TicketMessage {
  id: string
  ticket_id: string
  author_role: UserRole
  author_name: string
  message: string
  created_at: string
}

export interface Notification {
  id: string
  recipient_id: string
  type: NotificationType
  title: string
  body: string
  link_path: string
  related_order_id: string | null
  related_ticket_id: string | null
  read_at: string | null
  created_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  feature_image: string | null
  category: string
  seo_description: string | null
  published_at: string | null
  created_at: string
}

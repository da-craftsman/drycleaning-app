import type { LogisticsType, PaymentMethod, Profile, ServiceTier, TicketCategory, TicketPriority } from '@/types/database'

export interface CartItem {
  cartItemId: string
  itemId: string
  name: string
  thumbnailUrl: string | null
  categoryName: string
  tier: ServiceTier
  quantity: number
  unitPrice: number
  readyIn: string
}

export interface CheckoutDetails {
  address: string
  phone: string
  whatsapp: string
  specialInstructions: string
}

export interface CheckoutState {
  logisticsType: LogisticsType | null
  zoneId: string | null
  details: CheckoutDetails
  imageDataUrls: string[]
  paymentMethod: PaymentMethod | null
}

export interface NewTicketInput {
  orderId: string | null
  subject: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  photoDataUrl: string | null
}

export interface CreateOrderInput {
  userId: string
  items: CartItem[]
  logisticsType: LogisticsType
  zoneId: string | null
  deliveryFee: number
  details: CheckoutDetails
  imageDataUrls: string[]
  paymentMethod: PaymentMethod
}

/** Per-customer rollup for the admin Customers list — orders/spend computed from their order history, not stored directly. */
export interface CustomerSummary {
  profile: Profile
  orderCount: number
  /** Sum of `total` across orders with `payment_status === 'paid'` — matches the revenue definition used on the admin dashboard. */
  totalSpend: number
  lastOrderAt: string | null
}

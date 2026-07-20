import type { LogisticsType, PaymentMethod, ServiceTier, TicketCategory, TicketPriority } from '@/types/database'

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

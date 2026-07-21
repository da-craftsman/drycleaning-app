import * as seed from '@/lib/data/mock/seed'
import type {
  BlogPost,
  ClothingItem,
  ComplaintTicket,
  DeliveryZone,
  Notification,
  Order,
  OrderItem,
  OrderStatusHistoryEntry,
  Profile,
  PromoBanner,
  TicketMessage,
} from '@/types/database'

// Bump this whenever seed data shape or content changes materially, so browsers with an older
// cached mock DB (a different catalog, missing fields, etc.) reseed instead of reading stale data.
const STORAGE_KEY = 'srl-mock-db-v12'

/** Every seeded account starts with this password; changed per-user via updatePasswordMock. */
export const MOCK_DEMO_PASSWORD = 'password123'

interface MockDb {
  clothingItems: ClothingItem[]
  deliveryZones: DeliveryZone[]
  promoBanner: PromoBanner
  orders: Order[]
  orderItems: OrderItem[]
  orderImages: { id: string; order_id: string; image_url: string }[]
  orderStatusHistory: OrderStatusHistoryEntry[]
  complaintTickets: ComplaintTicket[]
  ticketMessages: TicketMessage[]
  blogPosts: BlogPost[]
  notifications: Notification[]
  profiles: Profile[]
  /** userId -> password. Kept out of the Profile type so it never round-trips through query data. */
  passwords: Record<string, string>
}

function freshDb(): MockDb {
  return {
    clothingItems: structuredClone(seed.clothingItems),
    deliveryZones: structuredClone(seed.deliveryZones),
    promoBanner: structuredClone(seed.promoBanner),
    orders: structuredClone(seed.orders),
    orderItems: structuredClone(seed.orderItems),
    orderImages: structuredClone(seed.orderImages),
    orderStatusHistory: structuredClone(seed.orderStatusHistory),
    complaintTickets: structuredClone(seed.complaintTickets),
    ticketMessages: structuredClone(seed.ticketMessages),
    blogPosts: structuredClone(seed.blogPosts),
    notifications: [],
    profiles: structuredClone(seed.profiles),
    passwords: Object.fromEntries(seed.profiles.map((p) => [p.id, MOCK_DEMO_PASSWORD])),
  }
}

function loadInitial(): MockDb {
  if (typeof localStorage !== 'undefined') {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        return JSON.parse(raw) as MockDb
      } catch {
        // fall through to fresh seed
      }
    }
  }
  return freshDb()
}

export const db: MockDb = loadInitial()

export function persist() {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  }
}

/** Artificial network latency so loading states are visible, matching real Supabase call feel. */
export function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

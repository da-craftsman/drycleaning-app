import { generateOrderDisplayId } from '@/lib/utils'
import type {
  BlogPost,
  ClothingCategory,
  ClothingItem,
  ComplaintTicket,
  DeliveryZone,
  Order,
  OrderItem,
  OrderStatusHistoryEntry,
  Profile,
  PromoBanner,
  ServiceTier,
  TicketMessage,
} from '@/types/database'

function id(prefix: string, n: number) {
  return `${prefix}-${String(n).padStart(3, '0')}`
}

// ── Categories ───────────────────────────────────────────────────────────

export const categories: ClothingCategory[] = [
  { id: 'cat-everyday', name: 'Everyday Wear', display_order: 1 },
  { id: 'cat-corporate', name: 'Corporate', display_order: 2 },
  { id: 'cat-native', name: 'Native Wear', display_order: 3 },
  { id: 'cat-womens', name: "Women's", display_order: 4 },
  { id: 'cat-bedding', name: 'Bedding', display_order: 5 },
  { id: 'cat-household', name: 'Household', display_order: 6 },
  { id: 'cat-special', name: 'Special Care', display_order: 7 },
  { id: 'cat-accessories', name: 'Accessories', display_order: 8 },
]

// [name, thumbnailFile, regular, white, express, timeRegular, timeWhite, timeExpress]
type ItemRow = [string, string, number, number, number, string, string, string]

const itemsByCategory: Record<string, ItemRow[]> = {
  'cat-everyday': [
    ['Shirts & Tops', 'shirts-and-tops.png', 800, 1000, 1600, '3-4 days', '2 days', '24h'],
    ['Jeans', 'jeans.png', 1200, 1500, 2200, '3-4 days', '2 days', '24h'],
    ['Singlet', 'singlet.png', 500, 650, 1000, '2-3 days', '2 days', '24h'],
    ['Sweater', 'sweater.png', 1400, 1700, 2500, '3-4 days', '2 days', '24h'],
    ['Tracksuit (2-Piece)', 'tracksuit-two-piece.png', 1800, 2200, 3200, '3-4 days', '2 days', '24h'],
    ['Skirt or Shorts', 'skirt-or-shorts.png', 800, 1000, 1600, '2-3 days', '2 days', '24h'],
  ],
  'cat-corporate': [
    ["Men's Suit", 'mens-suit.png', 4500, 5200, 7000, '4-5 days', '3 days', '48h'],
    ["Ladies' Suit", 'ladies-suit.png', 4200, 4900, 6600, '4-5 days', '3 days', '48h'],
    ['Suit Jacket', 'suit-jacket.png', 2200, 2600, 3600, '3-4 days', '2 days', '24h'],
    ['Trousers', 'trousers.png', 1100, 1400, 2100, '3-4 days', '2 days', '24h'],
    ['Lab Coat', 'lab-coat.png', 1300, 1600, 2400, '3-4 days', '2 days', '24h'],
  ],
  'cat-native': [
    ['Agbada', 'agbada.png', 5000, 5800, 7800, '4-5 days', '3 days', '48h'],
    ['Buba and Wrapper', 'buba-and-wrapper.png', 2600, 3100, 4300, '4-5 days', '3 days', '48h'],
    ['Jalabia', 'jalabia.png', 2000, 2400, 3400, '3-4 days', '2 days', '24h'],
    ['Senator Wear', 'senator-wear.png', 2800, 3300, 4600, '3-4 days', '2 days', '24h'],
    ['Isiagu', 'isiagu.png', 2200, 2600, 3600, '3-4 days', '2 days', '24h'],
  ],
  'cat-womens': [
    ['Blouse', 'blouse.png', 900, 1150, 1800, '3-4 days', '2 days', '24h'],
    ['Evening Gown', 'evening-gown.png', 2800, 3300, 4600, '4-5 days', '3 days', '48h'],
    ['Skirt and Blouse Set', 'skirt-and-blouse.png', 1500, 1850, 2700, '3-4 days', '2 days', '24h'],
  ],
  'cat-bedding': [
    ['Bedspread', 'bedspread.png', 2200, 2700, 3800, '3-4 days', '2 days', '24h'],
    ['Duvet', 'duvet.png', 3500, 4200, 6000, '4-5 days', '3 days', '48h'],
    ['Pillow Case', 'pillow-case.png', 400, 550, 900, '2-3 days', '2 days', '24h'],
  ],
  'cat-household': [
    ['Curtain (Single Panel)', 'curtain-single-panel.png', 2000, 2400, 3400, '4-5 days', '3 days', '48h'],
    ['Curtain (Double Panel)', 'curtain-double-panel.png', 3400, 4000, 5600, '4-5 days', '3 days', '48h'],
    ['Center Rug (Large)', 'big-center-rug.png', 3200, 3800, 5200, '4-5 days', '3 days', '48h'],
    ['Center Rug (Small)', 'small-center-rug.png', 1800, 2200, 3200, '3-4 days', '2 days', '24h'],
    ['Towel', 'towel.png', 700, 900, 1400, '2-3 days', '2 days', '24h'],
  ],
  'cat-special': [
    ['Wedding Dress', 'wedding-dress.png', 8000, 9500, 13000, '5-6 days', '4 days', '72h'],
    ['Shoes', 'shoes.png', 1800, 2200, 3200, '3-4 days', '2 days', '24h'],
    ['Teddy Bear (Large)', 'big-teddy-bear.png', 2200, 2700, 3800, '3-4 days', '2 days', '24h'],
    ['Teddy Bear (Small)', 'small-teddy-bear.png', 1200, 1500, 2200, '2-3 days', '2 days', '24h'],
  ],
  'cat-accessories': [
    ['Cap', 'cap.png', 400, 550, 900, '2-3 days', '2 days', '24h'],
    ['Ties and Scarves', 'ties-and-scarves.png', 600, 750, 1200, '2-3 days', '2 days', '24h'],
    ['School Bag', 'school-bag.png', 1200, 1500, 2200, '3-4 days', '2 days', '24h'],
    ['Travel Bag', 'travel-bag.png', 1600, 2000, 2900, '3-4 days', '2 days', '24h'],
  ],
}

export const clothingItems: ClothingItem[] = categories.flatMap((cat) =>
  itemsByCategory[cat.id].map(
    ([name, thumbnailFile, priceRegular, priceWhite, priceExpress, timeRegular, timeWhite, timeExpress], i) => ({
      id: `${cat.id}-item-${i}`,
      category_id: cat.id,
      name,
      thumbnail_url: `/clothes/${thumbnailFile}`,
      price_regular: priceRegular,
      price_white: priceWhite,
      price_express: priceExpress,
      time_regular: timeRegular,
      time_white: timeWhite,
      time_express: timeExpress,
      is_active: true,
    }),
  ),
)

// ── Delivery zones (Enugu) ──────────────────────────────────────────────

export const deliveryZones: DeliveryZone[] = [
  { id: 'zone-independence-layout', name: 'Independence Layout', pickup_fee: 2500, delivery_fee: 2500 },
  { id: 'zone-new-haven', name: 'New Haven', pickup_fee: 2500, delivery_fee: 2500 },
  { id: 'zone-trans-ekulu', name: 'Trans-Ekulu', pickup_fee: 2500, delivery_fee: 2500 },
  { id: 'zone-gra', name: 'GRA', pickup_fee: 2500, delivery_fee: 2500 },
  { id: 'zone-achara-layout', name: 'Achara Layout', pickup_fee: 2500, delivery_fee: 2500 },
  { id: 'zone-abakpa-nike', name: 'Abakpa Nike', pickup_fee: 2500, delivery_fee: 2500 },
  { id: 'zone-uwani', name: 'Uwani', pickup_fee: 2500, delivery_fee: 2500 },
  { id: 'zone-coal-camp', name: 'Coal Camp', pickup_fee: 2500, delivery_fee: 2500 },
]

// ── Promo banner ─────────────────────────────────────────────────────────

export const promoBanner: PromoBanner = {
  id: 'banner-main',
  title: 'Welcome Offer',
  subtitle: '20% off your first service',
  image_url: null,
  link_url: '/order',
  is_active: true,
}

// ── Demo accounts ────────────────────────────────────────────────────────

export const profiles: Profile[] = [
  {
    id: 'user-admin',
    role: 'admin',
    full_name: 'Chidinma Okafor',
    phone: '08031234567',
    whatsapp: '08031234567',
    address: 'Shalah Rex HQ, Independence Layout, Enugu',
    email: 'admin@shalahrexlaundry.com',
    email_verified_at: '2025-11-01T09:00:00.000Z',
    created_at: '2025-11-01T09:00:00.000Z',
  },
  {
    id: 'user-demo',
    role: 'customer',
    full_name: 'Ugochukwu Eze',
    phone: '08098765432',
    whatsapp: '08098765432',
    address: '14 Garden Avenue, Independence Layout, Enugu',
    email: 'demo@shalahrexlaundry.com',
    email_verified_at: '2025-12-10T14:30:00.000Z',
    created_at: '2025-12-10T14:30:00.000Z',
  },
]

// ── Seeded orders (span the full tracking state machine) ───────────────

function item(categoryId: string, index: number) {
  return clothingItems.find((i) => i.id === `${categoryId}-item-${index}`)!
}

interface SeedOrder {
  order: Order
  items: OrderItem[]
  images: { id: string; order_id: string; image_url: string }[]
}

function buildOrder(opts: {
  n: number
  daysAgo: number
  status: Order['status']
  paymentStatus: Order['payment_status']
  lines: { item: ClothingItem; tier: ServiceTier; qty: number }[]
}): SeedOrder {
  const created = new Date(Date.now() - opts.daysAgo * 24 * 60 * 60 * 1000)
  // `* 1000 + opts.n` guarantees distinct seed IDs even when two daysAgo offsets happen to land on
  // the same last-6-digits window (the timestamp alone isn't enough entropy for a handful of orders
  // spaced exact-day apart).
  const displayId = generateOrderDisplayId(created.getTime() * 1000 + opts.n)
  const zone = deliveryZones[opts.n % deliveryZones.length]

  const orderItems: OrderItem[] = opts.lines.map((line, i) => {
    const unitPrice =
      line.tier === 'regular' ? line.item.price_regular : line.tier === 'white' ? line.item.price_white : line.item.price_express
    return {
      id: id(`oi-${opts.n}`, i),
      order_id: id('order', opts.n),
      item_id: line.item.id,
      item_name: line.item.name,
      service_tier: line.tier,
      quantity: line.qty,
      unit_price: unitPrice,
      line_total: unitPrice * line.qty,
    }
  })

  const subtotal = orderItems.reduce((sum, li) => sum + li.line_total, 0)
  // All seeded orders use 'pickup_and_delivery' below, so both zone fees apply.
  const zoneDeliveryFee = zone.pickup_fee + zone.delivery_fee
  const total = subtotal + zoneDeliveryFee

  return {
    order: {
      id: id('order', opts.n),
      display_id: displayId,
      user_id: 'user-demo',
      status: opts.status,
      logistics_type: 'pickup_and_delivery',
      zone_id: zone.id,
      address: '14 Garden Avenue, Independence Layout, Enugu',
      phone: '08098765432',
      whatsapp: '08098765432',
      special_instructions: opts.n % 2 === 0 ? 'Please use fragrance-free detergent.' : null,
      rider_name: opts.status === 'out_for_delivery' || opts.status === 'completed' ? 'Emeka (Rider)' : null,
      subtotal,
      delivery_fee: zoneDeliveryFee,
      total,
      payment_method: opts.n % 2 === 0 ? 'paystack' : 'cash_on_delivery',
      payment_status: opts.paymentStatus,
      paystack_reference: null,
      confirmation_email_sent_at: null,
      created_at: created.toISOString(),
      updated_at: created.toISOString(),
    },
    items: orderItems,
    images: [],
  }
}

const seedOrders: SeedOrder[] = [
  buildOrder({
    n: 1,
    daysAgo: 0,
    status: 'order_received',
    paymentStatus: 'paid',
    lines: [
      { item: item('cat-everyday', 0), tier: 'express', qty: 3 },
      { item: item('cat-everyday', 2), tier: 'express', qty: 1 },
    ],
  }),
  buildOrder({
    n: 2,
    daysAgo: 1,
    status: 'washing',
    paymentStatus: 'paid',
    lines: [
      { item: item('cat-corporate', 0), tier: 'white', qty: 4 },
      { item: item('cat-corporate', 3), tier: 'white', qty: 2 },
    ],
  }),
  buildOrder({
    n: 3,
    daysAgo: 3,
    status: 'out_for_delivery',
    paymentStatus: 'paid',
    lines: [{ item: item('cat-bedding', 1), tier: 'regular', qty: 1 }],
  }),
  buildOrder({
    n: 4,
    daysAgo: 7,
    status: 'completed',
    paymentStatus: 'paid',
    lines: [
      { item: item('cat-native', 0), tier: 'white', qty: 1 },
      { item: item('cat-accessories', 1), tier: 'white', qty: 1 },
    ],
  }),
  buildOrder({
    n: 5,
    daysAgo: 14,
    status: 'completed',
    paymentStatus: 'paid',
    lines: [{ item: item('cat-everyday', 0), tier: 'regular', qty: 5 }],
  }),
  buildOrder({
    n: 6,
    daysAgo: 2,
    status: 'quality_check',
    paymentStatus: 'pending',
    lines: [{ item: item('cat-special', 0), tier: 'express', qty: 1 }],
  }),
]

export const orders: Order[] = seedOrders.map((o) => o.order)
export const orderItems: OrderItem[] = seedOrders.flatMap((o) => o.items)
export const orderImages = seedOrders.flatMap((o) => o.images)

// Mirrors the workflow order in features/tracking/TrackingTimeline's `stages` (excluding 'cancelled',
// which never has a linear history — just the single 'order_received' entry).
const statusOrder: Order['status'][] = [
  'order_received',
  'collected',
  'processing',
  'washing',
  'ironing',
  'quality_check',
  'ready',
  'out_for_delivery',
  'completed',
]

/** Synthesizes a believable per-stage timestamp trail for a seeded order, ~3 hours apart per stage. */
function buildHistory(order: Order): OrderStatusHistoryEntry[] {
  const start = new Date(order.created_at).getTime()
  if (order.status === 'cancelled') {
    return [{ id: `${order.id}-hist-0`, order_id: order.id, status: 'order_received', created_at: order.created_at }]
  }
  const reachedIndex = statusOrder.indexOf(order.status)
  const stepMs = 3 * 60 * 60 * 1000
  return statusOrder.slice(0, reachedIndex + 1).map((status, i) => ({
    id: `${order.id}-hist-${i}`,
    order_id: order.id,
    status,
    created_at: new Date(start + i * stepMs).toISOString(),
  }))
}

export const orderStatusHistory: OrderStatusHistoryEntry[] = orders.flatMap(buildHistory)

// ── Seeded tickets ───────────────────────────────────────────────────────

export const complaintTickets: ComplaintTicket[] = [
  {
    id: 'ticket-001',
    user_id: 'user-demo',
    order_id: 'order-004',
    subject: 'Missing button on shirt',
    description: 'One of my dress shirts came back with a missing button on the cuff.',
    category: 'damaged_item',
    priority: 'normal',
    status: 'resolved',
    photo_url: null,
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ticket-002',
    user_id: 'user-demo',
    order_id: 'order-002',
    subject: 'Order running late',
    description: 'This order was supposed to be ready yesterday, any update on timing?',
    category: 'delay',
    priority: 'high',
    status: 'open',
    photo_url: null,
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
]

export const ticketMessages: TicketMessage[] = [
  {
    id: 'tm-001',
    ticket_id: 'ticket-001',
    author_role: 'customer',
    author_name: 'Ugochukwu Eze',
    message: 'One of my dress shirts came back with a missing button on the cuff.',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tm-002',
    ticket_id: 'ticket-001',
    author_role: 'admin',
    author_name: 'Chidinma Okafor',
    message: "So sorry about that! We've replaced the button and issued a ₦500 credit to your account.",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tm-003',
    ticket_id: 'ticket-002',
    author_role: 'customer',
    author_name: 'Ugochukwu Eze',
    message: 'This order was supposed to be ready yesterday, any update on timing?',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
]

// ── Blog posts ───────────────────────────────────────────────────────────

export const blogPosts: BlogPost[] = [
  {
    id: 'post-1',
    title: 'How to Care for Native Wear Between Washes',
    slug: 'how-to-care-for-native-wear',
    excerpt: 'Agbada, Isiagu, and George wrappers need a gentler touch. Here is what to do at home.',
    content: 'Full article content coming soon.',
    feature_image: null,
    category: 'Fabric Care',
    seo_description: 'Tips for caring for native wear like Agbada and Isiagu between professional washes.',
    published_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'post-2',
    title: '5 Signs Your Suit Needs Professional Cleaning',
    slug: '5-signs-your-suit-needs-professional-cleaning',
    excerpt: "Don't wait for visible stains, here's when to send your suit in.",
    content: 'Full article content coming soon.',
    feature_image: null,
    category: 'Corporate Wear',
    seo_description: 'Learn the signs that your suit needs professional laundry care.',
    published_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'post-3',
    title: 'Express vs Regular: Which Service Tier Fits Your Schedule?',
    slug: 'express-vs-regular-service-tiers',
    excerpt: "A breakdown of our three service tiers and when each one makes sense.",
    content: 'Full article content coming soon.',
    feature_image: null,
    category: 'Guides',
    seo_description: 'Compare Regular, White Wash, and Express laundry service tiers.',
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

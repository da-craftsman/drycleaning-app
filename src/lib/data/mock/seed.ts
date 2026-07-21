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
// A null price/time means that tier isn't offered for the item at all (not free) — mirrors
// supabase/schema.sql's seed, which carries the same real business price list (2026-07-21).
type ItemRow = [string, string, number | null, number | null, number | null, string | null, string | null, string | null]

const itemsByCategory: Record<string, ItemRow[]> = {
  'cat-everyday': [
    ['Shirt / Polo', 'shirts-and-tops.png', 350, 500, 1000, '2-3 days', '2 days', '24h'],
    ['Jeans Trouser', 'jeans.png', 500, 700, 1200, '3-4 days', '2 days', '24h'],
    ['Shorts', 'skirt-or-shorts.png', 400, 600, 1000, '2-3 days', '2 days', '24h'],
    ['Singlet', 'singlet.png', 250, 300, 500, '2-3 days', '2 days', '24h'],
    ['Boxers', 'singlet.png', 300, 400, 600, '2-3 days', '2 days', '24h'],
    ['Sweater', 'sweater.png', 500, 800, 1200, '3-4 days', '2 days', '24h'],
  ],
  'cat-corporate': [
    ['Complete Male Suit', 'mens-suit.png', 3500, 4500, 8000, '4-5 days', '3 days', '48h'],
    ['Female Suit', 'ladies-suit.png', 3000, 4000, 7000, '4-5 days', '3 days', '48h'],
    ['Suit Jacket', 'suit-jacket.png', 800, 1000, 2000, '3-4 days', '2 days', '24h'],
    ['Plain Trouser', 'trousers.png', 450, 600, 1200, '3-4 days', '2 days', '24h'],
    ['Labcoat', 'lab-coat.png', 500, null, 1000, '3-4 days', null, '24h'],
  ],
  'cat-native': [
    ['Complete Agbada', 'agbada.png', 2000, 2800, 5000, '4-5 days', '3 days', '48h'],
    ['Buba and Wrapper', 'buba-and-wrapper.png', 800, 1500, 2000, '4-5 days', '3 days', '48h'],
    ['Jalabia', 'jalabia.png', 500, 800, 1200, '3-4 days', '2 days', '24h'],
    ['Senator Wears', 'senator-wear.png', 1000, 1500, 2000, '3-4 days', '2 days', '24h'],
    ['Up and Down', 'senator-wear.png', 800, 1500, 1800, '3-4 days', '2 days', '24h'],
    ['Native', 'senator-wear.png', 800, 1500, 1800, '3-4 days', '2 days', '24h'],
    ['Cotton (Single)', 'buba-and-wrapper.png', 500, 700, 1000, '3-4 days', '2 days', '24h'],
    ['Cotton (Double)', 'buba-and-wrapper.png', 800, 1000, 1500, '3-4 days', '2 days', '24h'],
  ],
  'cat-womens': [
    ['Gown', 'evening-gown.png', 400, 600, 1000, '3-4 days', '2 days', '24h'],
    ['Skirt and Blouse', 'skirt-and-blouse.png', 800, 1500, 2000, '3-4 days', '2 days', '24h'],
    ['Skirt', 'skirt-or-shorts.png', 400, 500, 1000, '2-3 days', '2 days', '24h'],
  ],
  'cat-bedding': [
    ['Bedspread', 'bedspread.png', 800, 1200, 1800, '3-4 days', '2 days', '24h'],
    ['Duvet', 'duvet.png', 2000, 3000, 4500, '4-5 days', '3 days', '48h'],
    ['Pillow Case', 'pillow-case.png', 150, 200, 300, '2-3 days', '2 days', '24h'],
  ],
  'cat-household': [
    ['Towel', 'towel.png', 600, 1000, 1800, '2-3 days', '2 days', '24h'],
    ['Small Center Rug', 'small-center-rug.png', 3000, 6000, null, '4-5 days', '3 days', null],
    ['Big Center Rug', 'big-center-rug.png', 5000, 10000, null, '4-5 days', '3 days', null],
  ],
  'cat-special': [
    ['Wedding Gown', 'wedding-dress.png', null, 10000, 25000, null, '4 days', '72h'],
    ['Shoe', 'shoes.png', 1000, 1500, 3500, '3-4 days', '2 days', '24h'],
    ['Small Teddy Bear', 'small-teddy-bear.png', 1500, 2500, null, '3-4 days', '2 days', null],
    ['Big Teddy Bear', 'big-teddy-bear.png', 3500, 6000, null, '4-5 days', '3 days', null],
  ],
  'cat-accessories': [
    ['Hat / Cap', 'cap.png', 300, 400, 600, '2-3 days', '2 days', '24h'],
    ['Scarf', 'ties-and-scarves.png', 200, 300, 400, '2-3 days', '2 days', '24h'],
    ['Tie', 'ties-and-scarves.png', 200, 300, 400, '2-3 days', '2 days', '24h'],
    ['Handkerchief', 'ties-and-scarves.png', 200, 300, 400, '2-3 days', '2 days', '24h'],
    ['Stockings', 'ties-and-scarves.png', 200, 300, 400, '2-3 days', '2 days', '24h'],
    ['School Bags', 'school-bag.png', 1000, 2000, 2500, '3-4 days', '2 days', '24h'],
    ['Traveling Bags', 'travel-bag.png', 1500, 3000, 3500, '3-4 days', '2 days', '24h'],
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

// 2026-07-20: replaced with the real coverage area + fee tiers given for launch. GRA and Holy
// Ghost were grouped into the ₦2,500 tier (the "etc." after Independence Layout/Uwani/Asata in the
// original list) since no other tier was specified for them — flagged for the user to confirm.
export const deliveryZones: DeliveryZone[] = [
  { id: 'zone-lomalinda-extension', name: 'Lomalinda Extension', pickup_fee: 1500, delivery_fee: 1500 },
  { id: 'zone-independence-layout', name: 'Independence Layout', pickup_fee: 2500, delivery_fee: 2500 },
  { id: 'zone-uwani', name: 'Uwani', pickup_fee: 2500, delivery_fee: 2500 },
  { id: 'zone-asata', name: 'Asata', pickup_fee: 2500, delivery_fee: 2500 },
  { id: 'zone-gra', name: 'GRA', pickup_fee: 2500, delivery_fee: 2500 },
  { id: 'zone-holy-ghost', name: 'Holy Ghost', pickup_fee: 2500, delivery_fee: 2500 },
  { id: 'zone-new-haven', name: 'New Haven', pickup_fee: 3000, delivery_fee: 3000 },
  { id: 'zone-ugwuaji', name: 'Ugwuaji', pickup_fee: 3000, delivery_fee: 3000 },
  { id: 'zone-gariki', name: 'Gariki', pickup_fee: 3000, delivery_fee: 3000 },
  { id: 'zone-achara', name: 'Achara', pickup_fee: 3000, delivery_fee: 3000 },
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
    role: 'superadmin',
    full_name: 'Chidinma Okafor',
    phone: '08031234567',
    whatsapp: '08031234567',
    address: 'Shalah Rex HQ, Independence Layout, Enugu',
    email: 'admin@shalahrexlaundry.com',
    email_verified_at: '2025-11-01T09:00:00.000Z',
    permissions: [],
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
    permissions: [],
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
    // Non-null by construction — every seeded line below picks a tier the referenced item actually offers.
    const unitPrice = (
      line.tier === 'regular' ? line.item.price_regular : line.tier === 'white' ? line.item.price_white : line.item.price_express
    )!
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
    content:
      "Native wear like Agbada, Isiagu, and George wrappers are usually the most expensive pieces in anyone's wardrobe, and they're built from fabrics (heavy brocade, lace, hand-embroidered cotton) that don't behave like an everyday shirt. Getting a few habits right between professional cleans keeps them looking sharp for years instead of a couple of outings.\n\nHang, don't fold, whenever you can. Brocade and heavily embroidered fabric creases in a way that's hard to fully press out, and a fold line across an embroidered panel is one of the more common ways these pieces get damaged. A padded or wide hanger keeps the shoulders and embroidery from stressing at a single point.\n\nAir it out before you store it. Native wear picks up smoke, perfume, and body odor over a full event, and sealing that into a wardrobe or garment bag right away just sets it in. Let it hang in open air for a few hours first.\n\nSpot-clean sweat and stains immediately, but don't scrub. Heavy fabrics with embroidery or stone work can't take the kind of aggressive scrubbing that gets a stain out of cotton. Blot gently with a clean, barely damp cloth and let the rest wait for a proper wash. Scrubbing at home is one of the fastest ways to loosen embroidery threads or dull beadwork.\n\nDon't iron directly on embroidery or stones. If you're touching up a piece yourself between cleans, iron from the reverse side, or place a thin cloth over decorated panels first. Direct heat on stonework or metallic thread can melt adhesive backing or flatten the texture permanently.\n\nWhen it's time for an actual wash, that's where we come in: native wear gets sorted and treated according to its specific fabric here, not run through a one-size-fits-all cycle, which is exactly the kind of care pieces like these need.",
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
    content:
      "Most people only think about sending a suit in for cleaning once there's a stain on it. By then, you've usually already missed a few earlier signs that it needed attention. Here's what to actually watch for.\n\n1. It holds onto odor after airing out. A suit that still smells faintly of the office, a restaurant, or a long day even after hanging overnight has absorbed more than it can shake off on its own. Odor sits deep in the fibers of wool and wool-blend suiting in a way that airing alone won't fix.\n\n2. The fabric has started to shine, especially at the elbows, seat, and knees. That shine is friction wearing down the fibers, and it's usually made worse by ironing at home with too much heat. A professional press brings back the texture instead of flattening it further.\n\n3. It doesn't hang or sit right anymore. If your jacket looks slightly misshapen on a hanger, or trousers won't hold a crease the way they used to, the fabric has lost structure, often from sweat and body oils breaking down the weave over repeated wears without a proper clean in between.\n\n4. There's a stain you can't identify, or one that's already been there a while. Older stains (sweat, deodorant, food oil) oxidize and set into the fabric over time, and they get genuinely harder to lift the longer they sit. If you can't tell what it is or how long it's been there, that's exactly the kind of thing that needs an expert eye rather than a home remedy.\n\n5. It's been worn more than 3–4 times without a clean. Even with no visible stain or odor, a suit worn this many times has accumulated enough oil and dust in the fibers to start affecting both how it drapes and how long it'll last. Regular cleaning on a schedule, not just when something's visibly wrong, is what keeps a good suit good for years.\n\nWe treat suits and suit jackets as their own category here, with pricing and turnaround built specifically for corporate wear, so it's worth sending yours in before any of these five turn into a bigger problem.",
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
    content:
      "Every item in our catalog comes in three service tiers (Regular, White Wash, and Express), and picking the right one is really just a question of timing and fabric, not which one is \"better.\" Here's how to think about it.\n\nRegular is the default, and it's the right call for most everyday laundry: shirts, jeans, everyday wear, bedding, household items. It runs on a 2–5 day turnaround depending on the item, and it covers a full, thorough wash-and-press without paying a premium for speed you don't need. If you're planning ahead, restocking your work wardrobe for the week or handling a routine load, this is the tier to reach for.\n\nWhite Wash is a separate tier, not just \"Regular but for white clothes.\" It uses a gentler process built around keeping whites bright and delicates intact: think white shirts, light fabrics, anything where the wrong detergent or a rough cycle risks yellowing or fading. It's priced a step above Regular and turns around faster too, in about 2 days across most items, because the process itself is more controlled.\n\nExpress is for when you're actually up against the clock: a suit you need for tomorrow's meeting, an outfit for an event this weekend that you only just remembered about. Everything in Express is guaranteed within 24–72 hours depending on the item, at a higher price point that reflects the priority handling, not a shortcut in quality. It's not meant for routine use; it's meant for the specific week something can't wait.\n\nA simple way to decide: if you're planning more than a few days ahead, Regular saves you money for the same result. If it's whites or delicates specifically, White Wash protects the fabric better than a generic cycle would. And if the calendar's the problem, not the fabric, Express is what closes that gap.\n\nYou can mix tiers within a single order too: express the shirt you need tomorrow, regular everything else, so you're never overpaying just because one item in the load is urgent.",
    feature_image: null,
    category: 'Guides',
    seo_description: 'Compare Regular, White Wash, and Express laundry service tiers.',
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

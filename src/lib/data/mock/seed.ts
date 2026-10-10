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
  { id: 'cat-children', name: "Children's Wear", display_order: 5 },
  { id: 'cat-bedding', name: 'Bedding', display_order: 6 },
  { id: 'cat-household', name: 'Household', display_order: 7 },
  { id: 'cat-special', name: 'Special Care', display_order: 8 },
  { id: 'cat-accessories', name: 'Accessories', display_order: 9 },
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
  // Empty for now — no children's wear items to price yet. Add them from the admin Catalog &
  // Pricing page once real items/pricing are available.
  'cat-children': [],
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
    notify_new_orders: true,
    notify_new_tickets: true,
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
    notify_new_orders: true,
    notify_new_tickets: true,
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
      ready_email_sent_at: null,
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
    title: "How to Care for Native Wear Between Washes: Agbada & Isiagu",
    slug: 'how-to-care-for-native-wear',
    excerpt: "Agbada, Isiagu, Senator and George wrappers need a gentler touch. Here are five habits that keep native wear looking sharp between professional cleans.",
    content: "<p>Native wear like Agbada, Isiagu, Senator and George wrappers are usually the most expensive pieces in anyone's wardrobe, and they are built from fabrics (heavy brocade, lace, hand-embroidered cotton) that don't behave like an everyday shirt. Getting a few habits right between professional cleans keeps them looking sharp for years instead of a couple of outings. Here is the routine we recommend to customers across Enugu.</p>\n<h2>1. Hang, don't fold</h2>\n<p>Brocade and heavily embroidered fabric creases in a way that's hard to fully press out, and a fold line across an embroidered panel is one of the more common ways these pieces get damaged. A padded or wide hanger keeps the shoulders and embroidery from stressing at a single point.</p>\n<h2>2. Air it out before you put it away</h2>\n<p>Native wear picks up smoke, perfume and body odour over a full event, and sealing that into a wardrobe or garment bag right away just sets it in. Let it hang in open air, out of direct sun, for a few hours first.</p>\n<h2>3. Spot-clean sweat and stains, but never scrub</h2>\n<p>Heavy fabrics with embroidery or stone work can't take the kind of aggressive scrubbing that gets a stain out of cotton. Blot gently with a clean, barely damp cloth and let the rest wait for a proper wash. Scrubbing at home is one of the fastest ways to loosen embroidery threads or dull beadwork. For anything stubborn, our <a href=\"/services/stain-removal\">stain removal service</a> assesses the fabric before any treatment begins.</p>\n<h2>4. Don't iron directly on embroidery or stones</h2>\n<p>If you're touching up a piece yourself between cleans, iron from the reverse side, or place a thin cloth over decorated panels first. Direct heat on stonework or metallic thread can melt adhesive backing or flatten the texture permanently.</p>\n<h2>5. Store it in breathable fabric, not plastic</h2>\n<p>Plastic covers trap moisture, and in the rainy season that is an open invitation to mildew and yellowing. Use a cotton garment bag or an old clean bedsheet, keep the piece out of direct sunlight to prevent fading, and give it room in the wardrobe so the embroidery isn't crushed.</p>\n<h2>When to send native wear for professional cleaning</h2>\n<p>Send it in after any event where you sweated heavily, got a stain, or wore it for a full day, and always before storing it for a long time. At Shalah Rex Laundry, native wear is sorted and treated according to its specific fabric as part of our <a href=\"/services/clothing-care\">clothing care service</a>, not run through a one-size-fits-all cycle. If you're in Enugu, you don't even have to bring it in: book <a href=\"/services/pickup-dropoff\">home pick up and delivery</a> and we'll collect it from your door and return it pressed and ready for the next occasion.</p>",
    feature_image: null,
    category: 'Fabric Care',
    seo_description: "How to care for native wear like Agbada, Isiagu and George between washes: hanging, airing, spot cleaning, ironing and storage tips from an Enugu laundry.",
    published_at: new Date(Date.now() - 101 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 102 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'post-2',
    title: "5 Signs Your Suit Needs Professional Dry Cleaning",
    slug: '5-signs-your-suit-needs-professional-cleaning',
    excerpt: "Don't wait for a visible stain. These five signs tell you it's time to send your suit for professional dry cleaning, and how often to do it.",
    content: "<p>Most people only think about sending a suit for cleaning once there's a stain on it. By then, you've usually missed a few earlier signs that it needed attention. Whether you wear a suit to the office every day or only for weddings and meetings, here's what to actually watch for.</p>\n<h2>1. It holds onto odour after airing out</h2>\n<p>A suit that still smells faintly of the office, a restaurant or a long day even after hanging overnight has absorbed more than it can shake off on its own. Odour sits deep in the fibres of wool and wool-blend suiting in a way that airing alone won't fix.</p>\n<h2>2. The fabric has started to shine</h2>\n<p>Watch the elbows, seat and knees. That shine is friction wearing down the fibres, and it's usually made worse by ironing at home with too much heat. A professional press brings back the texture instead of flattening it further.</p>\n<h2>3. It doesn't hang or sit right anymore</h2>\n<p>If your jacket looks slightly misshapen on a hanger, or trousers won't hold a crease the way they used to, the fabric has lost structure, often from sweat and body oils breaking down the weave over repeated wears without a proper clean in between.</p>\n<h2>4. There's a stain you can't identify, or an old one</h2>\n<p>Older stains (sweat, deodorant, food oil) oxidise and set into the fabric over time, and they get harder to lift the longer they sit. If you can't tell what it is or how long it's been there, that's exactly the kind of thing that needs an expert eye rather than a home remedy.</p>\n<h2>5. It's been worn three or four times without a clean</h2>\n<p>Even with no visible stain or odour, a suit worn this many times has collected enough oil and dust in the fibres to affect both how it drapes and how long it lasts. Cleaning on a schedule, not just when something is visibly wrong, is what keeps a good suit good for years.</p>\n<h2>How often should you dry clean a suit?</h2>\n<p>For a suit in regular rotation, every three to four wears is a good rule, plus a clean before you store it for a while. In between, hang it on a shaped hanger, brush it down, and give it a day's rest between wears so the fibres can recover.</p>\n<h2>Professional suit cleaning in Enugu</h2>\n<p>We treat suits and suit jackets as their own category, with pricing and turnaround built for corporate wear. Our <a href=\"/services/dry-cleaning-ironing\">dry cleaning and ironing service</a> uses solvent-based cleaning and hand-finished pressing, and Express turnaround can have your suit ready in 24 to 48 hours. Busy week? Book <a href=\"/services/pickup-dropoff\">home pick up and delivery</a> and we'll collect it from your home or office anywhere we cover in Enugu.</p>",
    feature_image: null,
    category: 'Corporate Wear',
    seo_description: "Five signs your suit needs professional dry cleaning, from lingering odour to shiny fabric, plus how often to clean a suit. Advice from an Enugu laundry.",
    published_at: new Date(Date.now() - 91 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 92 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'post-3',
    title: "Express vs Regular Laundry: Which Service Fits Your Schedule?",
    slug: 'express-vs-regular-service-tiers',
    excerpt: "Regular, White Wash or Express? A plain-English breakdown of our three laundry service tiers, their turnaround times, and when each one makes sense.",
    content: "<p>Every item in our catalogue comes in three service tiers (Regular, White Wash and Express), and picking the right one is really a question of timing and fabric, not which one is \"better\". Here's how to think about it.</p>\n<h2>Regular: the everyday choice</h2>\n<p>Regular is the default, and it's the right call for most everyday laundry: shirts, jeans, everyday wear, bedding and household items. It runs on a 2 to 5 day turnaround depending on the item, and covers a full, thorough wash and press without paying a premium for speed you don't need. If you're planning ahead, restocking your work wardrobe for the week or handling a routine load, this is the tier to reach for.</p>\n<h2>White Wash: for whites and delicates</h2>\n<p>White Wash is a separate tier, not just \"Regular but for white clothes\". It uses a gentler process built around keeping whites bright and delicates intact: white shirts, light fabrics, anything where the wrong detergent or a rough cycle risks yellowing or fading. It's priced a step above Regular and turns around faster too, in about 2 days for most items, because the process itself is more controlled.</p>\n<h2>Express: when the clock is the problem</h2>\n<p>Express is for when you're actually up against the clock: a suit you need for tomorrow's meeting, or an outfit for an event this weekend that you only just remembered. Express items are ready within 24 to 72 hours depending on the item, at a higher price that reflects the priority handling, not a shortcut in quality. It's not meant for routine use; it's meant for the week something can't wait.</p>\n<h2>How to decide in ten seconds</h2>\n<ul>\n<li><strong>Planning more than a few days ahead?</strong> Regular saves you money for the same result.</li>\n<li><strong>Whites or delicates?</strong> White Wash protects the fabric better than a generic cycle.</li>\n<li><strong>Need it tomorrow?</strong> Express closes the gap.</li>\n</ul>\n<h2>Mix tiers in a single order</h2>\n<p>You can mix tiers within one order: express the shirt you need tomorrow and send everything else on Regular, so you're never overpaying just because one item is urgent. Every price is listed per item and per tier on our <a href=\"/services\">services and price list</a>, and with <a href=\"/services/pickup-dropoff\">home pick up and delivery</a> across Enugu, the whole order comes back to your door together.</p>",
    feature_image: null,
    category: 'Guides',
    seo_description: "Express vs Regular vs White Wash laundry: compare turnaround times and costs, and learn which service tier fits your schedule and fabrics in Enugu.",
    published_at: new Date(Date.now() - 84 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'post-4',
    title: "Home Pick Up and Delivery Laundry in Enugu: How It Works",
    slug: 'home-pick-up-and-delivery-laundry-enugu',
    excerpt: "Never queue at a laundry again. Here is exactly how home pick up and delivery laundry works with Shalah Rex in Enugu, step by step.",
    content: "<p>Between work, traffic and family, very few people in Enugu have a free afternoon to carry a bag of clothes across town and wait at a laundry. That's why we built Shalah Rex Laundry (Shalarex, to many of our customers) around home pick up and delivery: you book on your phone, we collect from your door, and your clothes come back washed, ironed and folded. Here's exactly how it works.</p>\n<h2>Step 1: Build your order online</h2>\n<p>Open the <a href=\"/order\">order page</a> and add your items by category: everyday wear, corporate wear, native wear, bedding, household items and more. For each item you choose a service tier (Regular, White Wash or Express), and you see the exact price before you add it. No guesswork, no surprises at the counter.</p>\n<h2>Step 2: Choose how your laundry travels</h2>\n<p>At checkout you pick one of four options:</p>\n<ul>\n<li><strong>Pickup &amp; Delivery:</strong> we collect from your door and bring everything back. This is the full home pick up and delivery laundry service.</li>\n<li><strong>Pickup Only:</strong> we collect, you come and get it when it's ready.</li>\n<li><strong>Delivery Only:</strong> you drop off, we deliver it back to you.</li>\n<li><strong>Self Drop-off:</strong> bring it to our facility in Lomalinda Extension and collect it yourself. Always free.</li>\n</ul>\n<p>You then select your area and a pick up window that suits you. A small zone-based fee applies to pick up and delivery, and it's shown clearly before you pay.</p>\n<h2>Step 3: Pay the way you prefer</h2>\n<p>Pay securely online by card, bank transfer or USSD through Paystack, or choose cash on delivery.</p>\n<h2>Step 4: We pick up and log every item</h2>\n<p>Our rider arrives in your window and collects your laundry. Every item is logged at collection and matched again at delivery, so nothing goes missing between your door and ours.</p>\n<h2>Step 5: Track your laundry live</h2>\n<p>From the moment we collect, you can <a href=\"/track\">track your order</a> through every stage: picked up, in processing, ready, and out for delivery. No calls needed to ask \"is it ready yet?\".</p>\n<h2>Step 6: Delivered fresh to your door</h2>\n<p>Your clothes are washed according to their fabric, pressed, folded and delivered back to your home or office. If anything isn't right, we'll re-clean it free of charge.</p>\n<h2>Which areas of Enugu do you cover?</h2>\n<p>We currently offer home pick up and delivery across Lomalinda Extension, Independence Layout, GRA, New Haven, Trans-Ekulu, Uwani, Achara Layout, Asata, Ugwuaji, Gariki, Holy Ghost, Coal Camp, Abakpa Nike, Maryland and Centenary City. If your area isn't listed, send us a message on WhatsApp and we'll let you know what we can arrange.</p>\n<h2>How long does it take?</h2>\n<p>Regular laundry is typically ready in 2 to 5 days depending on the item, White Wash in about 2 days, and Express in as little as 24 hours. Read our guide to <a href=\"/blog/express-vs-regular-service-tiers\">Express vs Regular laundry</a> to choose the right tier.</p>\n<h2>Tips for a smooth pick up</h2>\n<ul>\n<li>Empty all pockets (pens and coins are the most common culprits for damaged loads).</li>\n<li>Point out stains when you book, and upload a photo if you can, so our team treats them before washing.</li>\n<li>Keep delicate or high-value items in a separate bag and mention them in your order notes.</li>\n</ul>\n<p>Ready to take laundry off your to-do list? <a href=\"/order\">Book your home pick up</a> in a few minutes, or read more about our <a href=\"/services/pickup-dropoff\">pick up and delivery service</a>.</p>",
    feature_image: null,
    category: 'Guides',
    seo_description: "How home pick up and delivery laundry works in Enugu: booking online, pick up options, areas covered, turnaround, fees and payment with Shalah Rex Laundry.",
    published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'post-5',
    title: "How to Choose a Laundry in Enugu: 7 Things to Check",
    slug: 'how-to-choose-a-laundry-in-enugu',
    excerpt: "Not every laundry treats your clothes the same way. Use these 7 checks to pick an Enugu laundry you can trust with everything from shirts to Agbada.",
    content: "<p>Handing over your clothes is an act of trust, especially when the bag includes a favourite suit, a white shirt for Monday, or an Agbada you wore to a wedding. Enugu has plenty of laundries and dry cleaners, but they don't all work the same way. Before you choose one, check these seven things.</p>\n<h2>1. Clear, published prices</h2>\n<p>You should know what you'll pay before you hand anything over. A good laundry publishes a price per item, not a vague estimate at the counter that changes on collection day. See how we do it on our <a href=\"/services\">laundry price list</a>.</p>\n<h2>2. Care by fabric, not one cycle for everything</h2>\n<p>Cotton, denim, silk, wool and native fabrics each need different water temperatures, detergents and heat. Ask whether items are sorted by fabric and colour before washing. If the answer is \"we wash everything together\", keep looking.</p>\n<h2>3. Honest turnaround times</h2>\n<p>\"Come back tomorrow\" that turns into a week is frustrating. Look for a laundry that tells you how long each service takes and offers an express option when you genuinely need something fast.</p>\n<h2>4. Home pick up and delivery</h2>\n<p>The best laundry is the one you don't have to drive to. A home pick up and delivery laundry saves you the trip, the traffic and the waiting. Check which areas they cover and whether the pick up fee is shown upfront.</p>\n<h2>5. A way to track your order</h2>\n<p>You shouldn't have to call three times to find out if your clothes are ready. Live order tracking means you always know whether your laundry has been picked up, is being processed, or is on its way back.</p>\n<h2>6. A quality guarantee and real support</h2>\n<p>Mistakes happen everywhere. What matters is what happens next. Ask whether they will re-clean an item that isn't right, and how you can raise a complaint about a damaged or missing item.</p>\n<h2>7. Payment that suits you</h2>\n<p>Card, bank transfer, USSD and cash on delivery should all be on the table, with secure online payment and a proper receipt for every order.</p>\n<h2>How Shalah Rex Laundry measures up</h2>\n<p>We built Shalah Rex Laundry to tick every box on this list: per-item prices across Regular, White Wash and Express tiers, fabric-by-fabric <a href=\"/services/clothing-care\">clothing care</a>, <a href=\"/services/pickup-dropoff\">home pick up and delivery</a> across Enugu, live order tracking, a free re-clean guarantee, and payment by card, transfer, USSD or cash on delivery. Visit us in Lomalinda Extension, or <a href=\"/order\">book a pick up online</a> and see the difference for yourself.</p>",
    feature_image: null,
    category: 'Guides',
    seo_description: "Choosing a laundry in Enugu? Check these 7 things first: fabric care, turnaround, clear pricing, pick up and delivery, tracking, guarantees and payment.",
    published_at: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

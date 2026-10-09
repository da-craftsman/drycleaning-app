import type { ClothingItem, ServiceTier } from '@/types/database'

const TIER_OPTIONS: { tier: ServiceTier; label: string }[] = [
  { tier: 'regular', label: 'Regular' },
  { tier: 'white', label: 'White Wash' },
  { tier: 'express', label: 'Express' },
]

function tierPrice(item: ClothingItem, tier: ServiceTier): number | null {
  return tier === 'regular' ? item.price_regular : tier === 'white' ? item.price_white : item.price_express
}

/** Standard turnaround per tier, used when an item has no time of its own set (items added from
 * the admin catalog don't get one) — so a missing time never blocks adding the item to a cart. */
const DEFAULT_TIER_TIME: Record<ServiceTier, string> = {
  regular: '3-4 days',
  white: '2 days',
  express: '24h',
}

function tierTime(item: ClothingItem, tier: ServiceTier): string {
  const time = tier === 'regular' ? item.time_regular : tier === 'white' ? item.time_white : item.time_express
  return time || DEFAULT_TIER_TIME[tier]
}

/** Tiers this item actually offers — a null price means that tier isn't sold for the item, not that it's free. */
function availableTiers(item: ClothingItem): { tier: ServiceTier; label: string }[] {
  return TIER_OPTIONS.filter((t) => tierPrice(item, t.tier) !== null)
}

/** Lowest price across whichever tiers the item offers — used for "from ₦X" display. Null if the item has no priced tier at all. */
function cheapestAvailablePrice(item: ClothingItem): number | null {
  const prices = availableTiers(item)
    .map((t) => tierPrice(item, t.tier))
    .filter((p): p is number => p !== null)
  return prices.length ? Math.min(...prices) : null
}

export { TIER_OPTIONS, tierPrice, tierTime, availableTiers, cheapestAvailablePrice }

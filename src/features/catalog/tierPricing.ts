import type { ClothingItem, ServiceTier } from '@/types/database'

const TIER_OPTIONS: { tier: ServiceTier; label: string }[] = [
  { tier: 'regular', label: 'Regular' },
  { tier: 'white', label: 'White Wash' },
  { tier: 'express', label: 'Express' },
]

function tierPrice(item: ClothingItem, tier: ServiceTier): number | null {
  return tier === 'regular' ? item.price_regular : tier === 'white' ? item.price_white : item.price_express
}

function tierTime(item: ClothingItem, tier: ServiceTier): string | null {
  return tier === 'regular' ? item.time_regular : tier === 'white' ? item.time_white : item.time_express
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

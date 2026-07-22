import { Minus, Plus, Trash2, Shirt } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatNaira } from '@/features/catalog/ItemCard'
import { availableTiers, tierPrice, tierTime, TIER_OPTIONS } from '@/features/catalog/tierPricing'
import { useCartStore } from '@/store/useCartStore'
import { useClothingItem } from '@/lib/queries/useClothingItems'
import type { CartItem } from '@/types/domain'
import type { ServiceTier } from '@/types/database'
import type { CartState } from '@/store/useCartStore'
import type { UseBoundStore, StoreApi } from 'zustand'

const tierLabels: Record<ServiceTier, string> = { regular: 'Regular', white: 'White Wash', express: 'Express' }

function CartLineItem({ line, useStore = useCartStore }: { line: CartItem; useStore?: UseBoundStore<StoreApi<CartState>> }) {
  const updateQuantity = useStore((s) => s.updateQuantity)
  const updateTier = useStore((s) => s.updateTier)
  const removeItem = useStore((s) => s.removeItem)
  const { data: fullItem } = useClothingItem(line.itemId)
  // Falls back to every tier while the item is still loading — the current tier (already valid,
  // set when this line was added) stays selectable either way.
  const selectableTiers = fullItem ? availableTiers(fullItem) : TIER_OPTIONS

  const handleTierChange = (tier: ServiceTier) => {
    if (!fullItem) return
    const unitPrice = tierPrice(fullItem, tier)
    const readyIn = tierTime(fullItem, tier)
    if (unitPrice === null || readyIn === null) return
    updateTier(line.cartItemId, tier, unitPrice, readyIn)
  }

  return (
    <div className="flex gap-3 border-b border-outline-variant/40 py-stack-sm last:border-0">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded bg-surface-container-low">
        {line.thumbnailUrl ? (
          <img src={line.thumbnailUrl} alt={line.name} className="h-full w-full rounded object-cover" />
        ) : (
          <Shirt className="h-6 w-6 text-outline" strokeWidth={1.5} />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-label-md font-bold normal-case text-on-surface">{line.name}</p>
          <button
            type="button"
            onClick={() => removeItem(line.cartItemId)}
            className="shrink-0 text-on-surface-variant transition-colors hover:text-error"
            aria-label={`Remove ${line.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <Select value={line.tier} onValueChange={handleTierChange}>
          <SelectTrigger className="h-8 w-32 text-label-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {selectableTiers.map(({ tier: t }) => (
              <SelectItem key={t} value={t}>
                {tierLabels[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateQuantity(line.cartItemId, line.quantity - 1)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-5 text-center text-label-md">{line.quantity}</span>
            <button
              type="button"
              onClick={() => updateQuantity(line.cartItemId, line.quantity + 1)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <p className="text-label-md font-bold text-on-surface">{formatNaira(line.unitPrice * line.quantity)}</p>
        </div>
      </div>
    </div>
  )
}

export { CartLineItem }

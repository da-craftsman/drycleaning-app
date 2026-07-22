import { useEffect, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { ResponsiveDialog } from '@/components/ui/sheet'
import { SelectionCard } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatNaira } from '@/features/catalog/ItemCard'
import { availableTiers, tierPrice, tierTime } from '@/features/catalog/tierPricing'
import { useCartStore } from '@/store/useCartStore'
import { useToast } from '@/hooks/use-toast'
import type { ClothingItem, ServiceTier } from '@/types/database'
import type { CartState } from '@/store/useCartStore'
import type { UseBoundStore, StoreApi } from 'zustand'

function ItemModal({
  item,
  categoryName,
  onClose,
  useStore = useCartStore,
}: {
  item: ClothingItem | null
  categoryName: string
  onClose: () => void
  /** Which cart store to add into — defaults to the customer-facing cart; pass useWalkInCartStore from the admin walk-in flow. */
  useStore?: UseBoundStore<StoreApi<CartState>>
}) {
  const [tier, setTier] = useState<ServiceTier>('regular')
  const [quantity, setQuantity] = useState(1)
  // Keeps the last item rendered while the panel animates closed, instead of the content vanishing instantly.
  const [displayItem, setDisplayItem] = useState(item)
  const addItem = useStore((s) => s.addItem)
  const { toast } = useToast()

  useEffect(() => {
    if (item) {
      setTier(availableTiers(item)[0]?.tier ?? 'regular')
      setQuantity(1)
      setDisplayItem(item)
    }
  }, [item])

  if (!displayItem) return null

  const activeItem = displayItem
  const tiers = availableTiers(activeItem)

  const handleAdd = () => {
    const unitPrice = tierPrice(activeItem, tier)
    const readyIn = tierTime(activeItem, tier)
    if (unitPrice === null || readyIn === null) return
    addItem({
      itemId: activeItem.id,
      name: activeItem.name,
      thumbnailUrl: activeItem.thumbnail_url,
      categoryName,
      tier,
      quantity,
      unitPrice,
      readyIn,
    })
    toast({
      title: 'Added to cart',
      description: `${quantity} × ${activeItem.name} (${tiers.find((t) => t.tier === tier)?.label})`,
      variant: 'success',
    })
    onClose()
  }

  return (
    <ResponsiveDialog
      open={Boolean(item)}
      onOpenChange={(open) => !open && onClose()}
      content={
        <div className="flex flex-col gap-stack-md">
          <div>
            <p className="text-label-sm uppercase text-on-surface-variant">{categoryName}</p>
            <p className="font-display text-headline-md text-on-surface">{activeItem.name}</p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {tiers.map(({ tier: t, label }) => (
              <SelectionCard key={t} selected={tier === t} onClick={() => setTier(t)}>
                <div className="flex items-center justify-between">
                  <p className="text-label-md font-bold normal-case text-on-surface">{label}</p>
                  {t === 'express' && <Badge variant="urgent">Express</Badge>}
                </div>
                <p className="mt-1 text-body-md font-semibold text-on-surface">{formatNaira(tierPrice(activeItem, t)!)}</p>
                <p className="text-label-sm text-on-surface-variant">Ready in {tierTime(activeItem, t)}</p>
              </SelectionCard>
            ))}
          </div>

          <div className="flex items-center justify-between rounded border border-outline-variant/40 p-stack-sm">
            <span className="text-label-md text-on-surface-variant">Quantity</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant text-on-surface transition-colors hover:bg-surface-container-low"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center text-body-lg font-semibold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant text-on-surface transition-colors hover:bg-surface-container-low"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <Button variant={tier === 'express' ? 'express' : 'primary'} size="lg" onClick={handleAdd} className="w-full">
            Add to Order ({formatNaira((tierPrice(activeItem, tier) ?? 0) * quantity)})
          </Button>
        </div>
      }
    />
  )
}

export { ItemModal }

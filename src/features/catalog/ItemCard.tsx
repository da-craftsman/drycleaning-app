import { Plus, Shirt } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cheapestAvailablePrice } from '@/features/catalog/tierPricing'
import type { ClothingItem } from '@/types/database'

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString('en-NG')}`
}

function ItemCard({ item, onSelect }: { item: ClothingItem; onSelect: (item: ClothingItem) => void }) {
  const fromPrice = cheapestAvailablePrice(item)
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onSelect(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(item)
        }
      }}
      className="flex h-full cursor-pointer flex-col overflow-hidden transition-shadow hover:shadow-soft-lift"
    >
      <div className="flex aspect-square shrink-0 items-center justify-center bg-surface-container-low p-3">
        {item.thumbnail_url ? (
          <img src={item.thumbnail_url} alt={item.name} className="h-full w-full object-contain" />
        ) : (
          <Shirt className="h-10 w-10 text-outline" strokeWidth={1.5} />
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between gap-2 p-stack-sm">
        <div>
          <p className="truncate text-label-md font-bold normal-case text-on-surface">{item.name}</p>
          {fromPrice !== null && <p className="text-label-sm text-on-surface-variant">from {formatNaira(fromPrice)}</p>}
        </div>
        <span className="flex items-center justify-center gap-1 rounded-full border border-primary py-1.5 text-label-sm font-bold text-primary">
          <Plus className="h-3.5 w-3.5" /> Add to Wash
        </span>
      </div>
    </Card>
  )
}

export { ItemCard, formatNaira }

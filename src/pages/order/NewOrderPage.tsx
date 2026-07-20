import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { SplitView } from '@/components/navigation/SplitView'
import { CategoryPills, ALL_CATEGORIES } from '@/features/catalog/CategoryPills'
import { ItemCard } from '@/features/catalog/ItemCard'
import { ItemModal } from '@/features/catalog/ItemModal'
import { CartSummary } from '@/features/cart/CartSummary'
import { FloatingCartButton } from '@/features/cart/FloatingCartButton'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useCategories } from '@/lib/queries/useCategories'
import { useClothingItems } from '@/lib/queries/useClothingItems'
import { paths } from '@/routes/paths'
import type { ClothingItem } from '@/types/database'

export default function NewOrderPage() {
  const navigate = useNavigate()
  const { data: categories } = useCategories()
  const { data: items, isLoading } = useClothingItems()
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES)
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null)

  const categoryName = categories?.find((c) => c.id === selectedItem?.category_id)?.name ?? ''

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return (items ?? []).filter((item) => {
      const matchesCategory = activeCategory === ALL_CATEGORIES || item.category_id === activeCategory
      const matchesQuery = !query || item.name.toLowerCase().includes(query)
      return matchesCategory && matchesQuery
    })
  }, [items, activeCategory, search])

  const handleProceed = () => navigate(paths.checkout('logistics'))

  return (
    <div className="mx-auto w-full min-w-0 max-w-shell px-margin-mobile py-stack-lg md:px-gutter">
      <div className="mb-stack-md">
        <h1 className="text-headline-lg-mobile font-display text-laundry-blue-deep md:text-headline-lg">What needs cleaning?</h1>
      </div>

      <SplitView
        main={
          <div className="flex flex-col gap-stack-md">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
              <Input
                placeholder="Search items (e.g., 'Shirt')"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <CategoryPills value={activeCategory} onChange={setActiveCategory} />

            {isLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-4/5 w-full" />
                ))}
              </div>
            ) : visibleItems.length === 0 ? (
              <p className="py-stack-lg text-center text-body-md text-on-surface-variant">No items match your search.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {visibleItems.map((item) => (
                  <ItemCard key={item.id} item={item} onSelect={setSelectedItem} />
                ))}
              </div>
            )}
          </div>
        }
        aside={
          <div className="hidden lg:block">
            <CartSummary onProceed={handleProceed} />
          </div>
        }
      />

      <ItemModal item={selectedItem} categoryName={categoryName} onClose={() => setSelectedItem(null)} />
      <FloatingCartButton onProceed={handleProceed} />
    </div>
  )
}

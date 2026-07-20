import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useCategories } from '@/lib/queries/useCategories'

const ALL = ''

function CategoryPills({ value, onChange }: { value: string; onChange: (categoryId: string) => void }) {
  const { data: categories, isLoading } = useCategories()

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex min-w-0 gap-2 overflow-x-auto scrollbar-none pb-1">
      <button
        type="button"
        onClick={() => onChange(ALL)}
        className={cn(
          'shrink-0 rounded-full px-4 py-2 text-label-md font-bold normal-case transition-colors',
          value === ALL ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface',
        )}
      >
        All Items
      </button>
      {categories?.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onChange(cat.id)}
          className={cn(
            'shrink-0 rounded-full px-4 py-2 text-label-md font-bold normal-case transition-colors',
            value === cat.id ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface',
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}

export { CategoryPills, ALL as ALL_CATEGORIES }

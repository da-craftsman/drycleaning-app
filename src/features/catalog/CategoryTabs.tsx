import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useCategories } from '@/lib/queries/useCategories'

function CategoryTabs({ value, onChange }: { value: string; onChange: (categoryId: string) => void }) {
  const { data: categories, isLoading } = useCategories()

  if (isLoading) {
    return (
      <div className="flex gap-2 border-b border-outline-variant/40 pb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 shrink-0" />
        ))}
      </div>
    )
  }

  return (
    <Tabs value={value} onValueChange={onChange} className="sticky top-16 z-20 -mx-margin-mobile bg-surface px-margin-mobile md:static md:mx-0 md:px-0">
      <TabsList>
        {categories?.map((cat) => (
          <TabsTrigger key={cat.id} value={cat.id}>
            {cat.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

export { CategoryTabs }

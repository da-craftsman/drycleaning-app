import { useState } from 'react'
import { Shirt } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { useCategories } from '@/lib/queries/useCategories'
import { useAllClothingItems, useUpdateClothingItem } from '@/lib/queries/useClothingItems'
import { uploadThumbnail } from '@/lib/data/storage'
import type { ClothingItem } from '@/types/database'

function ItemRow({ item }: { item: ClothingItem }) {
  const updateItem = useUpdateClothingItem()
  const { toast } = useToast()
  const [regular, setRegular] = useState(String(item.price_regular))
  const [white, setWhite] = useState(String(item.price_white))
  const [express, setExpress] = useState(String(item.price_express))

  const save = () => {
    updateItem.mutate(
      {
        itemId: item.id,
        patch: {
          price_regular: Number(regular) || 0,
          price_white: Number(white) || 0,
          price_express: Number(express) || 0,
        },
      },
      { onSuccess: () => toast({ title: 'Prices updated', variant: 'success' }) },
    )
  }

  const handleThumbnail = async (file: File) => {
    const url = await uploadThumbnail(file)
    updateItem.mutate({ itemId: item.id, patch: { thumbnail_url: url } })
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-stack-sm pt-stack-md sm:flex-row sm:items-center sm:gap-stack-md">
        <label className="flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded bg-surface-container-low">
          {item.thumbnail_url ? (
            <img src={item.thumbnail_url} alt={item.name} className="h-full w-full rounded object-cover" />
          ) : (
            <Shirt className="h-6 w-6 text-outline" strokeWidth={1.5} />
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleThumbnail(e.target.files[0])}
          />
        </label>

        <p className="min-w-32 text-label-md font-bold normal-case text-on-surface">{item.name}</p>

        <div className="grid flex-1 grid-cols-3 gap-2">
          <div>
            <Label htmlFor={`${item.id}-regular`}>Regular</Label>
            <Input id={`${item.id}-regular`} className="mt-1 h-9" value={regular} onChange={(e) => setRegular(e.target.value)} />
          </div>
          <div>
            <Label htmlFor={`${item.id}-white`}>White Wash</Label>
            <Input id={`${item.id}-white`} className="mt-1 h-9" value={white} onChange={(e) => setWhite(e.target.value)} />
          </div>
          <div>
            <Label htmlFor={`${item.id}-express`}>Express</Label>
            <Input id={`${item.id}-express`} className="mt-1 h-9" value={express} onChange={(e) => setExpress(e.target.value)} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={save} disabled={updateItem.isPending}>
            Save
          </Button>
          <Button
            size="sm"
            variant={item.is_active ? 'subtle' : 'express'}
            onClick={() => updateItem.mutate({ itemId: item.id, patch: { is_active: !item.is_active } })}
          >
            {item.is_active ? 'Visible' : 'Hidden'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function CatalogManager() {
  const { data: categories } = useCategories()
  const { data: items, isLoading } = useAllClothingItems()
  const [categoryId, setCategoryId] = useState('')

  const activeCategory = categoryId || categories?.[0]?.id || ''
  const visibleItems = items?.filter((i) => i.category_id === activeCategory)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-stack-md">
      <div className="flex gap-1 overflow-x-auto scrollbar-none border-b border-outline-variant/40 pb-2">
        {categories?.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategoryId(cat.id)}
            className={`shrink-0 rounded px-3 py-1.5 text-label-md ${
              activeCategory === cat.id ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {visibleItems?.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}

export { CatalogManager }

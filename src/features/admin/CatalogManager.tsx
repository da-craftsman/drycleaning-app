import { useState } from 'react'
import { Plus, Shirt, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useCategories, useCreateCategory } from '@/lib/queries/useCategories'
import { useAllClothingItems, useCreateClothingItem, useDeleteClothingItem, useUpdateClothingItem } from '@/lib/queries/useClothingItems'
import { uploadThumbnail } from '@/lib/data/storage'
import { getErrorMessage } from '@/lib/utils'
import type { ClothingItem } from '@/types/database'

const MAX_THUMBNAIL_BYTES = 1 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg']
const ACCEPTED_IMAGE_ACCEPT = '.png,.jpg,.jpeg,image/png,image/jpeg'

function isAcceptedImageType(file: File) {
  // Some browsers/OSes report a .jpg file's type as the nonstandard "image/jpg" instead of
  // "image/jpeg" — checked explicitly rather than trusting the file extension alone.
  return ACCEPTED_IMAGE_TYPES.includes(file.type)
}

function ItemRow({ item }: { item: ClothingItem }) {
  const updateItem = useUpdateClothingItem()
  const deleteItem = useDeleteClothingItem()
  const { toast } = useToast()
  const [regular, setRegular] = useState(item.price_regular === null ? '' : String(item.price_regular))
  const [white, setWhite] = useState(item.price_white === null ? '' : String(item.price_white))
  const [express, setExpress] = useState(item.price_express === null ? '' : String(item.price_express))

  const save = () => {
    updateItem.mutate(
      {
        itemId: item.id,
        patch: {
          price_regular: regular.trim() === '' ? null : Number(regular),
          price_white: white.trim() === '' ? null : Number(white),
          price_express: express.trim() === '' ? null : Number(express),
        },
      },
      {
        onSuccess: () => toast({ title: 'Prices updated', variant: 'success' }),
        onError: (err) => toast({ title: 'Failed to update prices', description: getErrorMessage(err, 'Please try again.'), variant: 'error' }),
      },
    )
  }

  const remove = () => {
    if (!window.confirm(`Permanently delete "${item.name}"? This can't be undone.`)) return
    deleteItem.mutate(item.id, {
      onSuccess: () => toast({ title: 'Item deleted', variant: 'success' }),
      onError: (err) => toast({ title: 'Failed to delete item', description: getErrorMessage(err, 'Please try again.'), variant: 'error' }),
    })
  }

  const handleThumbnail = async (file: File) => {
    if (!isAcceptedImageType(file)) {
      toast({ title: 'Unsupported image format', description: 'Please choose a PNG, JPG, or JPEG file.', variant: 'error' })
      return
    }
    if (file.size > MAX_THUMBNAIL_BYTES) {
      toast({ title: 'Image too large', description: 'Please choose a file under 1MB.', variant: 'error' })
      return
    }
    try {
      const url = await uploadThumbnail(file)
      await updateItem.mutateAsync({ itemId: item.id, patch: { thumbnail_url: url } })
      toast({ title: 'Thumbnail updated', variant: 'success' })
    } catch (err) {
      toast({ title: 'Failed to upload thumbnail', description: getErrorMessage(err, 'Please try again.'), variant: 'error' })
    }
  }

  const toggleVisibility = () => {
    // Captured as a primitive rather than read from `item` inside onSuccess — the mock backend
    // updates its record in place (Object.assign), so by the time onSuccess runs, `item.is_active`
    // (same object reference) would already reflect the *new* value and invert this message.
    const wasActive = item.is_active
    updateItem.mutate(
      { itemId: item.id, patch: { is_active: !wasActive } },
      {
        onSuccess: () => toast({ title: wasActive ? 'Item hidden' : 'Item made visible', variant: 'success' }),
        onError: (err) => toast({ title: 'Failed to update visibility', description: getErrorMessage(err, 'Please try again.'), variant: 'error' }),
      },
    )
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
            accept={ACCEPTED_IMAGE_ACCEPT}
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleThumbnail(e.target.files[0])}
          />
        </label>

        <p className="min-w-32 text-label-md font-bold normal-case text-on-surface">{item.name}</p>

        <div className="grid flex-1 grid-cols-3 gap-2">
          <div>
            <Label htmlFor={`${item.id}-regular`}>Regular</Label>
            <Input
              id={`${item.id}-regular`}
              className="mt-1 h-9"
              placeholder="Not offered"
              value={regular}
              onChange={(e) => setRegular(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`${item.id}-white`}>White Wash</Label>
            <Input
              id={`${item.id}-white`}
              className="mt-1 h-9"
              placeholder="Not offered"
              value={white}
              onChange={(e) => setWhite(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`${item.id}-express`}>Express</Label>
            <Input
              id={`${item.id}-express`}
              className="mt-1 h-9"
              placeholder="Not offered"
              value={express}
              onChange={(e) => setExpress(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={save} disabled={updateItem.isPending}>
            Save
          </Button>
          <Button size="sm" variant={item.is_active ? 'subtle' : 'express'} onClick={toggleVisibility}>
            {item.is_active ? 'Visible' : 'Hidden'}
          </Button>
          <button
            type="button"
            onClick={remove}
            disabled={deleteItem.isPending}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-error-container hover:text-on-error-container"
            aria-label={`Delete ${item.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

function AddCategoryDialog({ onCreated }: { onCreated: (categoryId: string) => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const createCategory = useCreateCategory()
  const { toast } = useToast()

  const handleSubmit = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    createCategory.mutate(trimmed, {
      onSuccess: (category) => {
        toast({ title: 'Category added', variant: 'success' })
        setName('')
        setOpen(false)
        onCreated(category.id)
      },
      onError: (err) => toast({ title: 'Failed to add category', description: getErrorMessage(err, 'Please try again.'), variant: 'error' }),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
        </DialogHeader>
        <div>
          <Label htmlFor="new-category-name">Category name</Label>
          <Input
            id="new-category-name"
            className="mt-1"
            placeholder="e.g. Children's Wear"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || createCategory.isPending}>
            Add Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AddItemDialog({ categoryId, categoryName }: { categoryId: string; categoryName: string }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [regular, setRegular] = useState('')
  const [white, setWhite] = useState('')
  const [express, setExpress] = useState('')
  const createItem = useCreateClothingItem()
  const { toast } = useToast()

  const reset = () => {
    setName('')
    setRegular('')
    setWhite('')
    setExpress('')
  }

  const handleSubmit = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    createItem.mutate(
      {
        categoryId,
        name: trimmed,
        priceRegular: regular.trim() === '' ? null : Number(regular),
        priceWhite: white.trim() === '' ? null : Number(white),
        priceExpress: express.trim() === '' ? null : Number(express),
      },
      {
        onSuccess: () => {
          toast({ title: 'Item added', variant: 'success' })
          reset()
          setOpen(false)
        },
        onError: (err) => toast({ title: 'Failed to add item', description: getErrorMessage(err, 'Please try again.'), variant: 'error' }),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4" /> Add Item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Item to {categoryName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-stack-md">
          <div>
            <Label htmlFor="new-item-name">Item name</Label>
            <Input id="new-item-name" className="mt-1" placeholder="e.g. Kids Shirt" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="new-item-regular">Regular</Label>
              <Input id="new-item-regular" className="mt-1 h-9" placeholder="Not offered" value={regular} onChange={(e) => setRegular(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="new-item-white">White Wash</Label>
              <Input id="new-item-white" className="mt-1 h-9" placeholder="Not offered" value={white} onChange={(e) => setWhite(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="new-item-express">Express</Label>
              <Input id="new-item-express" className="mt-1 h-9" placeholder="Not offered" value={express} onChange={(e) => setExpress(e.target.value)} />
            </div>
          </div>
          <p className="text-label-sm text-on-surface-variant">Leave a price blank if that tier isn't offered for this item. A thumbnail can be added after saving.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || createItem.isPending}>
            Add Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CatalogManager() {
  const { data: categories } = useCategories()
  const { data: items, isLoading } = useAllClothingItems()
  const [categoryId, setCategoryId] = useState('')

  const activeCategory = categoryId || categories?.[0]?.id || ''
  const activeCategoryName = categories?.find((c) => c.id === activeCategory)?.name ?? ''
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
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/40 pb-2">
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
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
        <AddCategoryDialog onCreated={setCategoryId} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-label-sm text-on-surface-variant">
          Tap an item's thumbnail to replace it. PNG, JPG, or JPEG only, max 1MB per image.
        </p>
        {activeCategory && <AddItemDialog categoryId={activeCategory} categoryName={activeCategoryName} />}
      </div>

      <div className="flex flex-col gap-2">
        {visibleItems?.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
        {visibleItems?.length === 0 && (
          <p className="py-stack-lg text-center text-body-md text-on-surface-variant">
            No items in this category yet. Use "Add Item" above to create one.
          </p>
        )}
      </div>
    </div>
  )
}

export { CatalogManager }

import { db, delay, persist } from '@/lib/data/mock/store'
import type { ClothingCategory } from '@/types/database'

export function getClothingCategoriesMock(): Promise<ClothingCategory[]> {
  return delay([...db.clothingCategories].sort((a, b) => a.display_order - b.display_order))
}

export function updateClothingCategoryMock(categoryId: string, name: string): Promise<ClothingCategory> {
  const category = db.clothingCategories.find((c) => c.id === categoryId)
  if (!category) throw new Error(`Category ${categoryId} not found`)
  category.name = name
  persist()
  return delay({ ...category })
}

export function createClothingCategoryMock(name: string): Promise<ClothingCategory> {
  const nextOrder = db.clothingCategories.reduce((max, c) => Math.max(max, c.display_order), 0) + 1
  const category: ClothingCategory = { id: `cat-${crypto.randomUUID()}`, name, display_order: nextOrder }
  db.clothingCategories.push(category)
  persist()
  return delay(category, 400)
}

import { categories } from '@/lib/data/mock/seed'
import { delay } from '@/lib/data/mock/store'
import type { ClothingCategory } from '@/types/database'

export function getClothingCategoriesMock(): Promise<ClothingCategory[]> {
  return delay([...categories].sort((a, b) => a.display_order - b.display_order))
}

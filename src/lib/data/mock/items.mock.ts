import { db, delay, persist } from '@/lib/data/mock/store'
import type { ClothingItem } from '@/types/database'

export function getClothingItemsMock(): Promise<ClothingItem[]> {
  return delay(db.clothingItems.filter((i) => i.is_active))
}

export function getAllClothingItemsMock(): Promise<ClothingItem[]> {
  return delay([...db.clothingItems])
}

export function getClothingItemMock(itemId: string): Promise<ClothingItem | null> {
  return delay(db.clothingItems.find((i) => i.id === itemId) ?? null)
}

export function updateClothingItemMock(
  itemId: string,
  patch: Partial<Pick<ClothingItem, 'price_regular' | 'price_white' | 'price_express' | 'is_active' | 'thumbnail_url'>>,
): Promise<ClothingItem> {
  const item = db.clothingItems.find((i) => i.id === itemId)
  if (!item) throw new Error(`Clothing item ${itemId} not found`)
  Object.assign(item, patch)
  persist()
  return delay(item)
}

export function deleteClothingItemMock(itemId: string): Promise<void> {
  if (db.orderItems.some((oi) => oi.item_id === itemId)) {
    throw new Error("This item has past orders attached to it and can't be deleted, hide it instead.")
  }
  db.clothingItems = db.clothingItems.filter((i) => i.id !== itemId)
  persist()
  return delay(undefined)
}

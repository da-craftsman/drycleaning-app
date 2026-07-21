import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import {
  deleteClothingItemMock,
  getAllClothingItemsMock,
  getClothingItemMock,
  getClothingItemsMock,
  updateClothingItemMock,
} from '@/lib/data/mock/items.mock'
import type { ClothingItem } from '@/types/database'

export async function getClothingItems(): Promise<ClothingItem[]> {
  if (!isSupabaseConfigured) return getClothingItemsMock()
  const { data, error } = await supabase!.from('clothing_items').select('*').eq('is_active', true)
  if (error) throw error
  return data
}

export async function getAllClothingItems(): Promise<ClothingItem[]> {
  if (!isSupabaseConfigured) return getAllClothingItemsMock()
  const { data, error } = await supabase!.from('clothing_items').select('*')
  if (error) throw error
  return data
}

export async function getClothingItem(itemId: string): Promise<ClothingItem | null> {
  if (!isSupabaseConfigured) return getClothingItemMock(itemId)
  const { data, error } = await supabase!.from('clothing_items').select('*').eq('id', itemId).maybeSingle()
  if (error) throw error
  return data
}

export async function updateClothingItem(
  itemId: string,
  patch: Partial<Pick<ClothingItem, 'price_regular' | 'price_white' | 'price_express' | 'is_active' | 'thumbnail_url'>>,
): Promise<ClothingItem> {
  if (!isSupabaseConfigured) return updateClothingItemMock(itemId, patch)
  const { data, error } = await supabase!.from('clothing_items').update(patch).eq('id', itemId).select().single()
  if (error) throw error
  return data
}

/**
 * Permanently removes a catalog item. Fails with a friendly message if it's ever been ordered —
 * `order_items.item_id` references it with no cascade, by design, so past orders keep an intact
 * record of what was actually bought. Use `updateClothingItem(id, { is_active: false })` instead
 * to remove an item from the customer-facing catalog without losing that order history.
 */
export async function deleteClothingItem(itemId: string): Promise<void> {
  if (!isSupabaseConfigured) return deleteClothingItemMock(itemId)
  const { error } = await supabase!.from('clothing_items').delete().eq('id', itemId)
  if (error) {
    if (error.code === '23503') {
      throw new Error('This item has past orders attached to it and can\'t be deleted — hide it instead.')
    }
    throw error
  }
}

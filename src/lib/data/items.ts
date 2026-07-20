import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import {
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

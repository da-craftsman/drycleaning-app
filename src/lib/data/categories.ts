import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { getClothingCategoriesMock } from '@/lib/data/mock/categories.mock'
import type { ClothingCategory } from '@/types/database'

export async function getClothingCategories(): Promise<ClothingCategory[]> {
  if (!isSupabaseConfigured) return getClothingCategoriesMock()
  const { data, error } = await supabase!.from('clothing_categories').select('*').order('display_order')
  if (error) throw error
  return data
}

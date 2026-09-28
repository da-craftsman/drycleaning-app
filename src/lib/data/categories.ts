import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { createClothingCategoryMock, getClothingCategoriesMock } from '@/lib/data/mock/categories.mock'
import type { ClothingCategory } from '@/types/database'

export async function getClothingCategories(): Promise<ClothingCategory[]> {
  if (!isSupabaseConfigured) return getClothingCategoriesMock()
  const { data, error } = await supabase!.from('clothing_categories').select('*').order('display_order')
  if (error) throw error
  return data
}

export async function createClothingCategory(name: string): Promise<ClothingCategory> {
  if (!isSupabaseConfigured) return createClothingCategoryMock(name)
  // New categories sort after every existing one by default — display_order can be adjusted later if needed.
  const { data: existing, error: maxError } = await supabase!
    .from('clothing_categories')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (maxError) throw maxError
  const { data, error } = await supabase!
    .from('clothing_categories')
    .insert({ name, display_order: (existing?.display_order ?? 0) + 1 })
    .select()
    .single()
  if (error) throw error
  return data
}

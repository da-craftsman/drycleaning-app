import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { getPromoBannerMock, updatePromoBannerMock } from '@/lib/data/mock/banner.mock'
import type { PromoBanner } from '@/types/database'

export async function getPromoBanner(): Promise<PromoBanner> {
  if (!isSupabaseConfigured) return getPromoBannerMock()
  const { data, error } = await supabase!.from('promo_banners').select('*').eq('id', 'banner-main').single()
  if (error) throw error
  return data
}

export async function updatePromoBanner(patch: Partial<Omit<PromoBanner, 'id'>>): Promise<PromoBanner> {
  if (!isSupabaseConfigured) return updatePromoBannerMock(patch)
  const { data, error } = await supabase!.from('promo_banners').update(patch).eq('id', 'banner-main').select().single()
  if (error) throw error
  return data
}

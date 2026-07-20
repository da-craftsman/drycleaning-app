import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { getProfileMock, updateProfileMock } from '@/lib/data/mock/profile.mock'
import type { Profile } from '@/types/database'

export async function getProfile(userId: string): Promise<Profile | null> {
  if (!isSupabaseConfigured) return getProfileMock(userId)
  const { data, error } = await supabase!.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw error
  return data
}

export async function updateProfile(userId: string, patch: Partial<Profile>): Promise<Profile> {
  if (!isSupabaseConfigured) return updateProfileMock(userId, patch)
  const { data, error } = await supabase!.from('profiles').update(patch).eq('id', userId).select().single()
  if (error) throw error
  return data
}

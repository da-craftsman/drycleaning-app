import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { uploadFileMock } from '@/lib/data/mock/storage.mock'

export async function uploadStainPhoto(file: File, userId: string): Promise<string> {
  if (!isSupabaseConfigured) return uploadFileMock(file)
  const path = `${userId}/${Date.now()}-${file.name}`
  const { error } = await supabase!.storage.from('stain_photos').upload(path, file)
  if (error) throw error
  return supabase!.storage.from('stain_photos').getPublicUrl(path).data.publicUrl
}

export async function uploadThumbnail(file: File): Promise<string> {
  if (!isSupabaseConfigured) return uploadFileMock(file)
  const path = `${Date.now()}-${file.name}`
  const { error } = await supabase!.storage.from('thumbnails').upload(path, file)
  if (error) throw error
  return supabase!.storage.from('thumbnails').getPublicUrl(path).data.publicUrl
}

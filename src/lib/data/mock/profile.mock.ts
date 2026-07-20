import { db, delay, persist } from '@/lib/data/mock/store'
import type { Profile } from '@/types/database'

export function getProfileMock(userId: string): Promise<Profile | null> {
  return delay(db.profiles.find((p) => p.id === userId) ?? null)
}

export function updateProfileMock(userId: string, patch: Partial<Profile>): Promise<Profile> {
  const profile = db.profiles.find((p) => p.id === userId)
  if (!profile) throw new Error(`Profile ${userId} not found`)
  Object.assign(profile, patch)
  persist()
  return delay(profile)
}

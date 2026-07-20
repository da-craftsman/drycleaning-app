import { db, delay, persist } from '@/lib/data/mock/store'
import type { PromoBanner } from '@/types/database'

export function getPromoBannerMock(): Promise<PromoBanner> {
  return delay({ ...db.promoBanner })
}

export function updatePromoBannerMock(patch: Partial<Omit<PromoBanner, 'id'>>): Promise<PromoBanner> {
  Object.assign(db.promoBanner, patch)
  persist()
  return delay({ ...db.promoBanner })
}

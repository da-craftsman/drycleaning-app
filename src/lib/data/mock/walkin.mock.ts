import { db, delay, persist } from '@/lib/data/mock/store'
import type { Profile } from '@/types/database'

export async function createWalkInCustomerMock(input: {
  fullName: string
  phone: string
  whatsapp: string | null
  email: string | null
}): Promise<Profile> {
  await delay(null, 400)

  const resolvedEmail = (input.email?.trim() || `walkin-${input.phone.replace(/\D/g, '')}-${crypto.randomUUID().slice(0, 8)}@no-email.shalahrexlaundry.internal`)
    .toLowerCase()

  if (db.profiles.some((p) => p.email.toLowerCase() === resolvedEmail)) {
    throw new Error('An account with this email already exists.')
  }

  const profile: Profile = {
    id: `user-${crypto.randomUUID()}`,
    role: 'customer',
    full_name: input.fullName,
    phone: input.phone,
    whatsapp: input.whatsapp,
    address: null,
    email: resolvedEmail,
    email_verified_at: new Date().toISOString(),
    permissions: [],
    notify_new_orders: true,
    notify_new_tickets: true,
    created_at: new Date().toISOString(),
  }
  db.profiles.push(profile)
  db.passwords[profile.id] = crypto.randomUUID()
  persist()
  return profile
}

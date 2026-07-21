import { db, delay, persist } from '@/lib/data/mock/store'
import type { AdminPermission, Profile, UserRole } from '@/types/database'

export function getAdminUsersMock(): Promise<Profile[]> {
  const staff = db.profiles
    .filter((p) => p.role === 'admin' || p.role === 'superadmin')
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
  return delay(staff)
}

export async function createSubAdminMock(input: {
  fullName: string
  email: string
  phone: string
  whatsapp: string | null
  password: string
  role: 'admin' | 'superadmin'
  permissions: AdminPermission[]
}): Promise<Profile> {
  await delay(null, 500)
  if (db.profiles.some((p) => p.email.toLowerCase() === input.email.trim().toLowerCase())) {
    throw new Error('An account with this email already exists.')
  }
  const profile: Profile = {
    id: `user-${crypto.randomUUID()}`,
    role: input.role,
    full_name: input.fullName,
    phone: input.phone,
    whatsapp: input.whatsapp,
    address: null,
    email: input.email.trim().toLowerCase(),
    email_verified_at: new Date().toISOString(),
    permissions: input.role === 'superadmin' ? [] : input.permissions,
    created_at: new Date().toISOString(),
  }
  db.profiles.push(profile)
  db.passwords[profile.id] = input.password
  persist()
  return profile
}

export async function updateAdminUserMock(
  userId: string,
  patch: { role?: UserRole; permissions?: AdminPermission[]; fullName?: string; phone?: string; whatsapp?: string | null },
): Promise<Profile> {
  await delay(null, 400)
  const profile = db.profiles.find((p) => p.id === userId)
  if (!profile) throw new Error('Admin user not found.')
  if (patch.role !== undefined) profile.role = patch.role
  if (patch.permissions !== undefined) profile.permissions = patch.permissions
  if (patch.fullName !== undefined) profile.full_name = patch.fullName
  if (patch.phone !== undefined) profile.phone = patch.phone
  if (patch.whatsapp !== undefined) profile.whatsapp = patch.whatsapp
  persist()
  return profile
}

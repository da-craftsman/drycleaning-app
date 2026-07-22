import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { createSubAdminMock, getAdminUsersMock, updateAdminUserMock } from '@/lib/data/mock/admins.mock'
import type { AdminPermission, Profile, UserRole } from '@/types/database'

export async function getAdminUsers(): Promise<Profile[]> {
  if (!isSupabaseConfigured) return getAdminUsersMock()
  const { data, error } = await supabase!
    .from('profiles')
    .select('*')
    .in('role', ['admin', 'superadmin'])
    .order('created_at')
  if (error) throw error
  return data
}

/**
 * Provisions a new staff account. Client-side `signUp` can only ever create the caller's own
 * profile (RLS `profiles_insert_own`), so this goes through the `create-admin-user` edge function,
 * which verifies the caller is a superadmin server-side before using the service role to create
 * the auth user + profile row.
 */
export async function createSubAdmin(input: {
  fullName: string
  email: string
  phone: string
  whatsapp: string | null
  password: string
  role: 'admin' | 'superadmin'
  permissions: AdminPermission[]
}): Promise<Profile> {
  if (!isSupabaseConfigured) return createSubAdminMock(input)
  const { data, error } = await supabase!.functions.invoke('create-admin-user', { body: input })
  if (error) throw error
  return data
}

export async function updateAdminUser(
  userId: string,
  patch: {
    role?: UserRole
    permissions?: AdminPermission[]
    fullName?: string
    phone?: string
    whatsapp?: string | null
    notifyNewOrders?: boolean
    notifyNewTickets?: boolean
  },
): Promise<Profile> {
  if (!isSupabaseConfigured) return updateAdminUserMock(userId, patch)
  const { data, error } = await supabase!
    .from('profiles')
    .update({
      ...(patch.role !== undefined && { role: patch.role }),
      ...(patch.permissions !== undefined && { permissions: patch.permissions }),
      ...(patch.fullName !== undefined && { full_name: patch.fullName }),
      ...(patch.phone !== undefined && { phone: patch.phone }),
      ...(patch.whatsapp !== undefined && { whatsapp: patch.whatsapp }),
      ...(patch.notifyNewOrders !== undefined && { notify_new_orders: patch.notifyNewOrders }),
      ...(patch.notifyNewTickets !== undefined && { notify_new_tickets: patch.notifyNewTickets }),
    })
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

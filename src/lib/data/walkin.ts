import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { createWalkInCustomerMock } from '@/lib/data/mock/walkin.mock'
import type { Profile } from '@/types/database'

/**
 * Provisions a lightweight customer account for a walk-in customer who doesn't already have one.
 * Client-side `signUp` can only ever create the caller's own profile (RLS `profiles_insert_own`),
 * so this goes through the `create-walkin-customer` edge function, which verifies the caller has
 * the 'walkin' permission (or is a superadmin) server-side before using the service role to create
 * the auth user + profile row. Email is optional — the function falls back to a unique placeholder
 * so account creation never blocks on a walk-in customer not having given one at the counter.
 */
export async function createWalkInCustomer(input: {
  fullName: string
  phone: string
  whatsapp: string | null
  email: string | null
}): Promise<Profile> {
  if (!isSupabaseConfigured) return createWalkInCustomerMock(input)
  const { data, error } = await supabase!.functions.invoke('create-walkin-customer', { body: input })
  if (error) throw error
  return data
}

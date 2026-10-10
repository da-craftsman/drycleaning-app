// Provisions a lightweight customer account for a walk-in customer (dropped laundry off in person)
// who doesn't already have one, so their order can satisfy orders.user_id's NOT NULL FK to profiles.
//
// Client-side signUp() can only ever insert the caller's own profile row (RLS `profiles_insert_own`),
// so creating another user's account has to happen here, with the service role — same pattern as
// create-admin-user. The caller's identity/permission is re-derived from their own JWT and checked
// server-side; the client-sent fields are only ever used for the *new* customer account.
//
// Deploy via the Supabase Dashboard -> Edge Functions -> Deploy a new function (paste this file), or
// `supabase functions deploy create-walkin-customer` with the CLI. Uses the same secrets as
// create-admin-user (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY).

import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Missing Authorization header' }, 401)

  const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })

  const { data: userData, error: userError } = await callerClient.auth.getUser()
  if (userError || !userData.user) return json({ error: 'Not authenticated' }, 401)

  const { data: callerProfile, error: callerProfileError } = await callerClient
    .from('profiles')
    .select('role, permissions')
    .eq('id', userData.user.id)
    .maybeSingle()

  if (callerProfileError || !callerProfile) return json({ error: 'Profile not found' }, 404)
  const isSuperAdmin = callerProfile.role === 'superadmin'
  const isAdminWithWalkIn = callerProfile.role === 'admin' && (callerProfile.permissions ?? []).includes('walkin')
  if (!isSuperAdmin && !isAdminWithWalkIn) return json({ error: 'Not permitted to create walk-in customers' }, 403)

  const body = await req.json().catch(() => null)
  if (!body) return json({ error: 'Invalid request body' }, 400)

  const { fullName, phone, whatsapp, email } = body as {
    fullName?: string
    phone?: string
    whatsapp?: string | null
    email?: string | null
  }

  if (!fullName || !phone) return json({ error: 'fullName and phone are required' }, 400)

  // Walk-in customers often haven't given an email at the counter — fall back to a unique,
  // non-deliverable placeholder so account creation never blocks on it.
  const resolvedEmail = (email?.trim() || `walkin-${phone.replace(/\D/g, '')}-${crypto.randomUUID().slice(0, 8)}@no-email.shalahrexlaundry.internal`)
    .toLowerCase()
  const password = crypto.randomUUID()

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email: resolvedEmail,
    password,
    phone,
    email_confirm: true,
  })
  if (createError || !created.user) return json({ error: createError?.message ?? 'Failed to create account' }, 500)

  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .insert({
      id: created.user.id,
      role: 'customer',
      full_name: fullName,
      phone,
      whatsapp: whatsapp || null,
      email: resolvedEmail,
      email_verified_at: new Date().toISOString(),
      permissions: [],
    })
    .select()
    .single()

  if (profileError) {
    await adminClient.auth.admin.deleteUser(created.user.id)
    return json({ error: profileError.message }, 500)
  }

  return json(profile)
})

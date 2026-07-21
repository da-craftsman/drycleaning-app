// Provisions a new staff (admin or superadmin) account on behalf of a superadmin.
//
// Client-side signUp() can only ever insert the caller's own profile row (RLS
// `profiles_insert_own`), so creating another user's account has to happen here, with the
// service role. The caller's identity is re-derived from their own JWT and checked against
// `profiles.role` server-side — the client-sent `role`/`permissions` in the request body are
// only used for the *new* account being created, never trusted to authorize the caller.
//
// Deploy via the Supabase Dashboard -> Edge Functions -> Deploy a new function (paste this file), or
// `supabase functions deploy create-admin-user` with the CLI. Uses the same secrets as
// send-welcome-email (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY).

import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const ALLOWED_PERMISSIONS = ['orders', 'customers', 'catalog', 'zones', 'banner', 'tickets', 'blog']

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
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle()

  if (callerProfileError || !callerProfile) return json({ error: 'Profile not found' }, 404)
  if (callerProfile.role !== 'superadmin') return json({ error: 'Only superadmins can create admin accounts' }, 403)

  const body = await req.json().catch(() => null)
  if (!body) return json({ error: 'Invalid request body' }, 400)

  const { fullName, email, phone, whatsapp, password, role, permissions } = body as {
    fullName?: string
    email?: string
    phone?: string
    whatsapp?: string | null
    password?: string
    role?: string
    permissions?: string[]
  }

  if (!fullName || !email || !phone || !password) return json({ error: 'fullName, email, phone, and password are required' }, 400)
  if (role !== 'admin' && role !== 'superadmin') return json({ error: 'role must be "admin" or "superadmin"' }, 400)
  if (password.length < 8) return json({ error: 'Password must be at least 8 characters' }, 400)

  const cleanPermissions = role === 'superadmin' ? [] : (permissions ?? []).filter((p) => ALLOWED_PERMISSIONS.includes(p))

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password,
    phone,
    email_confirm: true,
  })
  if (createError || !created.user) return json({ error: createError?.message ?? 'Failed to create account' }, 500)

  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .insert({
      id: created.user.id,
      role,
      full_name: fullName,
      phone,
      whatsapp: whatsapp || null,
      email: email.trim().toLowerCase(),
      email_verified_at: new Date().toISOString(),
      permissions: cleanPermissions,
    })
    .select()
    .single()

  if (profileError) {
    await adminClient.auth.admin.deleteUser(created.user.id)
    return json({ error: profileError.message }, 500)
  }

  return json(profile)
})

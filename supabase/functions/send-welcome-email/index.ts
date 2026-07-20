// Emails a new customer a brief welcome right after they create an account — highlights the
// service tiers and logistics options so they know what's on offer before they place their
// first order.
//
// Called from the client (src/lib/data/auth.ts -> sendWelcomeEmail) once, right after signUp()
// resolves — this is best-effort (a failed send doesn't block account creation). Unlike
// send-order-confirmation, this reads the caller's own identity from their JWT rather than
// trusting an id in the request body, since there's no order row to scope the request to.
//
// Deploy via the Supabase Dashboard -> Edge Functions -> Deploy a new function (paste this file), or
// `supabase functions deploy send-welcome-email` with the CLI. Uses the same secrets as
// send-order-confirmation (RESEND_API_KEY, SITE_URL) — see that function's header comment.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SITE_URL = Deno.env.get('SITE_URL') ?? 'http://localhost:5173'
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
  if (!RESEND_API_KEY) return json({ error: 'RESEND_API_KEY is not configured' }, 500)

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Missing Authorization header' }, 401)

  const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })

  const { data: userData, error: userError } = await callerClient.auth.getUser()
  if (userError || !userData.user) return json({ error: 'Not authenticated' }, 401)

  const { data: profile, error: profileError } = await callerClient
    .from('profiles')
    .select('email, full_name, welcome_email_sent_at')
    .eq('id', userData.user.id)
    .maybeSingle()

  if (profileError || !profile) return json({ error: 'Profile not found' }, 404)
  if (profile.welcome_email_sent_at) return json({ sent: true, alreadySent: true })

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;color:#111827;">
      <h2 style="color:#0b3d91;">Welcome to Shalah Rex Laundry</h2>
      <p>Hi ${profile.full_name || 'there'},</p>
      <p>Your account is ready. Here's a quick look at what we offer:</p>

      <p style="font-weight:700;margin-bottom:4px;">Cleaning services</p>
      <ul style="margin:0 0 16px;padding-left:20px;color:#374151;">
        <li><strong>Regular wash</strong> — everyday laundry, cleaned and pressed.</li>
        <li><strong>White wash</strong> — extra care for whites and delicates.</li>
        <li><strong>Express</strong> — same-day turnaround when you're in a hurry.</li>
      </ul>

      <p style="font-weight:700;margin-bottom:4px;">Getting your items to us</p>
      <ul style="margin:0 0 16px;padding-left:20px;color:#374151;">
        <li><strong>Self drop-off & pickup</strong> — free, bring it in and collect it yourself.</li>
        <li><strong>Pickup only</strong> — we collect from you, you come get it.</li>
        <li><strong>Delivery only</strong> — you drop it off, we bring it back.</li>
        <li><strong>Pickup & delivery</strong> — we handle both legs.</li>
      </ul>

      <p style="margin:24px 0;">
        <a href="${SITE_URL}/order" style="background:#0b3d91;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
          Start Your First Order
        </a>
      </p>
      <p style="color:#6b7280;font-size:13px;">
        Questions? Just reply to this email or reach us on WhatsApp.<br/>
        Shalah Rex Laundry
      </p>
    </div>`

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: '"Shalah Rex Laundry" <noreply@shalahrexlaundry.ng>',
      to: profile.email,
      subject: 'Welcome to Shalah Rex Laundry',
      html,
    }),
  })

  if (!emailRes.ok) {
    const errBody = await emailRes.text()
    return json({ error: `Failed to send welcome email: ${errBody}`, sent: false }, 502)
  }

  // Service role bypasses RLS for the same reason send-order-confirmation needs it: customers
  // can update their own profile, but doing this write from the callerClient would just be
  // redundant with what the service role already has to do reliably.
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  await adminClient.from('profiles').update({ welcome_email_sent_at: new Date().toISOString() }).eq('id', userData.user.id)

  return json({ sent: true })
})

// Emails the customer when their order is marked 'ready' — the message differs depending on
// whether they're picking the items up themselves (self_dropoff / pickup_only) or having them
// delivered (delivery_only / pickup_and_delivery).
//
// Called from the client (src/lib/data/orders.ts -> updateOrderStatus, fired automatically the
// moment a status change lands on 'ready') — best-effort, same as send-order-confirmation. Uses
// the admin's own JWT; RLS on `orders` already allows admins to read any order (see
// send-order-confirmation's header comment for the same note on the customer side).
//
// Deploy via the Supabase Dashboard -> Edge Functions -> Deploy a new function (paste this file), or
// `supabase functions deploy send-order-ready` with the CLI. Uses the same secrets as
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

// Whether the order's own logistics leg back to the customer is self-service (they come get it)
// or handled by us (we bring it to them).
const isCustomerPickup: Record<string, boolean> = {
  self_dropoff: true,
  pickup_only: true,
  delivery_only: false,
  pickup_and_delivery: false,
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  if (!RESEND_API_KEY) return json({ error: 'RESEND_API_KEY is not configured' }, 500)

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Missing Authorization header' }, 401)

  let orderId: string
  try {
    const body = await req.json()
    orderId = body.orderId
    if (!orderId) throw new Error('missing orderId')
  } catch {
    return json({ error: 'Request body must include orderId' }, 400)
  }

  const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })

  const { data: order, error: orderError } = await callerClient.from('orders').select('*').eq('id', orderId).maybeSingle()
  if (orderError || !order) return json({ error: 'Order not found' }, 404)
  if (order.ready_email_sent_at) return json({ sent: true, alreadySent: true })

  const { data: profile, error: profileError } = await callerClient
    .from('profiles')
    .select('email, full_name')
    .eq('id', order.user_id)
    .maybeSingle()

  if (profileError || !profile) return json({ error: 'Customer profile not found' }, 404)

  const pickup = isCustomerPickup[order.logistics_type] ?? true
  const actionLine = pickup
    ? "Your order is ready for pickup. Come by whenever it's convenient — no need to wait around."
    : "Your order is ready and out for delivery. We'll be at your address shortly."
  const trackingUrl = `${SITE_URL}/account/orders/${order.id}`

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;color:#111827;">
      <h2 style="color:#0b3d91;">Your order is ready</h2>
      <p>Hi ${profile.full_name || 'there'},</p>
      <p><strong>${order.display_id}</strong> is done — every item cleaned and checked.</p>
      <p style="color:#374151;">${actionLine}</p>
      <p style="margin:24px 0;">
        <a href="${trackingUrl}" style="background:#0b3d91;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
          View Order
        </a>
      </p>
      <p style="color:#6b7280;font-size:13px;">
        Questions about this order? Just reply to this email or reach us on WhatsApp.<br/>
        Shalah Rex Laundry
      </p>
    </div>`

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: '"Shalah Rex Laundry" <noreply@shalahrexlaundry.ng>',
      to: profile.email,
      subject: `Order Ready — ${order.display_id}`,
      html,
    }),
  })

  if (!emailRes.ok) {
    const errBody = await emailRes.text()
    return json({ error: `Failed to send order ready email: ${errBody}`, sent: false }, 502)
  }

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  await adminClient.from('orders').update({ ready_email_sent_at: new Date().toISOString() }).eq('id', orderId)

  return json({ sent: true })
})

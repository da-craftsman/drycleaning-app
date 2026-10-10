// Emails every admin who still has new-order notifications enabled when a customer places a new
// order online — includes a link straight to the order plus a quick item/total summary, so an admin
// can see what came in without opening the dashboard first. Mirrors send-ticket-notification.
//
// Called from the client (src/lib/data/orders.ts -> sendNewOrderNotificationEmail) once, right after
// checkout completes — best-effort, same as the other email functions in this project (a failed send
// doesn't block the customer's checkout). Not called for walk-in orders (staff already know, since
// they're the ones entering it at the counter) — only for online customer checkout.
//
// Deploy via the Supabase Dashboard -> Edge Functions -> Deploy a new function (paste this file), or
// `supabase functions deploy send-new-order-notification` with the CLI. Uses the same secrets as
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

function formatNaira(amount: number) {
  return `₦${Number(amount).toLocaleString('en-NG')}`
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

  // Scoped to the caller's own JWT — RLS means this only returns a row if the order actually
  // belongs to the person making the request.
  const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })

  const { data: order, error: orderError } = await callerClient
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .maybeSingle()
  if (orderError || !order) return json({ error: 'Order not found' }, 404)

  const { data: profile, error: profileError } = await callerClient
    .from('profiles')
    .select('full_name, phone')
    .eq('id', order.user_id)
    .maybeSingle()
  if (profileError || !profile) return json({ error: 'Customer profile not found' }, 404)

  // Customers can't read other profiles under RLS, so finding every admin needs the service role.
  // Only staff who still have new-order notifications enabled (notify_new_orders) get emailed here —
  // same routing a superadmin controls per-account from /admin/notifications.
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const { data: admins, error: adminsError } = await adminClient
    .from('profiles')
    .select('email')
    .in('role', ['admin', 'superadmin'])
    .eq('notify_new_orders', true)
  if (adminsError) return json({ error: adminsError.message }, 500)
  if (!admins || admins.length === 0) return json({ sent: false, reason: 'No admin accounts to notify' })

  // Send at most once per order: claim it before sending, so repeated calls (a script looping on this
  // endpoint, or the browser and paystack-webhook racing) can't email every admin again. The claim
  // is released below if the send fails, so a later retry can still go through.
  const { data: claimed, error: claimError } = await adminClient
    .from('orders')
    .update({ admin_email_sent_at: new Date().toISOString() })
    .eq('id', order.id)
    .is('admin_email_sent_at', null)
    .select('id')
  if (claimError) return json({ error: claimError.message }, 500)
  if (!claimed || claimed.length === 0) return json({ sent: true, alreadySent: true })

  const orderUrl = `${SITE_URL}/admin/orders/${order.id}`

  const itemsRows = (order.order_items as { quantity: number; item_name: string; service_tier: string; line_total: number }[])
    .map(
      (line) => `
        <tr>
          <td style="padding:6px 0;color:#374151;">${line.quantity} × ${line.item_name} (${line.service_tier})</td>
          <td style="padding:6px 0;text-align:right;color:#111827;font-weight:600;">${formatNaira(line.line_total)}</td>
        </tr>`,
    )
    .join('')

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;color:#111827;">
      <h2 style="color:#0b3d91;">New order placed</h2>
      <p><strong>${profile.full_name || 'A customer'}</strong> (${profile.phone}) just placed a new order:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        ${itemsRows}
        <tr><td style="padding:8px 0;border-top:1px solid #e5e7eb;font-weight:700;">Total</td><td style="padding:8px 0;border-top:1px solid #e5e7eb;text-align:right;font-weight:700;">${formatNaira(order.total)}</td></tr>
      </table>
      <p style="margin:24px 0;">
        <a href="${orderUrl}" style="background:#0b3d91;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
          View Order
        </a>
      </p>
      <p style="color:#6b7280;font-size:13px;">Shalah Rex Laundry admin notifications</p>
    </div>`

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: '"Shalah Rex Laundry" <noreply@shalahrexlaundry.ng>',
      to: admins.map((a) => a.email),
      subject: `New Order — ${order.display_id}`,
      html,
    }),
  })

  if (!emailRes.ok) {
    await adminClient.from('orders').update({ admin_email_sent_at: null }).eq('id', order.id)
    const errBody = await emailRes.text()
    return json({ error: `Failed to send new-order notification email: ${errBody}`, sent: false }, 502)
  }

  return json({ sent: true })
})

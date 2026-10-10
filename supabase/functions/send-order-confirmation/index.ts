// Emails the customer an order confirmation with item details and a link to view/download the
// receipt in their account, right after an order is confirmed (COD placed, or Paystack verified).
//
// Called from the client (src/lib/data/orders.ts -> sendOrderConfirmationEmail) once, right when
// the confirmation page is reached — this is best-effort (a failed send doesn't block checkout),
// so it uses the caller's own RLS-scoped session to read the order rather than needing anything
// more privileged for that part.
//
// Deploy via the Supabase Dashboard -> Edge Functions -> Deploy a new function (paste this file), or
// `supabase functions deploy send-order-confirmation` with the CLI. Requires two secrets set on the
// project (Project Settings -> Edge Functions -> Secrets, or `supabase secrets set`):
//   RESEND_API_KEY   - same Resend API key used for Supabase's custom SMTP
//   SITE_URL          - e.g. https://shalahrexlaundry.ng (no trailing slash) — used to build the
//                        receipt link. Falls back to http://localhost:5173 if unset, for local dev.
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are already available automatically in every Edge
// Function's environment — no need to set those yourself.

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

const logisticsLabels: Record<string, string> = {
  self_dropoff: 'Self drop-off & pickup',
  pickup_only: 'Pickup only',
  delivery_only: 'Delivery only',
  pickup_and_delivery: 'Pickup & delivery',
}

const paymentMethodLabels: Record<string, string> = {
  paystack: 'Paid with Paystack',
  cash_on_delivery: 'Cash on delivery',
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
  // belongs to the person making the request (or they're an admin).
  const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })

  const { data: order, error: orderError } = await callerClient
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .maybeSingle()

  if (orderError || !order) return json({ error: 'Order not found' }, 404)
  if (order.confirmation_email_sent_at) return json({ sent: true, alreadySent: true })

  const { data: profile, error: profileError } = await callerClient
    .from('profiles')
    .select('email, full_name')
    .eq('id', order.user_id)
    .maybeSingle()

  if (profileError || !profile) return json({ error: 'Customer profile not found' }, 404)

  const receiptUrl = `${SITE_URL}/account/orders/${order.id}`

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
      <h2 style="color:#0b3d91;">Order confirmed</h2>
      <p>Hi ${profile.full_name || 'there'},</p>
      <p>Thanks for your order! Here's a summary of <strong>${order.display_id}</strong>:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        ${itemsRows}
        <tr><td style="padding:6px 0;border-top:1px solid #e5e7eb;color:#374151;">Delivery fee</td><td style="padding:6px 0;border-top:1px solid #e5e7eb;text-align:right;color:#111827;font-weight:600;">${formatNaira(order.delivery_fee)}</td></tr>
        <tr><td style="padding:8px 0;font-weight:700;">Total</td><td style="padding:8px 0;text-align:right;font-weight:700;">${formatNaira(order.total)}</td></tr>
      </table>
      <p style="color:#374151;">
        <strong>Logistics:</strong> ${logisticsLabels[order.logistics_type] ?? order.logistics_type}<br/>
        <strong>Payment:</strong> ${paymentMethodLabels[order.payment_method] ?? order.payment_method}<br/>
        <strong>Delivery address:</strong> ${order.address}
      </p>
      <p style="margin:24px 0;">
        <a href="${receiptUrl}" style="background:#0b3d91;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
          View Receipt &amp; Track Order
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
      subject: `Order Confirmed — ${order.display_id}`,
      html,
    }),
  })

  if (!emailRes.ok) {
    const errBody = await emailRes.text()
    return json({ error: `Failed to send confirmation email: ${errBody}`, sent: false }, 502)
  }

  // Service role bypasses RLS — customers can't self-update paid orders (payment_status isn't
  // 'pending' anymore by then), so marking this requires the elevated client.
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  await adminClient.from('orders').update({ confirmation_email_sent_at: new Date().toISOString() }).eq('id', orderId)

  return json({ sent: true })
})

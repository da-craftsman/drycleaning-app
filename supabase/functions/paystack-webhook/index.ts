// Paystack webhook — a safety net for payment confirmation.
//
// Normally an order is marked paid by verify-payment, which the customer's browser calls right after
// Paystack's popup reports success. If the customer pays and then closes the tab or loses connection
// before that call runs, Paystack has their money but the order would stay "pending". Paystack also
// sends a signed `charge.success` event here for every successful payment, so this function catches
// those orders.
//
// To avoid double emails, it waits WAIT_BEFORE_ACTING_MS in the background before doing anything, so
// the normal browser flow (verify-payment + confirmation emails) gets to finish first. Then:
//   - order still pending  -> mark it paid (same amount/currency checks as verify-payment), then send
//                             the customer confirmation and the admin new-order email.
//   - already paid, but no confirmation email recorded -> send just the customer confirmation
//     (the tab closed between verification and the emails).
//   - already paid and emailed -> nothing to do.
//
// Deploy: `supabase functions deploy paystack-webhook --no-verify-jwt`, or via the Dashboard with
// "Enforce JWT verification" turned OFF — Paystack doesn't send a Supabase JWT, so with JWT
// verification on, every event is rejected before this code runs. Requests are authenticated by
// Paystack's x-paystack-signature header instead (HMAC-SHA512 of the raw body with the secret key).
//
// Then set the webhook URL in Paystack (Settings -> API Keys & Webhooks -> Live Webhook URL):
//   https://<your-project-ref>.supabase.co/functions/v1/paystack-webhook
//
// Uses the PAYSTACK_SECRET_KEY secret already set for verify-payment — no new secrets needed.

import { createClient } from 'jsr:@supabase/supabase-js@2'

declare const EdgeRuntime: { waitUntil(promise: Promise<unknown>): void }

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const WAIT_BEFORE_ACTING_MS = 30_000

async function hmacSha512Hex(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-512' }, false, ['sign'])
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
  return [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

function orderIdFromMetadata(metadata: unknown): string | null {
  // Paystack usually returns metadata as the object we sent, but can return it as a JSON string.
  let meta = metadata
  if (typeof meta === 'string') {
    try {
      meta = JSON.parse(meta)
    } catch {
      return null
    }
  }
  if (meta && typeof meta === 'object' && 'order_id' in meta && typeof meta.order_id === 'string') return meta.order_id
  return null
}

interface ChargeData {
  reference: string
  status: string
  amount: number
  currency: string
  metadata: unknown
}

async function handleChargeSuccess(tx: ChargeData) {
  await new Promise((resolve) => setTimeout(resolve, WAIT_BEFORE_ACTING_MS))

  const orderId = orderIdFromMetadata(tx.metadata)
  if (!orderId) {
    console.error(`paystack-webhook: no order_id in metadata for reference ${tx.reference}`)
    return
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const { data: order, error } = await admin
    .from('orders')
    .select('id, display_id, total, payment_status, confirmation_email_sent_at')
    .eq('id', orderId)
    .maybeSingle()

  if (error || !order) {
    console.error(`paystack-webhook: order ${orderId} not found for reference ${tx.reference}`, error)
    return
  }

  if (order.payment_status === 'paid') {
    if (!order.confirmation_email_sent_at) {
      const { error: emailError } = await admin.functions.invoke('send-order-confirmation', { body: { orderId } })
      if (emailError) console.error(`paystack-webhook: confirmation email failed for ${order.display_id}`, emailError)
    }
    return
  }

  const expectedKobo = Math.round(Number(order.total) * 100)
  if (tx.status !== 'success' || tx.currency !== 'NGN' || tx.amount !== expectedKobo) {
    console.error(
      `paystack-webhook: mismatch for ${order.display_id} (reference ${tx.reference}) — ` +
        `status ${tx.status}, ${tx.currency} ${tx.amount} kobo, expected NGN ${expectedKobo} kobo. Left pending for manual review.`,
    )
    return
  }

  // .eq('payment_status', 'pending') makes this a no-op if verify-payment flipped it in the meantime.
  const { data: updated, error: updateError } = await admin
    .from('orders')
    .update({ payment_status: 'paid', paystack_reference: tx.reference, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .eq('payment_status', 'pending')
    .select('id')

  if (updateError) {
    const reason = updateError.code === '23505' ? 'reference already used on another order' : updateError.message
    console.error(`paystack-webhook: failed to mark ${order.display_id} paid (${reason})`)
    return
  }
  if (!updated || updated.length === 0) return

  console.log(`paystack-webhook: marked ${order.display_id} paid via webhook (reference ${tx.reference})`)

  const results = await Promise.allSettled([
    admin.functions.invoke('send-order-confirmation', { body: { orderId } }),
    admin.functions.invoke('send-new-order-notification', { body: { orderId } }),
  ])
  results.forEach((r) => {
    if (r.status === 'rejected' || r.value.error) console.error(`paystack-webhook: follow-up email failed for ${order.display_id}`, r)
  })
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  if (!PAYSTACK_SECRET_KEY) return new Response('PAYSTACK_SECRET_KEY is not configured', { status: 500 })

  const rawBody = await req.text()
  const signature = req.headers.get('x-paystack-signature') ?? ''
  const expected = await hmacSha512Hex(PAYSTACK_SECRET_KEY, rawBody)
  if (!timingSafeEqual(signature, expected)) return new Response('Invalid signature', { status: 401 })

  let event: { event?: string; data?: ChargeData }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  if (event.event === 'charge.success' && event.data) {
    // Acknowledge immediately (Paystack retries anything that isn't a quick 200) and do the real work in the background.
    EdgeRuntime.waitUntil(
      handleChargeSuccess(event.data).catch((err) => console.error('paystack-webhook: unexpected error', err)),
    )
  }

  return new Response('ok', { status: 200 })
})

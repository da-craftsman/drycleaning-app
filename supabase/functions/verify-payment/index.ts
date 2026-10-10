// Verifies a Paystack transaction server-side before an order is ever marked "paid".
//
// Called from the client (src/lib/data/orders.ts -> verifyPaystackPayment) right after Paystack's
// inline popup reports success. The client-side "success" callback is not trustworthy on its own —
// anyone with devtools can call it manually — so nothing in the client is allowed to set
// orders.payment_status = 'paid' directly (see the RLS policies in schema.sql). This function is
// the only path that can, and only after confirming the transaction with Paystack itself using the
// secret key, which never leaves the server.
//
// Deploy via the Supabase Dashboard -> Edge Functions -> Deploy a new function (paste this file), or
// `supabase functions deploy verify-payment` with the CLI. Requires two secrets set on the project
// (Project Settings -> Edge Functions -> Secrets, or `supabase secrets set`):
//   PAYSTACK_SECRET_KEY   - from the Paystack dashboard (sk_test_... or sk_live_...)
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are already available automatically in every Edge
// Function's environment — no need to set those yourself.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// The browser calls this from a different origin than the function itself, so it preflights with
// an OPTIONS request before the real POST — without these headers the browser blocks the response
// before our code ever runs, which surfaces client-side as a generic "Failed to send a request to
// the Edge Function" rather than any error this function actually returns.
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
  if (!PAYSTACK_SECRET_KEY) return json({ error: 'PAYSTACK_SECRET_KEY is not configured' }, 500)

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Missing Authorization header' }, 401)

  let orderId: string
  let reference: string
  try {
    const body = await req.json()
    orderId = body.orderId
    reference = body.reference
    if (!orderId || !reference) throw new Error('missing fields')
  } catch {
    return json({ error: 'Request body must include orderId and reference' }, 400)
  }

  // Scoped to the caller's own JWT — RLS means this only returns a row if the order actually
  // belongs to the person making the request (or they're an admin).
  const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })

  const { data: order, error: orderError } = await callerClient
    .from('orders')
    .select('id, total, payment_status')
    .eq('id', orderId)
    .maybeSingle()

  if (orderError || !order) return json({ error: 'Order not found' }, 404)
  if (order.payment_status === 'paid') return json({ verified: true, alreadyPaid: true })

  const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
  })
  const verifyJson = await verifyRes.json()

  if (!verifyRes.ok || !verifyJson.status) {
    return json({ error: 'Could not verify transaction with Paystack', verified: false }, 502)
  }

  const tx = verifyJson.data
  const expectedKobo = Math.round(Number(order.total) * 100)

  if (tx.status !== 'success' || tx.currency !== 'NGN' || tx.amount !== expectedKobo) {
    return json({ error: 'Transaction verification failed — status, amount, or currency mismatch.', verified: false }, 400)
  }

  // Service role bypasses RLS — this is the one place allowed to set payment_status = 'paid'.
  // paystack_reference has a unique constraint, so a reference already consumed by a different
  // order fails here with a conflict rather than silently marking a second order paid.
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const { error: updateError } = await adminClient
    .from('orders')
    .update({ payment_status: 'paid', paystack_reference: reference, updated_at: new Date().toISOString() })
    .eq('id', orderId)

  if (updateError) {
    if (updateError.code === '23505') {
      return json({ error: 'This payment reference has already been used on another order.', verified: false }, 409)
    }
    return json({ error: 'Payment verified but failed to update the order. Contact support.', verified: false }, 500)
  }

  return json({ verified: true })
})

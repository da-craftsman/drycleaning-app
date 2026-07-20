// Emails every admin when a customer submits a new support ticket — includes a link straight to
// the ticket plus the customer's phone number and their message, so an admin can act on it without
// even opening the dashboard first.
//
// Called from the client (src/lib/data/tickets.ts -> sendTicketNotificationEmail) once, right after
// createTicket() inserts the ticket + its first message — best-effort, same as the other email
// functions in this project (a failed send doesn't block ticket creation).
//
// Deploy via the Supabase Dashboard -> Edge Functions -> Deploy a new function (paste this file), or
// `supabase functions deploy send-ticket-notification` with the CLI. Uses the same secrets as
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

const categoryLabels: Record<string, string> = {
  damaged_item: 'Damaged item',
  missing_item: 'Missing item',
  delay: 'Delay',
  billing: 'Billing',
  quality: 'Quality',
  other: 'Other',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  if (!RESEND_API_KEY) return json({ error: 'RESEND_API_KEY is not configured' }, 500)

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Missing Authorization header' }, 401)

  let ticketId: string
  try {
    const body = await req.json()
    ticketId = body.ticketId
    if (!ticketId) throw new Error('missing ticketId')
  } catch {
    return json({ error: 'Request body must include ticketId' }, 400)
  }

  // Scoped to the caller's own JWT — RLS means this only returns a row if the ticket actually
  // belongs to the person making the request.
  const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })

  const { data: ticket, error: ticketError } = await callerClient.from('complaint_tickets').select('*').eq('id', ticketId).maybeSingle()
  if (ticketError || !ticket) return json({ error: 'Ticket not found' }, 404)

  const { data: profile, error: profileError } = await callerClient
    .from('profiles')
    .select('full_name, phone, email')
    .eq('id', ticket.user_id)
    .maybeSingle()
  if (profileError || !profile) return json({ error: 'Customer profile not found' }, 404)

  // Customers can't read other profiles under RLS, so finding every admin needs the service role.
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const { data: admins, error: adminsError } = await adminClient.from('profiles').select('email').eq('role', 'admin')
  if (adminsError) return json({ error: adminsError.message }, 500)
  if (!admins || admins.length === 0) return json({ sent: false, reason: 'No admin accounts to notify' })

  const ticketUrl = `${SITE_URL}/admin/tickets/${ticket.id}`

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;color:#111827;">
      <h2 style="color:#0b3d91;">New support ticket</h2>
      <p><strong>${profile.full_name || 'A customer'}</strong> just submitted a new ticket:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:6px 0;color:#6b7280;">Subject</td><td style="padding:6px 0;text-align:right;font-weight:600;">${ticket.subject}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Category</td><td style="padding:6px 0;text-align:right;">${categoryLabels[ticket.category] ?? ticket.category}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Priority</td><td style="padding:6px 0;text-align:right;text-transform:capitalize;">${ticket.priority}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Customer phone</td><td style="padding:6px 0;text-align:right;">${profile.phone}</td></tr>
      </table>
      <p style="color:#374151;background:#f3f4f6;border-radius:8px;padding:12px;white-space:pre-wrap;">${ticket.description}</p>
      <p style="margin:24px 0;">
        <a href="${ticketUrl}" style="background:#0b3d91;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
          View Ticket
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
      subject: `New Support Ticket — ${ticket.subject}`,
      html,
    }),
  })

  if (!emailRes.ok) {
    const errBody = await emailRes.text()
    return json({ error: `Failed to send ticket notification email: ${errBody}`, sent: false }, 502)
  }

  return json({ sent: true })
})

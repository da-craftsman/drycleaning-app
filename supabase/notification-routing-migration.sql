-- Lets a superadmin choose which admin/sub-admin accounts receive new-order and new-support-ticket
-- notifications (in-app bell + the ticket email alert), instead of blanket-notifying every staff
-- account. Run against a live project that predates this feature (SQL Editor). Safe to run more
-- than once, and safe to run on a project already provisioned from the current schema.sql (it's a
-- no-op there — those columns/functions already exist in that form).

alter table profiles add column if not exists notify_new_orders boolean not null default true;
alter table profiles add column if not exists notify_new_tickets boolean not null default true;

create or replace function notify_admins_new_order() returns trigger as $$
begin
  insert into notifications (recipient_id, type, title, body, link_path, related_order_id)
  select id, 'new_order', 'New order ' || new.display_id, 'A new order has been placed.', '/admin/orders/' || new.id, new.id
  from profiles where role in ('admin', 'superadmin') and notify_new_orders = true;
  return new;
end;
$$ language plpgsql security definer;

create or replace function notify_admins_new_ticket() returns trigger as $$
begin
  insert into notifications (recipient_id, type, title, body, link_path, related_ticket_id)
  select id, 'new_ticket', 'New ticket: ' || new.subject, 'A customer submitted a new support ticket.', '/admin/tickets/' || new.id, new.id
  from profiles where role in ('admin', 'superadmin') and notify_new_tickets = true;
  return new;
end;
$$ language plpgsql security definer;

-- Also redeploy the `send-ticket-notification` Edge Function (Dashboard -> Edge Functions -> paste
-- supabase/functions/send-ticket-notification/index.ts) — it now filters its email recipient list
-- the same way, and also picks up a pre-existing bug fix (it previously only emailed role='admin',
-- silently skipping superadmins).
--
-- Also deploy the new `send-new-order-notification` Edge Function (supabase/functions/
-- send-new-order-notification/index.ts) if it isn't deployed yet — previously, admins only ever got
-- an in-app bell notification for new orders, never an email (unlike tickets, which always emailed).
-- This is a genuinely new function, not a redeploy of an existing one.

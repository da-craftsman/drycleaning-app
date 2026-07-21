-- Superadmin / sub-admin roles migration.
-- Run against the real Supabase project in the SQL editor.
--
-- IMPORTANT: run this in TWO separate executions, in order. Postgres will not let a new enum
-- value be used by any statement in the same transaction that added it, and the Supabase SQL
-- editor runs each pasted script as one transaction — so Step 1 must be committed before Step 2
-- runs (paste + run Step 1, wait for it to finish, then paste + run Step 2).

-- ── Step 1: run this first, on its own ─────────────────────────────────────

alter type user_role add value if not exists 'superadmin';

-- ── Step 2: run this after Step 1 has completed ─────────────────────────────

alter table profiles add column if not exists permissions text[] not null default '{}';

create or replace function is_admin() returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'superadmin'));
$$ language sql security definer stable;

create or replace function is_superadmin() returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'superadmin');
$$ language sql security definer stable;

drop policy if exists "profiles_admin_manage" on profiles;
create policy "profiles_admin_manage" on profiles for update
  using (is_superadmin())
  with check (is_superadmin());

-- The two admin-notification triggers select recipients by role directly (not via is_admin()),
-- so they need to be recreated to include superadmins too, otherwise a promoted superadmin would
-- stop getting new-order/new-ticket notifications.
create or replace function notify_admins_new_order() returns trigger as $$
begin
  insert into notifications (recipient_id, type, title, body, link_path, related_order_id)
  select id, 'new_order', 'New order ' || new.display_id, 'A new order has been placed.', '/admin/orders/' || new.id, new.id
  from profiles where role in ('admin', 'superadmin');
  return new;
end;
$$ language plpgsql security definer;

create or replace function notify_admins_new_ticket() returns trigger as $$
begin
  insert into notifications (recipient_id, type, title, body, link_path, related_ticket_id)
  select id, 'new_ticket', 'New ticket: ' || new.subject, 'A customer submitted a new support ticket.', '/admin/tickets/' || new.id, new.id
  from profiles where role in ('admin', 'superadmin');
  return new;
end;
$$ language plpgsql security definer;

-- Promote every existing admin account to superadmin — matches "the current admin becomes
-- the superadmin." Safe to run more than once.
update profiles set role = 'superadmin' where role = 'admin';

-- Enables the "Walk-in Order" admin feature: an admin can build an order on behalf of a customer
-- who dropped laundry off in person. Run this once against a live project that predates this
-- feature (SQL Editor).
--
-- Do NOT run this against a project freshly provisioned from the current schema.sql — that file
-- already includes this exact policy from the start, and re-creating it here without the guard
-- below would fail with "policy already exists". The `drop policy if exists` makes this migration
-- safe to run more than once, and harmless (a no-op) if schema.sql already created it.
--
-- No enum change here, so this is a single script (unlike admin-roles-migration.sql, which needed
-- two steps for the new 'superadmin' enum value) — `permissions` is just `text[]`, so the new
-- 'walkin' permission string needs no schema change of its own.

drop policy if exists "orders_admin_insert" on orders;
create policy "orders_admin_insert" on orders for insert
  with check (is_admin() and payment_status = 'pending');

-- Also deploy the new `create-walkin-customer` Edge Function (Dashboard -> Edge Functions -> Deploy
-- a new function, paste supabase/functions/create-walkin-customer/index.ts) — it provisions a
-- lightweight customer account for a walk-in customer who doesn't already have one, using the same
-- service-role pattern as create-admin-user.

-- Security hardening migration (2026-10-10) — closes the database holes from use/security.md.
-- Paste the whole file into the Supabase SQL editor and run it once. Safe to re-run.
--
--   1. Order prices are computed server-side. Customers (and the walk-in flow) now create orders
--      only through create_order(), which looks every price up in clothing_items / delivery_zones.
--      Direct inserts into orders / order_items are no longer allowed from the browser, so a
--      tampered request can't create a ₦50,000 order with a ₦100 total and pay ₦100 for it.
--   2. Customers can't edit orders at all after creating them (they never needed to) — only staff.
--   3. Nobody but a superadmin can change a profile's role or permissions, and a new signup can
--      only ever create its own profile as a plain customer.
--   4. Customers can't change ticket status/priority after creating a ticket, can only open a
--      ticket as 'open' against one of their own orders, and can't post a message as staff.
--   5. Only staff can write order status history (customers could previously forge entries).
--
-- Requires the app update that switches createOrder (src/lib/data/orders.ts) to the create_order
-- RPC. Run this migration and deploy that app update together — with only the migration applied,
-- the old app's direct order insert is rejected and checkout fails until the new build is live.

-- ── 1. Server-side order creation ────────────────────────────────────────

create or replace function create_order(
  p_user_id uuid,
  p_items jsonb, -- [{ "item_id": uuid, "tier": "regular" | "white" | "express", "quantity": int }, ...]
  p_logistics_type logistics_type,
  p_zone_id uuid,
  p_address text,
  p_phone text,
  p_whatsapp text,
  p_special_instructions text,
  p_payment_method payment_method
) returns orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_zone delivery_zones;
  v_fee numeric(10, 2) := 0;
  v_subtotal numeric(10, 2) := 0;
  v_line record;
  v_item clothing_items;
  v_price numeric(10, 2);
  v_display_id text;
  v_order orders;
begin
  if auth.uid() is null then
    raise exception 'You need to be signed in to place an order.' using errcode = '42501';
  end if;
  -- Customers order for themselves; staff (walk-in flow) can order on a customer's behalf.
  if p_user_id is distinct from auth.uid() and not is_admin() then
    raise exception 'You can only place orders for your own account.' using errcode = '42501';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Your cart is empty.';
  end if;
  if jsonb_array_length(p_items) > 100 then
    raise exception 'Too many different items in one order.';
  end if;
  if coalesce(length(trim(p_address)), 0) = 0 or length(p_address) > 500 then
    raise exception 'Please enter a valid address.';
  end if;
  if coalesce(length(trim(p_phone)), 0) = 0 or length(p_phone) > 30 or length(coalesce(p_whatsapp, '')) > 30 then
    raise exception 'Please enter a valid phone number.';
  end if;
  if length(coalesce(p_special_instructions, '')) > 2000 then
    raise exception 'Special instructions are too long.';
  end if;

  -- Delivery fee comes from the zone, never from the client. Same rules as the checkout UI:
  -- self drop-off is free, pickup/delivery charge their own fee, pickup+delivery charges both.
  if p_logistics_type <> 'self_dropoff' then
    select * into v_zone from delivery_zones where id = p_zone_id;
    if not found then
      raise exception 'Please choose a valid delivery zone.';
    end if;
    v_fee := case p_logistics_type
      when 'pickup_only' then v_zone.pickup_fee
      when 'delivery_only' then v_zone.delivery_fee
      else v_zone.pickup_fee + v_zone.delivery_fee
    end;
  end if;

  -- First pass: validate every line and total it up from the live catalog prices.
  for v_line in select * from jsonb_to_recordset(p_items) as x(item_id uuid, tier service_tier, quantity int) loop
    if v_line.quantity is null or v_line.quantity < 1 or v_line.quantity > 500 then
      raise exception 'Invalid quantity in your cart.';
    end if;
    select * into v_item from clothing_items where id = v_line.item_id and is_active;
    if not found then
      raise exception 'An item in your cart is no longer available. Please remove it and try again.';
    end if;
    v_price := case v_line.tier
      when 'regular' then v_item.price_regular
      when 'white' then v_item.price_white
      else v_item.price_express
    end;
    if v_price is null then
      raise exception '% is no longer offered at that service level. Please update your cart.', v_item.name;
    end if;
    v_subtotal := v_subtotal + v_price * v_line.quantity;
  end loop;

  -- Same SRL-###### format the app used to generate client-side, but picked server-side.
  loop
    v_display_id := 'SRL-' || lpad(floor(random() * 1000000)::int::text, 6, '0');
    exit when not exists (select 1 from orders where display_id = v_display_id);
  end loop;

  insert into orders (
    display_id, user_id, status, logistics_type, zone_id, address, phone, whatsapp,
    special_instructions, subtotal, delivery_fee, total, payment_method, payment_status
  ) values (
    v_display_id, p_user_id, 'order_received', p_logistics_type,
    case when p_logistics_type = 'self_dropoff' then null else p_zone_id end,
    trim(p_address), trim(p_phone), nullif(trim(coalesce(p_whatsapp, '')), ''),
    nullif(trim(coalesce(p_special_instructions, '')), ''),
    v_subtotal, v_fee, v_subtotal + v_fee, p_payment_method, 'pending'
  ) returning * into v_order;

  -- Second pass: write the lines with the catalog's own name and price (the first pass already
  -- rejected anything inactive or unpriced, so every row here has a real price).
  insert into order_items (order_id, item_id, item_name, service_tier, quantity, unit_price, line_total)
  select
    v_order.id, ci.id, ci.name, x.tier, x.quantity, p.price, p.price * x.quantity
  from jsonb_to_recordset(p_items) as x(item_id uuid, tier service_tier, quantity int)
  join clothing_items ci on ci.id = x.item_id
  cross join lateral (
    select case x.tier when 'regular' then ci.price_regular when 'white' then ci.price_white else ci.price_express end as price
  ) p;

  insert into order_status_history (order_id, status) values (v_order.id, v_order.status);

  return v_order;
end;
$$;

revoke all on function create_order(uuid, jsonb, logistics_type, uuid, text, text, text, text, payment_method) from public, anon;
grant execute on function create_order(uuid, jsonb, logistics_type, uuid, text, text, text, text, payment_method) to authenticated;

-- ── 2. Orders: no direct inserts from the browser; only staff can update ─

drop policy if exists "orders_insert_own" on orders;
drop policy if exists "orders_admin_insert" on orders;
drop policy if exists "orders_update_own_or_admin" on orders;
drop policy if exists "orders_admin_update" on orders;
create policy "orders_admin_update" on orders for update
  using (is_admin())
  with check (is_admin());

drop policy if exists "order_items_insert_via_order" on order_items;
drop policy if exists "order_items_admin_insert" on order_items;
create policy "order_items_admin_insert" on order_items for insert
  with check (is_admin());

drop policy if exists "order_status_history_insert_via_order" on order_status_history;
drop policy if exists "order_status_history_admin_insert" on order_status_history;
create policy "order_status_history_admin_insert" on order_status_history for insert
  with check (is_admin());

-- ── 3. Profiles: role and permissions are superadmin-only ────────────────

drop policy if exists "profiles_insert_own" on profiles;
create policy "profiles_insert_own" on profiles for insert
  with check (id = auth.uid() and role = 'customer' and permissions = '{}');

-- RLS can't compare a row's old and new values, so this is a trigger. auth.uid() is null for the
-- service role (create-admin-user / create-walkin-customer Edge Functions) and the SQL editor,
-- which are trusted and pass straight through.
create or replace function protect_profile_privileges() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null
     and not is_superadmin()
     and (new.role is distinct from old.role or new.permissions is distinct from old.permissions) then
    raise exception 'Only a superadmin can change roles or permissions.' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile_privileges on profiles;
create trigger trg_protect_profile_privileges
  before update on profiles
  for each row execute function protect_profile_privileges();

-- ── 4. Tickets ───────────────────────────────────────────────────────────

drop policy if exists "tickets_insert_own" on complaint_tickets;
create policy "tickets_insert_own" on complaint_tickets for insert
  with check (
    user_id = auth.uid()
    and status = 'open'
    and (order_id is null or exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid()))
  );

-- Customers never change a ticket after opening it (only staff reply-status and "Mark Resolved").
drop policy if exists "tickets_update_own_or_admin" on complaint_tickets;
drop policy if exists "tickets_admin_update" on complaint_tickets;
create policy "tickets_admin_update" on complaint_tickets for update
  using (is_admin())
  with check (is_admin());

-- Customers can only post as themselves, never as staff (author_role = 'admin' is what shows a
-- message as a staff reply and triggers the customer's "new reply" notification).
drop policy if exists "ticket_messages_insert_via_ticket" on ticket_messages;
create policy "ticket_messages_insert_via_ticket" on ticket_messages for insert
  with check (
    exists (select 1 from complaint_tickets t where t.id = ticket_id and (t.user_id = auth.uid() or is_admin()))
    and (is_admin() or author_role = 'customer')
  );

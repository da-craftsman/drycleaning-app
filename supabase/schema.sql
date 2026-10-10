-- Shalah Rex Laundry — Supabase schema
-- Not executed by the app. Run against a real Supabase project with:
--   supabase db push
-- or paste into the SQL editor. See supabase/README.md.
--
-- Table shapes follow use/sytem-prompt.md section 13. `ticket_messages` is an
-- addition beyond the spec's minimum table list — section 9 describes an
-- admin-reply thread per ticket, which needs somewhere to live.

create extension if not exists "pgcrypto";

-- ── Enums ────────────────────────────────────────────────────────────────

create type user_role as enum ('customer', 'admin', 'superadmin');
create type service_tier as enum ('regular', 'white', 'express');
create type logistics_type as enum ('self_dropoff', 'pickup_only', 'delivery_only', 'pickup_and_delivery');
create type payment_method as enum ('paystack', 'cash_on_delivery');
create type payment_status as enum ('pending', 'paid', 'failed');
create type order_status as enum (
  'order_received', 'collected', 'processing', 'washing', 'ironing',
  'quality_check', 'ready', 'out_for_delivery', 'completed', 'cancelled'
);
create type ticket_status as enum ('open', 'in_progress', 'resolved');
create type ticket_priority as enum ('low', 'normal', 'high', 'urgent');
create type ticket_category as enum ('damaged_item', 'missing_item', 'delay', 'billing', 'quality', 'other');
create type notification_type as enum ('new_order', 'order_status_changed', 'new_ticket', 'ticket_reply');

-- ── Tables ───────────────────────────────────────────────────────────────

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role user_role not null default 'customer',
  full_name text not null,
  phone text not null,
  whatsapp text,
  address text,
  email text not null,
  email_verified_at timestamptz,
  welcome_email_sent_at timestamptz,
  -- Sub-admin feature grants (e.g. 'orders','customers','catalog','zones','banner','tickets','blog','walkin').
  -- Ignored for role='superadmin', which always has full access regardless of this array.
  permissions text[] not null default '{}',
  -- Whether this staff account (admin or superadmin) receives new-order / new-support-ticket
  -- notifications (in-app + the ticket email alert). Meaningless for role='customer' rows, but kept
  -- as a plain default-true column rather than nullable, since every staff account starts opted in.
  notify_new_orders boolean not null default true,
  notify_new_tickets boolean not null default true,
  created_at timestamptz not null default now()
);

create table clothing_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  display_order int not null default 0
);

create table clothing_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references clothing_categories (id) on delete cascade,
  name text not null,
  thumbnail_url text,
  -- Null price/time on a tier means the item isn't offered at that tier at all (e.g. a rug with
  -- no express option), not that it's free — the UI hides that tier rather than showing ₦0.
  price_regular numeric(10, 2),
  price_white numeric(10, 2),
  price_express numeric(10, 2),
  time_regular text,
  time_white text,
  time_express text,
  is_active boolean not null default true
);

create table delivery_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  -- Charged for 'pickup_only'; both are summed for 'pickup_and_delivery'. 'self_dropoff' is always free.
  pickup_fee numeric(10, 2) not null default 0,
  delivery_fee numeric(10, 2) not null default 0
);

-- Singleton row (id fixed to 'banner-main') powering the editable home page promo banner.
create table promo_banners (
  id text primary key default 'banner-main',
  title text not null default 'Welcome Offer',
  subtitle text not null default '',
  image_url text,
  link_url text not null default '/order',
  is_active boolean not null default true
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  display_id text not null unique,
  user_id uuid not null references profiles (id) on delete cascade,
  status order_status not null default 'order_received',
  logistics_type logistics_type not null,
  zone_id uuid references delivery_zones (id),
  address text not null,
  phone text not null,
  whatsapp text,
  special_instructions text,
  rider_name text,
  subtotal numeric(10, 2) not null,
  delivery_fee numeric(10, 2) not null default 0,
  total numeric(10, 2) not null,
  payment_method payment_method not null,
  payment_status payment_status not null default 'pending',
  paystack_reference text unique,
  confirmation_email_sent_at timestamptz,
  ready_email_sent_at timestamptz,
  -- Set once the staff "new order" email has gone out; send-new-order-notification never re-sends.
  admin_email_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  item_id uuid not null references clothing_items (id),
  item_name text not null,
  service_tier service_tier not null,
  quantity int not null check (quantity > 0),
  unit_price numeric(10, 2) not null,
  line_total numeric(10, 2) not null
);

create table order_images (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  image_url text not null
);

-- One row per status transition (including the initial 'order_received' on creation), so the
-- Activity tab on order detail pages can show a real timestamped history instead of just the
-- single current `orders.updated_at`.
create table order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  status order_status not null,
  created_at timestamptz not null default now()
);

create table complaint_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  order_id uuid references orders (id),
  subject text not null,
  description text not null,
  category ticket_category not null default 'other',
  priority ticket_priority not null default 'normal',
  status ticket_status not null default 'open',
  photo_url text,
  -- Set once the staff "new ticket" email has gone out; send-ticket-notification never re-sends.
  admin_email_sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references complaint_tickets (id) on delete cascade,
  author_role user_role not null,
  author_name text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- In-app notifications for both sides: customers get 'order_status_changed'/'ticket_reply', admins
-- get 'new_order'/'new_ticket'. Rows are created entirely by the triggers below (see "Notification
-- triggers" further down) — the app never inserts into this table directly, only reads its own rows
-- and marks them read. related_order_id/related_ticket_id let the UI mark a whole item's
-- notifications read at once when that specific order/ticket is opened.
create table notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references profiles (id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text not null,
  link_path text not null,
  related_order_id uuid references orders (id) on delete cascade,
  related_ticket_id uuid references complaint_tickets (id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null,
  excerpt text not null default '',
  feature_image text,
  category text not null default 'General',
  seo_description text,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

-- ── Indexes ──────────────────────────────────────────────────────────────

create index orders_user_id_idx on orders (user_id);
create index orders_status_idx on orders (status);
create index order_items_order_id_idx on order_items (order_id);
create index order_images_order_id_idx on order_images (order_id);
create index order_status_history_order_id_idx on order_status_history (order_id);
create index complaint_tickets_user_id_idx on complaint_tickets (user_id);
create index ticket_messages_ticket_id_idx on ticket_messages (ticket_id);
create index blog_posts_slug_idx on blog_posts (slug);
create index clothing_items_category_id_idx on clothing_items (category_id);
-- Powers "does this recipient have any unread notifications of type X" (admin sidebar red dots,
-- customer bell) — partial index since only unread rows are ever queried that way.
create index notifications_recipient_unread_idx on notifications (recipient_id, type) where read_at is null;
create index notifications_recipient_created_idx on notifications (recipient_id, created_at desc);

-- ── Row Level Security ───────────────────────────────────────────────────

alter table profiles enable row level security;
alter table clothing_categories enable row level security;
alter table clothing_items enable row level security;
alter table delivery_zones enable row level security;
alter table promo_banners enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_images enable row level security;
alter table order_status_history enable row level security;
alter table complaint_tickets enable row level security;
alter table ticket_messages enable row level security;
alter table blog_posts enable row level security;
alter table notifications enable row level security;

create function is_admin() returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'superadmin'));
$$ language sql security definer stable;

-- Distinct from is_admin(): true only for the full-access tier. Used to gate the one write path
-- that grants/revokes staff access itself (see profiles_admin_manage below) — every other admin
-- RLS policy stays a blanket is_admin() check, since feature-level permission gating is enforced
-- in the app's UI/routes, not in Postgres (sub-admins are still a full is_admin() staff account).
create function is_superadmin() returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'superadmin');
$$ language sql security definer stable;

-- profiles: users read/update their own row; admins read all; superadmins can also manage
-- (create/edit role+permissions for) any profile, which is how sub-admin accounts get provisioned.
create policy "profiles_select_own_or_admin" on profiles for select
  using (id = auth.uid() or is_admin());
create policy "profiles_update_own" on profiles for update
  using (id = auth.uid());
-- A signup can only create its own profile as a plain customer. Role/permission changes after that
-- are blocked for everyone but superadmins by trg_protect_profile_privileges (see the end of file).
create policy "profiles_insert_own" on profiles for insert
  with check (id = auth.uid() and role = 'customer' and permissions = '{}');
create policy "profiles_admin_manage" on profiles for update
  using (is_superadmin())
  with check (is_superadmin());

-- clothing_categories / clothing_items: public read, admin write.
create policy "categories_public_read" on clothing_categories for select using (true);
create policy "categories_admin_write" on clothing_categories for all using (is_admin()) with check (is_admin());
create policy "items_public_read" on clothing_items for select using (true);
create policy "items_admin_write" on clothing_items for all using (is_admin()) with check (is_admin());

-- delivery_zones: public read, admin write.
create policy "zones_public_read" on delivery_zones for select using (true);
create policy "zones_admin_write" on delivery_zones for all using (is_admin()) with check (is_admin());

-- promo_banners: public read, admin write.
create policy "banners_public_read" on promo_banners for select using (true);
create policy "banners_admin_write" on promo_banners for all using (is_admin()) with check (is_admin());

-- orders: customers read their own; admins read/update/delete all. There is deliberately no insert
-- policy — every order (customer checkout and staff walk-in alike) is created by the create_order()
-- function at the end of this file, which prices it from clothing_items/delivery_zones itself, so a
-- tampered request can't set its own total. Nothing in the customer's browser can set
-- payment_status = 'paid' either — only verify-payment / paystack-webhook (service role, after
-- confirming with Paystack) or an admin recording a cash payment.
create policy "orders_select_own_or_admin" on orders for select
  using (user_id = auth.uid() or is_admin());
create policy "orders_admin_update" on orders for update
  using (is_admin())
  with check (is_admin());
create policy "orders_admin_delete" on orders for delete using (is_admin());

-- order_items / order_images: follow the parent order's visibility.
create policy "order_items_via_order" on order_items for select
  using (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin())));
-- Customer order lines are written by create_order(); direct inserts are staff-only.
create policy "order_items_admin_insert" on order_items for insert
  with check (is_admin());
create policy "order_images_via_order" on order_images for select
  using (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin())));
create policy "order_images_insert_via_order" on order_images for insert
  with check (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin())));
create policy "order_status_history_via_order" on order_status_history for select
  using (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin())));
create policy "order_status_history_admin_insert" on order_status_history for insert
  with check (is_admin());

-- complaint_tickets / ticket_messages: owner + admin.
create policy "tickets_select_own_or_admin" on complaint_tickets for select
  using (user_id = auth.uid() or is_admin());
create policy "tickets_insert_own" on complaint_tickets for insert
  with check (
    user_id = auth.uid()
    and status = 'open'
    and (order_id is null or exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid()))
  );
-- Customers never change a ticket after opening it — status changes are staff-only.
create policy "tickets_admin_update" on complaint_tickets for update
  using (is_admin())
  with check (is_admin());
create policy "ticket_messages_via_ticket" on ticket_messages for select
  using (exists (select 1 from complaint_tickets t where t.id = ticket_id and (t.user_id = auth.uid() or is_admin())));
-- Customers can only post as themselves, never as staff (author_role = 'admin').
create policy "ticket_messages_insert_via_ticket" on ticket_messages for insert
  with check (
    exists (select 1 from complaint_tickets t where t.id = ticket_id and (t.user_id = auth.uid() or is_admin()))
    and (is_admin() or author_role = 'customer')
  );

-- blog_posts: public read of published posts, admin full access.
create policy "blog_public_read_published" on blog_posts for select
  using (published_at is not null or is_admin());
create policy "blog_admin_write" on blog_posts for all using (is_admin()) with check (is_admin());

-- notifications: recipients read/mark-read their own only. No insert/delete policy for any
-- role — rows are only ever created by the security-definer trigger functions below, which run as
-- the functions' owner and so bypass RLS entirely; the app itself never inserts a row directly.
create policy "notifications_select_own" on notifications for select
  using (recipient_id = auth.uid());
create policy "notifications_update_own" on notifications for update
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

-- ── Notification triggers ───────────────────────────────────────────────
-- All four fire server-side regardless of which client/Edge Function performed the write, so
-- notifications can never be missed by forgetting to call something from the app. Each is
-- `security definer`, same technique as is_admin() above, so it can read across profiles/orders/
-- tickets despite RLS on the calling role.

create function notify_admins_new_order() returns trigger as $$
begin
  insert into notifications (recipient_id, type, title, body, link_path, related_order_id)
  select id, 'new_order', 'New order ' || new.display_id, 'A new order has been placed.', '/admin/orders/' || new.id, new.id
  from profiles where role in ('admin', 'superadmin') and notify_new_orders = true;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_notify_admins_new_order
  after insert on orders
  for each row execute function notify_admins_new_order();

create function notify_customer_order_status() returns trigger as $$
begin
  if new.status is distinct from old.status then
    insert into notifications (recipient_id, type, title, body, link_path, related_order_id)
    values (
      new.user_id, 'order_status_changed', 'Order ' || new.display_id || ' updated',
      'Your order status is now: ' || replace(new.status::text, '_', ' '),
      '/account/orders/' || new.id, new.id
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_notify_customer_order_status
  after update on orders
  for each row execute function notify_customer_order_status();

create function notify_admins_new_ticket() returns trigger as $$
begin
  insert into notifications (recipient_id, type, title, body, link_path, related_ticket_id)
  select id, 'new_ticket', 'New ticket: ' || new.subject, 'A customer submitted a new support ticket.', '/admin/tickets/' || new.id, new.id
  from profiles where role in ('admin', 'superadmin') and notify_new_tickets = true;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_notify_admins_new_ticket
  after insert on complaint_tickets
  for each row execute function notify_admins_new_ticket();

create function notify_customer_ticket_reply() returns trigger as $$
declare
  ticket_user_id uuid;
begin
  if new.author_role = 'admin' then
    select user_id into ticket_user_id from complaint_tickets where id = new.ticket_id;
    insert into notifications (recipient_id, type, title, body, link_path, related_ticket_id)
    values (ticket_user_id, 'ticket_reply', 'New reply on your ticket', new.message, '/account/tickets/' || new.ticket_id, new.ticket_id);
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_notify_customer_ticket_reply
  after insert on ticket_messages
  for each row execute function notify_customer_ticket_reply();

-- ── Storage bucket policies ─────────────────────────────────────────────
-- Create the buckets first (Dashboard → Storage: 'thumbnails' and 'stain_photos'), then run
-- storage-policies-migration.sql — without it, storage.objects has no INSERT policy for either
-- bucket and every upload fails with "new row violates row-level security policy".

-- ── Seed data ────────────────────────────────────────────────────────────

insert into clothing_categories (name, display_order) values
  ('Everyday Wear', 1),
  ('Corporate', 2),
  ('Native Wear', 3),
  ('Women''s', 4),
  ('Children''s Wear', 5),
  ('Bedding', 6),
  ('Household', 7),
  ('Special Care', 8),
  ('Accessories', 9);

-- thumbnail_url values point at /clothes/<file>.png, served from the frontend's public/ folder —
-- if serving items from Supabase directly, upload the same files to the `thumbnails` bucket and
-- update these to the bucket's public URLs instead.
--
-- Real business price list (2026-07-21). Null price/time = that tier isn't offered for the item
-- (e.g. rugs and teddy bears have no express option; wedding gown has no regular option).
-- Two known gaps in the source price sheet, resolved as noted:
--   - "Traveling Bags" listed Normal 1500 / White 3500 / Express 3000 (express below white,
--     inconsistent with every other row) — treated as a White/Express column swap and corrected
--     to Normal 1500 / White 3000 / Express 3500.
--   - "One Cotton" / "Double Cotton" and "Native" / "Up and Down" are filed under Native Wear as
--     distinct items; flag for the user to rename/recategorize later if the assumption is wrong.
insert into clothing_items (category_id, name, thumbnail_url, price_regular, price_white, price_express, time_regular, time_white, time_express)
select c.id, v.name, v.thumbnail_url, v.price_regular, v.price_white, v.price_express, v.time_regular, v.time_white, v.time_express
from (values
  ('Everyday Wear', 'Shirt / Polo', '/clothes/shirts-and-tops.png', 350, 500, 1000, '2-3 days', '2 days', '24h'),
  ('Everyday Wear', 'Jeans Trouser', '/clothes/jeans.png', 500, 700, 1200, '3-4 days', '2 days', '24h'),
  ('Everyday Wear', 'Shorts', '/clothes/skirt-or-shorts.png', 400, 600, 1000, '2-3 days', '2 days', '24h'),
  ('Everyday Wear', 'Singlet', '/clothes/singlet.png', 250, 300, 500, '2-3 days', '2 days', '24h'),
  ('Everyday Wear', 'Boxers', '/clothes/singlet.png', 300, 400, 600, '2-3 days', '2 days', '24h'),
  ('Everyday Wear', 'Sweater', '/clothes/sweater.png', 500, 800, 1200, '3-4 days', '2 days', '24h'),
  ('Corporate', 'Complete Male Suit', '/clothes/mens-suit.png', 3500, 4500, 8000, '4-5 days', '3 days', '48h'),
  ('Corporate', 'Female Suit', '/clothes/ladies-suit.png', 3000, 4000, 7000, '4-5 days', '3 days', '48h'),
  ('Corporate', 'Suit Jacket', '/clothes/suit-jacket.png', 800, 1000, 2000, '3-4 days', '2 days', '24h'),
  ('Corporate', 'Plain Trouser', '/clothes/trousers.png', 450, 600, 1200, '3-4 days', '2 days', '24h'),
  ('Corporate', 'Labcoat', '/clothes/lab-coat.png', 500, null, 1000, '3-4 days', null, '24h'),
  ('Native Wear', 'Complete Agbada', '/clothes/agbada.png', 2000, 2800, 5000, '4-5 days', '3 days', '48h'),
  ('Native Wear', 'Buba and Wrapper', '/clothes/buba-and-wrapper.png', 800, 1500, 2000, '4-5 days', '3 days', '48h'),
  ('Native Wear', 'Jalabia', '/clothes/jalabia.png', 500, 800, 1200, '3-4 days', '2 days', '24h'),
  ('Native Wear', 'Senator Wears', '/clothes/senator-wear.png', 1000, 1500, 2000, '3-4 days', '2 days', '24h'),
  ('Native Wear', 'Up and Down', '/clothes/senator-wear.png', 800, 1500, 1800, '3-4 days', '2 days', '24h'),
  ('Native Wear', 'Native', '/clothes/senator-wear.png', 800, 1500, 1800, '3-4 days', '2 days', '24h'),
  ('Native Wear', 'Cotton (Single)', '/clothes/buba-and-wrapper.png', 500, 700, 1000, '3-4 days', '2 days', '24h'),
  ('Native Wear', 'Cotton (Double)', '/clothes/buba-and-wrapper.png', 800, 1000, 1500, '3-4 days', '2 days', '24h'),
  ('Women''s', 'Gown', '/clothes/evening-gown.png', 400, 600, 1000, '3-4 days', '2 days', '24h'),
  ('Women''s', 'Skirt and Blouse', '/clothes/skirt-and-blouse.png', 800, 1500, 2000, '3-4 days', '2 days', '24h'),
  ('Women''s', 'Skirt', '/clothes/skirt-or-shorts.png', 400, 500, 1000, '2-3 days', '2 days', '24h'),
  ('Bedding', 'Bedspread', '/clothes/bedspread.png', 800, 1200, 1800, '3-4 days', '2 days', '24h'),
  ('Bedding', 'Duvet', '/clothes/duvet.png', 2000, 3000, 4500, '4-5 days', '3 days', '48h'),
  ('Bedding', 'Pillow Case', '/clothes/pillow-case.png', 150, 200, 300, '2-3 days', '2 days', '24h'),
  ('Household', 'Towel', '/clothes/towel.png', 600, 1000, 1800, '2-3 days', '2 days', '24h'),
  ('Household', 'Small Center Rug', '/clothes/small-center-rug.png', 3000, 6000, null, '4-5 days', '3 days', null),
  ('Household', 'Big Center Rug', '/clothes/big-center-rug.png', 5000, 10000, null, '4-5 days', '3 days', null),
  ('Special Care', 'Wedding Gown', '/clothes/wedding-dress.png', null, 10000, 25000, null, '4 days', '72h'),
  ('Special Care', 'Shoe', '/clothes/shoes.png', 1000, 1500, 3500, '3-4 days', '2 days', '24h'),
  ('Special Care', 'Small Teddy Bear', '/clothes/small-teddy-bear.png', 1500, 2500, null, '3-4 days', '2 days', null),
  ('Special Care', 'Big Teddy Bear', '/clothes/big-teddy-bear.png', 3500, 6000, null, '4-5 days', '3 days', null),
  ('Accessories', 'Hat / Cap', '/clothes/cap.png', 300, 400, 600, '2-3 days', '2 days', '24h'),
  ('Accessories', 'Scarf', '/clothes/ties-and-scarves.png', 200, 300, 400, '2-3 days', '2 days', '24h'),
  ('Accessories', 'Tie', '/clothes/ties-and-scarves.png', 200, 300, 400, '2-3 days', '2 days', '24h'),
  ('Accessories', 'Handkerchief', '/clothes/ties-and-scarves.png', 200, 300, 400, '2-3 days', '2 days', '24h'),
  ('Accessories', 'Stockings', '/clothes/ties-and-scarves.png', 200, 300, 400, '2-3 days', '2 days', '24h'),
  ('Accessories', 'School Bags', '/clothes/school-bag.png', 1000, 2000, 2500, '3-4 days', '2 days', '24h'),
  ('Accessories', 'Traveling Bags', '/clothes/travel-bag.png', 1500, 3000, 3500, '3-4 days', '2 days', '24h')
) as v(category_name, name, thumbnail_url, price_regular, price_white, price_express, time_regular, time_white, time_express)
join clothing_categories c on c.name = v.category_name;

insert into delivery_zones (name, pickup_fee, delivery_fee) values
  ('Lomalinda Extension', 1500, 1500),
  ('Independence Layout', 2500, 2500),
  ('Uwani', 2500, 2500),
  ('Asata', 2500, 2500),
  ('GRA', 2500, 2500),
  ('Holy Ghost', 2500, 2500),
  ('New Haven', 3000, 3000),
  ('Ugwuaji', 3000, 3000),
  ('Gariki', 3000, 3000),
  ('Achara', 3000, 3000);

insert into promo_banners (id, title, subtitle, image_url, link_url, is_active) values
  ('banner-main', 'Welcome Offer', '20% off your first service', null, '/order', true);

-- ── Order creation (server-side pricing) ─────────────────────────────────
-- The only way orders are created: prices every line from clothing_items and the delivery fee
-- from delivery_zones, so the client only chooses items/tiers/quantities. See
-- security-hardening-migration.sql for the reasoning.

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

-- ── Profile privilege guard ──────────────────────────────────────────────

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

-- ── Abuse limits ─────────────────────────────────────────────────────────
-- Per-customer rate limits and size limits (staff and the service role are exempt). See
-- abuse-limits-migration.sql for the reasoning.

-- ── Shared helpers ───────────────────────────────────────────────────────

-- True when the current request comes from a signed-in non-staff user — the only callers limited.
create or replace function is_limited_caller() returns boolean
language sql stable security definer set search_path = public
as $$
  select auth.uid() is not null and not is_admin();
$$;

-- Accepts base64 data-URL images of a reasonable size. SVG is excluded because it can carry script.
create or replace function is_acceptable_image_data_url(url text) returns boolean
language sql immutable
as $$
  select url ~ '^data:image/(png|jpe?g|gif|webp|heic|heif);base64,' and length(url) <= 1500000;
$$;

-- ── Orders: 10 per hour ──────────────────────────────────────────────────

create or replace function limit_new_orders() returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if is_limited_caller()
     and (select count(*) from orders where user_id = new.user_id and created_at > now() - interval '1 hour') >= 10 then
    raise exception 'You''ve placed a lot of orders in the last hour. Please wait a while and try again, or contact us.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_limit_new_orders on orders;
create trigger trg_limit_new_orders
  before insert on orders
  for each row execute function limit_new_orders();

-- ── Order photos ─────────────────────────────────────────────────────────

create or replace function check_order_image() returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if is_limited_caller() then
    if not is_acceptable_image_data_url(new.image_url) then
      raise exception 'Photos must be JPG, PNG, GIF, WebP or HEIC images under 1MB.';
    end if;
    if not exists (select 1 from orders where id = new.order_id and created_at > now() - interval '30 minutes') then
      raise exception 'Photos can only be added while placing an order.';
    end if;
    if (select count(*) from order_images where order_id = new.order_id) >= 10 then
      raise exception 'You can attach up to 10 photos per order.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_check_order_image on order_images;
create trigger trg_check_order_image
  before insert on order_images
  for each row execute function check_order_image();

-- ── Support tickets: 5 per hour, sane sizes ──────────────────────────────

create or replace function check_new_ticket() returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if is_limited_caller() then
    if length(new.subject) > 200 then
      raise exception 'Please keep the subject under 200 characters.';
    end if;
    if length(new.description) > 5000 then
      raise exception 'Please keep the description under 5,000 characters.';
    end if;
    if new.photo_url is not null and not is_acceptable_image_data_url(new.photo_url) then
      raise exception 'Photos must be JPG, PNG, GIF, WebP or HEIC images under 1MB.';
    end if;
    if (select count(*) from complaint_tickets where user_id = new.user_id and created_at > now() - interval '1 hour') >= 5 then
      raise exception 'You''ve opened several tickets in the last hour. Please wait a while, or add to an existing ticket.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_check_new_ticket on complaint_tickets;
create trigger trg_check_new_ticket
  before insert on complaint_tickets
  for each row execute function check_new_ticket();

-- ── Ticket messages: 30 per hour, sane sizes ─────────────────────────────

create or replace function check_new_ticket_message() returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if is_limited_caller() then
    if length(new.message) > 5000 then
      raise exception 'Please keep your message under 5,000 characters.';
    end if;
    if length(new.author_name) > 100 then
      raise exception 'Name is too long.';
    end if;
    if (
      select count(*)
      from ticket_messages m
      join complaint_tickets t on t.id = m.ticket_id
      where t.user_id = auth.uid() and m.author_role = 'customer' and m.created_at > now() - interval '1 hour'
    ) >= 30 then
      raise exception 'You''ve sent a lot of messages in the last hour. Please wait a while before sending more.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_check_new_ticket_message on ticket_messages;
create trigger trg_check_new_ticket_message
  before insert on ticket_messages
  for each row execute function check_new_ticket_message();

-- ── Profiles: sane sizes on the customer-editable fields ─────────────────

create or replace function check_profile_fields() returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if is_limited_caller() then
    if length(new.full_name) > 100 then
      raise exception 'Please keep your name under 100 characters.';
    end if;
    if length(new.phone) > 30 or length(coalesce(new.whatsapp, '')) > 30 then
      raise exception 'Please enter a valid phone number.';
    end if;
    if length(coalesce(new.address, '')) > 500 then
      raise exception 'Please keep your address under 500 characters.';
    end if;
    if length(new.email) > 254 then
      raise exception 'Email address is too long.';
    end if;
  end if;
  return new;
end;
$$;

-- "update of" so staff-only changes (role, notification flags) never trip this.
drop trigger if exists trg_check_profile_fields on profiles;
create trigger trg_check_profile_fields
  before insert or update of full_name, phone, whatsapp, address, email on profiles
  for each row execute function check_profile_fields();

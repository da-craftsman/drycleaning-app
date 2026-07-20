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

create type user_role as enum ('customer', 'admin');
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
  price_regular numeric(10, 2) not null,
  price_white numeric(10, 2) not null,
  price_express numeric(10, 2) not null,
  time_regular text not null,
  time_white text not null,
  time_express text not null,
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

create function is_admin() returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$ language sql security definer stable;

-- profiles: users read/update their own row; admins read all.
create policy "profiles_select_own_or_admin" on profiles for select
  using (id = auth.uid() or is_admin());
create policy "profiles_update_own" on profiles for update
  using (id = auth.uid());
create policy "profiles_insert_own" on profiles for insert
  with check (id = auth.uid());

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

-- orders: customers insert + read their own; admins full CRUD.
-- Customers can never insert/update their way to payment_status = 'paid' — that flip only ever
-- happens server-side, from the verify-payment Edge Function using the service role key, after it
-- has independently confirmed a successful transaction with Paystack. This is what makes the
-- "paid" status trustworthy: it can't be set by anything running in the customer's browser.
create policy "orders_select_own_or_admin" on orders for select
  using (user_id = auth.uid() or is_admin());
create policy "orders_insert_own" on orders for insert
  with check (user_id = auth.uid() and payment_status = 'pending');
create policy "orders_update_own_or_admin" on orders for update
  using (user_id = auth.uid() or is_admin())
  with check (is_admin() or (user_id = auth.uid() and payment_status = 'pending'));
create policy "orders_admin_delete" on orders for delete using (is_admin());

-- order_items / order_images: follow the parent order's visibility.
create policy "order_items_via_order" on order_items for select
  using (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin())));
create policy "order_items_insert_via_order" on order_items for insert
  with check (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin())));
create policy "order_images_via_order" on order_images for select
  using (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin())));
create policy "order_images_insert_via_order" on order_images for insert
  with check (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin())));
create policy "order_status_history_via_order" on order_status_history for select
  using (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin())));
create policy "order_status_history_insert_via_order" on order_status_history for insert
  with check (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin())));

-- complaint_tickets / ticket_messages: owner + admin.
create policy "tickets_select_own_or_admin" on complaint_tickets for select
  using (user_id = auth.uid() or is_admin());
create policy "tickets_insert_own" on complaint_tickets for insert
  with check (user_id = auth.uid());
create policy "tickets_update_own_or_admin" on complaint_tickets for update
  using (user_id = auth.uid() or is_admin());
create policy "ticket_messages_via_ticket" on ticket_messages for select
  using (exists (select 1 from complaint_tickets t where t.id = ticket_id and (t.user_id = auth.uid() or is_admin())));
create policy "ticket_messages_insert_via_ticket" on ticket_messages for insert
  with check (exists (select 1 from complaint_tickets t where t.id = ticket_id and (t.user_id = auth.uid() or is_admin())));

-- blog_posts: public read of published posts, admin full access.
create policy "blog_public_read_published" on blog_posts for select
  using (published_at is not null or is_admin());
create policy "blog_admin_write" on blog_posts for all using (is_admin()) with check (is_admin());

-- ── Storage bucket policies ─────────────────────────────────────────────
-- Create the buckets first (Dashboard → Storage, or supabase CLI), then apply:
--
--   thumbnails bucket: public read, admin write
--     create policy "thumbnails_public_read" on storage.objects for select
--       using (bucket_id = 'thumbnails');
--     create policy "thumbnails_admin_write" on storage.objects for insert
--       with check (bucket_id = 'thumbnails' and is_admin());
--
--   stain_photos bucket: owner read/write (path prefixed with their own uid), admin read
--     create policy "stain_photos_own_rw" on storage.objects for all
--       using (bucket_id = 'stain_photos' and (auth.uid()::text = (storage.foldername(name))[1] or is_admin()))
--       with check (bucket_id = 'stain_photos' and auth.uid()::text = (storage.foldername(name))[1]);

-- ── Seed data ────────────────────────────────────────────────────────────

insert into clothing_categories (name, display_order) values
  ('Everyday Wear', 1),
  ('Corporate', 2),
  ('Native Wear', 3),
  ('Women''s', 4),
  ('Bedding', 5),
  ('Household', 6),
  ('Special Care', 7),
  ('Accessories', 8);

-- thumbnail_url values point at /clothes/<file>.png, served from the frontend's public/ folder —
-- if serving items from Supabase directly, upload the same files to the `thumbnails` bucket and
-- update these to the bucket's public URLs instead.
insert into clothing_items (category_id, name, thumbnail_url, price_regular, price_white, price_express, time_regular, time_white, time_express)
select c.id, v.name, v.thumbnail_url, v.price_regular, v.price_white, v.price_express, v.time_regular, v.time_white, v.time_express
from (values
  ('Everyday Wear', 'Shirts & Tops', '/clothes/shirts-and-tops.png', 800, 1000, 1600, '3-4 days', '2 days', '24h'),
  ('Everyday Wear', 'Jeans', '/clothes/jeans.png', 1200, 1500, 2200, '3-4 days', '2 days', '24h'),
  ('Everyday Wear', 'Singlet', '/clothes/singlet.png', 500, 650, 1000, '2-3 days', '2 days', '24h'),
  ('Everyday Wear', 'Sweater', '/clothes/sweater.png', 1400, 1700, 2500, '3-4 days', '2 days', '24h'),
  ('Everyday Wear', 'Tracksuit (2-Piece)', '/clothes/tracksuit-two-piece.png', 1800, 2200, 3200, '3-4 days', '2 days', '24h'),
  ('Everyday Wear', 'Skirt or Shorts', '/clothes/skirt-or-shorts.png', 800, 1000, 1600, '2-3 days', '2 days', '24h'),
  ('Corporate', 'Men''s Suit', '/clothes/mens-suit.png', 4500, 5200, 7000, '4-5 days', '3 days', '48h'),
  ('Corporate', 'Ladies'' Suit', '/clothes/ladies-suit.png', 4200, 4900, 6600, '4-5 days', '3 days', '48h'),
  ('Corporate', 'Suit Jacket', '/clothes/suit-jacket.png', 2200, 2600, 3600, '3-4 days', '2 days', '24h'),
  ('Corporate', 'Trousers', '/clothes/trousers.png', 1100, 1400, 2100, '3-4 days', '2 days', '24h'),
  ('Corporate', 'Lab Coat', '/clothes/lab-coat.png', 1300, 1600, 2400, '3-4 days', '2 days', '24h'),
  ('Native Wear', 'Agbada', '/clothes/agbada.png', 5000, 5800, 7800, '4-5 days', '3 days', '48h'),
  ('Native Wear', 'Buba and Wrapper', '/clothes/buba-and-wrapper.png', 2600, 3100, 4300, '4-5 days', '3 days', '48h'),
  ('Native Wear', 'Jalabia', '/clothes/jalabia.png', 2000, 2400, 3400, '3-4 days', '2 days', '24h'),
  ('Native Wear', 'Senator Wear', '/clothes/senator-wear.png', 2800, 3300, 4600, '3-4 days', '2 days', '24h'),
  ('Native Wear', 'Isiagu', '/clothes/isiagu.png', 2200, 2600, 3600, '3-4 days', '2 days', '24h'),
  ('Women''s', 'Blouse', '/clothes/blouse.png', 900, 1150, 1800, '3-4 days', '2 days', '24h'),
  ('Women''s', 'Evening Gown', '/clothes/evening-gown.png', 2800, 3300, 4600, '4-5 days', '3 days', '48h'),
  ('Women''s', 'Skirt and Blouse Set', '/clothes/skirt-and-blouse.png', 1500, 1850, 2700, '3-4 days', '2 days', '24h'),
  ('Bedding', 'Bedspread', '/clothes/bedspread.png', 2200, 2700, 3800, '3-4 days', '2 days', '24h'),
  ('Bedding', 'Duvet', '/clothes/duvet.png', 3500, 4200, 6000, '4-5 days', '3 days', '48h'),
  ('Bedding', 'Pillow Case', '/clothes/pillow-case.png', 400, 550, 900, '2-3 days', '2 days', '24h'),
  ('Household', 'Curtain (Single Panel)', '/clothes/curtain-single-panel.png', 2000, 2400, 3400, '4-5 days', '3 days', '48h'),
  ('Household', 'Curtain (Double Panel)', '/clothes/curtain-double-panel.png', 3400, 4000, 5600, '4-5 days', '3 days', '48h'),
  ('Household', 'Center Rug (Large)', '/clothes/big-center-rug.png', 3200, 3800, 5200, '4-5 days', '3 days', '48h'),
  ('Household', 'Center Rug (Small)', '/clothes/small-center-rug.png', 1800, 2200, 3200, '3-4 days', '2 days', '24h'),
  ('Household', 'Towel', '/clothes/towel.png', 700, 900, 1400, '2-3 days', '2 days', '24h'),
  ('Special Care', 'Wedding Dress', '/clothes/wedding-dress.png', 8000, 9500, 13000, '5-6 days', '4 days', '72h'),
  ('Special Care', 'Shoes', '/clothes/shoes.png', 1800, 2200, 3200, '3-4 days', '2 days', '24h'),
  ('Special Care', 'Teddy Bear (Large)', '/clothes/big-teddy-bear.png', 2200, 2700, 3800, '3-4 days', '2 days', '24h'),
  ('Special Care', 'Teddy Bear (Small)', '/clothes/small-teddy-bear.png', 1200, 1500, 2200, '2-3 days', '2 days', '24h'),
  ('Accessories', 'Cap', '/clothes/cap.png', 400, 550, 900, '2-3 days', '2 days', '24h'),
  ('Accessories', 'Ties and Scarves', '/clothes/ties-and-scarves.png', 600, 750, 1200, '2-3 days', '2 days', '24h'),
  ('Accessories', 'School Bag', '/clothes/school-bag.png', 1200, 1500, 2200, '3-4 days', '2 days', '24h'),
  ('Accessories', 'Travel Bag', '/clothes/travel-bag.png', 1600, 2000, 2900, '3-4 days', '2 days', '24h')
) as v(category_name, name, thumbnail_url, price_regular, price_white, price_express, time_regular, time_white, time_express)
join clothing_categories c on c.name = v.category_name;

insert into delivery_zones (name, pickup_fee, delivery_fee) values
  ('Independence Layout', 2500, 2500),
  ('New Haven', 2500, 2500),
  ('Trans-Ekulu', 2500, 2500),
  ('GRA', 2500, 2500),
  ('Achara Layout', 2500, 2500),
  ('Abakpa Nike', 2500, 2500),
  ('Uwani', 2500, 2500),
  ('Coal Camp', 2500, 2500);

insert into promo_banners (id, title, subtitle, image_url, link_url, is_active) values
  ('banner-main', 'Welcome Offer', '20% off your first service', null, '/order', true);

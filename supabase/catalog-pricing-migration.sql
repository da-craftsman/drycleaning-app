-- Catalog pricing migration — real business price list (2026-07-21).
-- Run against the real Supabase project in the SQL editor. Safe to run more than once.
-- Unlike admin-roles-migration.sql, this can run as a single script (no enum, no
-- same-transaction restriction) — no need to split it into separate executions.
--
-- What this does:
--   1. Allows "not offered" tiers: price_regular/price_white/price_express and their matching
--      time_* columns become nullable. Null means that tier isn't sold for the item at all
--      (e.g. a rug with no express option) — the app now treats null as "hide this tier", not ₦0.
--   2. Renames + re-prices every existing catalog item that has a direct match on the new price
--      sheet (e.g. "Men's Suit" -> "Complete Male Suit").
--   3. Inserts items that are new on the sheet with no old counterpart (Up and Down, Cotton
--      (Single)/(Double), Gown, Skirt, Shorts, Boxers, Scarf, Tie, Handkerchief, Stockings).
--   4. Hides (is_active = false, never deletes) anything from the old catalog that isn't on the
--      new sheet at all — deleting risks an FK violation against historical order_items.
--
-- Two known gaps in the source price sheet, resolved as noted (flag if wrong, editable anytime
-- from /admin/catalog):
--   - "Traveling Bags" listed Normal 1500 / White 3500 / Express 3000 (express below white,
--     inconsistent with every other row) — treated as a White/Express column swap and corrected
--     to Normal 1500 / White 3000 / Express 3500.
--   - "One Cotton" / "Double Cotton" and "Native" / "Up and Down" are filed under Native Wear as
--     distinct items — recategorize later if that assumption is wrong.

-- ── Step 1: allow "not offered" tiers ───────────────────────────────────────

alter table clothing_items alter column price_regular drop not null;
alter table clothing_items alter column price_white drop not null;
alter table clothing_items alter column price_express drop not null;
alter table clothing_items alter column time_regular drop not null;
alter table clothing_items alter column time_white drop not null;
alter table clothing_items alter column time_express drop not null;

-- ── Step 2: rename + re-price items that already exist under an old name ───

with updates(old_name, category_name, new_name, price_regular, price_white, price_express, time_regular, time_white, time_express) as (
  values
    ('Men''s Suit', 'Corporate', 'Complete Male Suit', 3500, 4500, 8000, '4-5 days', '3 days', '48h'),
    ('Ladies'' Suit', 'Corporate', 'Female Suit', 3000, 4000, 7000, '4-5 days', '3 days', '48h'),
    ('Suit Jacket', 'Corporate', 'Suit Jacket', 800, 1000, 2000, '3-4 days', '2 days', '24h'),
    ('Agbada', 'Native Wear', 'Complete Agbada', 2000, 2800, 5000, '4-5 days', '3 days', '48h'),
    ('Jeans', 'Everyday Wear', 'Jeans Trouser', 500, 700, 1200, '3-4 days', '2 days', '24h'),
    ('Trousers', 'Corporate', 'Plain Trouser', 450, 600, 1200, '3-4 days', '2 days', '24h'),
    ('Shirts & Tops', 'Everyday Wear', 'Shirt / Polo', 350, 500, 1000, '2-3 days', '2 days', '24h'),
    ('Senator Wear', 'Native Wear', 'Senator Wears', 1000, 1500, 2000, '3-4 days', '2 days', '24h'),
    ('Jalabia', 'Native Wear', 'Jalabia', 500, 800, 1200, '3-4 days', '2 days', '24h'),
    ('Lab Coat', 'Corporate', 'Labcoat', 500, null, 1000, '3-4 days', null, '24h'),
    ('Sweater', 'Everyday Wear', 'Sweater', 500, 800, 1200, '3-4 days', '2 days', '24h'),
    ('Buba and Wrapper', 'Native Wear', 'Buba and Wrapper', 800, 1500, 2000, '4-5 days', '3 days', '48h'),
    ('Skirt and Blouse Set', 'Women''s', 'Skirt and Blouse', 800, 1500, 2000, '3-4 days', '2 days', '24h'),
    ('Bedspread', 'Bedding', 'Bedspread', 800, 1200, 1800, '3-4 days', '2 days', '24h'),
    ('Duvet', 'Bedding', 'Duvet', 2000, 3000, 4500, '4-5 days', '3 days', '48h'),
    ('Pillow Case', 'Bedding', 'Pillow Case', 150, 200, 300, '2-3 days', '2 days', '24h'),
    ('Towel', 'Household', 'Towel', 600, 1000, 1800, '2-3 days', '2 days', '24h'),
    ('Wedding Dress', 'Special Care', 'Wedding Gown', null, 10000, 25000, null, '4 days', '72h'),
    ('Singlet', 'Everyday Wear', 'Singlet', 250, 300, 500, '2-3 days', '2 days', '24h'),
    ('Cap', 'Accessories', 'Hat / Cap', 300, 400, 600, '2-3 days', '2 days', '24h'),
    ('School Bag', 'Accessories', 'School Bags', 1000, 2000, 2500, '3-4 days', '2 days', '24h'),
    ('Travel Bag', 'Accessories', 'Traveling Bags', 1500, 3000, 3500, '3-4 days', '2 days', '24h'),
    ('Center Rug (Small)', 'Household', 'Small Center Rug', 3000, 6000, null, '4-5 days', '3 days', null),
    ('Center Rug (Large)', 'Household', 'Big Center Rug', 5000, 10000, null, '4-5 days', '3 days', null),
    ('Teddy Bear (Small)', 'Special Care', 'Small Teddy Bear', 1500, 2500, null, '3-4 days', '2 days', null),
    ('Teddy Bear (Large)', 'Special Care', 'Big Teddy Bear', 3500, 6000, null, '4-5 days', '3 days', null),
    ('Shoes', 'Special Care', 'Shoe', 1000, 1500, 3500, '3-4 days', '2 days', '24h')
)
update clothing_items ci
set name = u.new_name,
    category_id = c.id,
    price_regular = u.price_regular,
    price_white = u.price_white,
    price_express = u.price_express,
    time_regular = u.time_regular,
    time_white = u.time_white,
    time_express = u.time_express
from updates u
join clothing_categories c on c.name = u.category_name
where ci.name = u.old_name;

-- ── Step 3: insert items that are new on the sheet (no old counterpart) ────

insert into clothing_items (category_id, name, thumbnail_url, price_regular, price_white, price_express, time_regular, time_white, time_express)
select c.id, v.name, v.thumbnail_url, v.price_regular, v.price_white, v.price_express, v.time_regular, v.time_white, v.time_express
from (values
  ('Native Wear', 'Up and Down', '/clothes/senator-wear.png', 800, 1500, 1800, '3-4 days', '2 days', '24h'),
  ('Native Wear', 'Native', '/clothes/senator-wear.png', 800, 1500, 1800, '3-4 days', '2 days', '24h'),
  ('Native Wear', 'Cotton (Single)', '/clothes/buba-and-wrapper.png', 500, 700, 1000, '3-4 days', '2 days', '24h'),
  ('Native Wear', 'Cotton (Double)', '/clothes/buba-and-wrapper.png', 800, 1000, 1500, '3-4 days', '2 days', '24h'),
  ('Women''s', 'Gown', '/clothes/evening-gown.png', 400, 600, 1000, '3-4 days', '2 days', '24h'),
  ('Women''s', 'Skirt', '/clothes/skirt-or-shorts.png', 400, 500, 1000, '2-3 days', '2 days', '24h'),
  ('Everyday Wear', 'Shorts', '/clothes/skirt-or-shorts.png', 400, 600, 1000, '2-3 days', '2 days', '24h'),
  ('Everyday Wear', 'Boxers', '/clothes/singlet.png', 300, 400, 600, '2-3 days', '2 days', '24h'),
  ('Accessories', 'Scarf', '/clothes/ties-and-scarves.png', 200, 300, 400, '2-3 days', '2 days', '24h'),
  ('Accessories', 'Tie', '/clothes/ties-and-scarves.png', 200, 300, 400, '2-3 days', '2 days', '24h'),
  ('Accessories', 'Handkerchief', '/clothes/ties-and-scarves.png', 200, 300, 400, '2-3 days', '2 days', '24h'),
  ('Accessories', 'Stockings', '/clothes/ties-and-scarves.png', 200, 300, 400, '2-3 days', '2 days', '24h')
) as v(category_name, name, thumbnail_url, price_regular, price_white, price_express, time_regular, time_white, time_express)
join clothing_categories c on c.name = v.category_name
where not exists (select 1 from clothing_items ci where ci.name = v.name);

-- ── Step 4: hide old-catalog items that aren't on the new sheet at all ─────

update clothing_items
set is_active = false
where is_active = true
  and name not in (
    'Shirt / Polo', 'Jeans Trouser', 'Shorts', 'Singlet', 'Boxers', 'Sweater',
    'Complete Male Suit', 'Female Suit', 'Suit Jacket', 'Plain Trouser', 'Labcoat',
    'Complete Agbada', 'Buba and Wrapper', 'Jalabia', 'Senator Wears', 'Up and Down', 'Native',
    'Cotton (Single)', 'Cotton (Double)',
    'Gown', 'Skirt and Blouse', 'Skirt',
    'Bedspread', 'Duvet', 'Pillow Case',
    'Towel', 'Small Center Rug', 'Big Center Rug',
    'Wedding Gown', 'Shoe', 'Small Teddy Bear', 'Big Teddy Bear',
    'Hat / Cap', 'Scarf', 'Tie', 'Handkerchief', 'Stockings', 'School Bags', 'Traveling Bags'
  );

-- ── Verify ───────────────────────────────────────────────────────────────
-- select name, price_regular, price_white, price_express, is_active from clothing_items order by is_active desc, name;

-- Adds the "Children's Wear" catalog category — run against the real Supabase project in the SQL
-- editor. Safe to run more than once. No items are seeded under it yet; add them from
-- /admin/catalog once real children's-wear items and pricing are available.

insert into clothing_categories (name, display_order)
select 'Children''s Wear', coalesce((select max(display_order) from clothing_categories), 0) + 1
where not exists (select 1 from clothing_categories where name = 'Children''s Wear');

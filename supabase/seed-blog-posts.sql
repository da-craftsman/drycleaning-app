-- One-off seed for the 3 launch blog posts (2026-07-21, revised to remove em dashes) -- see src/lib/data/mock/seed.ts for the source of truth.
insert into blog_posts (title, slug, excerpt, content, category, seo_description, published_at) values
  ('How to Care for Native Wear Between Washes', 'how-to-care-for-native-wear', 'Agbada, Isiagu, and George wrappers need a gentler touch. Here is what to do at home.', 'Native wear like Agbada, Isiagu, and George wrappers are usually the most expensive pieces in anyone''s wardrobe, and they''re built from fabrics (heavy brocade, lace, hand-embroidered cotton) that don''t behave like an everyday shirt. Getting a few habits right between professional cleans keeps them looking sharp for years instead of a couple of outings.

Hang, don''t fold, whenever you can. Brocade and heavily embroidered fabric creases in a way that''s hard to fully press out, and a fold line across an embroidered panel is one of the more common ways these pieces get damaged. A padded or wide hanger keeps the shoulders and embroidery from stressing at a single point.

Air it out before you store it. Native wear picks up smoke, perfume, and body odor over a full event, and sealing that into a wardrobe or garment bag right away just sets it in. Let it hang in open air for a few hours first.

Spot-clean sweat and stains immediately, but don''t scrub. Heavy fabrics with embroidery or stone work can''t take the kind of aggressive scrubbing that gets a stain out of cotton. Blot gently with a clean, barely damp cloth and let the rest wait for a proper wash. Scrubbing at home is one of the fastest ways to loosen embroidery threads or dull beadwork.

Don''t iron directly on embroidery or stones. If you''re touching up a piece yourself between cleans, iron from the reverse side, or place a thin cloth over decorated panels first. Direct heat on stonework or metallic thread can melt adhesive backing or flatten the texture permanently.

When it''s time for an actual wash, that''s where we come in: native wear gets sorted and treated according to its specific fabric here, not run through a one-size-fits-all cycle, which is exactly the kind of care pieces like these need.', 'Fabric Care', 'Tips for caring for native wear like Agbada and Isiagu between professional washes.', '2026-07-01T09:23:29.760Z'),
  ('5 Signs Your Suit Needs Professional Cleaning', '5-signs-your-suit-needs-professional-cleaning', 'Don''t wait for visible stains, here''s when to send your suit in.', 'Most people only think about sending a suit in for cleaning once there''s a stain on it. By then, you''ve usually already missed a few earlier signs that it needed attention. Here''s what to actually watch for.

1. It holds onto odor after airing out. A suit that still smells faintly of the office, a restaurant, or a long day even after hanging overnight has absorbed more than it can shake off on its own. Odor sits deep in the fibers of wool and wool-blend suiting in a way that airing alone won''t fix.

2. The fabric has started to shine, especially at the elbows, seat, and knees. That shine is friction wearing down the fibers, and it''s usually made worse by ironing at home with too much heat. A professional press brings back the texture instead of flattening it further.

3. It doesn''t hang or sit right anymore. If your jacket looks slightly misshapen on a hanger, or trousers won''t hold a crease the way they used to, the fabric has lost structure, often from sweat and body oils breaking down the weave over repeated wears without a proper clean in between.

4. There''s a stain you can''t identify, or one that''s already been there a while. Older stains (sweat, deodorant, food oil) oxidize and set into the fabric over time, and they get genuinely harder to lift the longer they sit. If you can''t tell what it is or how long it''s been there, that''s exactly the kind of thing that needs an expert eye rather than a home remedy.

5. It''s been worn more than 3–4 times without a clean. Even with no visible stain or odor, a suit worn this many times has accumulated enough oil and dust in the fibers to start affecting both how it drapes and how long it''ll last. Regular cleaning on a schedule, not just when something''s visibly wrong, is what keeps a good suit good for years.

We treat suits and suit jackets as their own category here, with pricing and turnaround built specifically for corporate wear, so it''s worth sending yours in before any of these five turn into a bigger problem.', 'Corporate Wear', 'Learn the signs that your suit needs professional laundry care.', '2026-07-11T09:23:29.768Z'),
  ('Express vs Regular: Which Service Tier Fits Your Schedule?', 'express-vs-regular-service-tiers', 'A breakdown of our three service tiers and when each one makes sense.', 'Every item in our catalog comes in three service tiers (Regular, White Wash, and Express), and picking the right one is really just a question of timing and fabric, not which one is "better." Here''s how to think about it.

Regular is the default, and it''s the right call for most everyday laundry: shirts, jeans, everyday wear, bedding, household items. It runs on a 2–5 day turnaround depending on the item, and it covers a full, thorough wash-and-press without paying a premium for speed you don''t need. If you''re planning ahead, restocking your work wardrobe for the week or handling a routine load, this is the tier to reach for.

White Wash is a separate tier, not just "Regular but for white clothes." It uses a gentler process built around keeping whites bright and delicates intact: think white shirts, light fabrics, anything where the wrong detergent or a rough cycle risks yellowing or fading. It''s priced a step above Regular and turns around faster too, in about 2 days across most items, because the process itself is more controlled.

Express is for when you''re actually up against the clock: a suit you need for tomorrow''s meeting, an outfit for an event this weekend that you only just remembered about. Everything in Express is guaranteed within 24–72 hours depending on the item, at a higher price point that reflects the priority handling, not a shortcut in quality. It''s not meant for routine use; it''s meant for the specific week something can''t wait.

A simple way to decide: if you''re planning more than a few days ahead, Regular saves you money for the same result. If it''s whites or delicates specifically, White Wash protects the fabric better than a generic cycle would. And if the calendar''s the problem, not the fabric, Express is what closes that gap.

You can mix tiers within a single order too: express the shirt you need tomorrow, regular everything else, so you''re never overpaying just because one item in the load is urgent.', 'Guides', 'Compare Regular, White Wash, and Express laundry service tiers.', '2026-07-18T09:23:29.768Z')
on conflict (slug) do update set title = excluded.title, excerpt = excluded.excerpt, content = excluded.content, category = excluded.category, seo_description = excluded.seo_description, published_at = excluded.published_at;

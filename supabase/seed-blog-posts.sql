-- Launch blog posts, SEO revision (2026-10-10): keyword-focused titles, 140-160 char SEO descriptions,
-- H2 structure, internal links to service pages, and two new posts targeting "home pick up and delivery
-- laundry" and "laundry in Enugu". Source of truth: src/lib/data/mock/seed.ts (same content).
-- Safe to re-run: upserts on slug, so existing posts keep their URLs. feature_image is deliberately not
-- touched, so images uploaded from /admin/blog are kept.
insert into blog_posts (title, slug, excerpt, content, category, seo_description, published_at) values
  ('How to Care for Native Wear Between Washes: Agbada & Isiagu', 'how-to-care-for-native-wear', 'Agbada, Isiagu, Senator and George wrappers need a gentler touch. Here are five habits that keep native wear looking sharp between professional cleans.', '<p>Native wear like Agbada, Isiagu, Senator and George wrappers are usually the most expensive pieces in anyone''s wardrobe, and they are built from fabrics (heavy brocade, lace, hand-embroidered cotton) that don''t behave like an everyday shirt. Getting a few habits right between professional cleans keeps them looking sharp for years instead of a couple of outings. Here is the routine we recommend to customers across Enugu.</p>
<h2>1. Hang, don''t fold</h2>
<p>Brocade and heavily embroidered fabric creases in a way that''s hard to fully press out, and a fold line across an embroidered panel is one of the more common ways these pieces get damaged. A padded or wide hanger keeps the shoulders and embroidery from stressing at a single point.</p>
<h2>2. Air it out before you put it away</h2>
<p>Native wear picks up smoke, perfume and body odour over a full event, and sealing that into a wardrobe or garment bag right away just sets it in. Let it hang in open air, out of direct sun, for a few hours first.</p>
<h2>3. Spot-clean sweat and stains, but never scrub</h2>
<p>Heavy fabrics with embroidery or stone work can''t take the kind of aggressive scrubbing that gets a stain out of cotton. Blot gently with a clean, barely damp cloth and let the rest wait for a proper wash. Scrubbing at home is one of the fastest ways to loosen embroidery threads or dull beadwork. For anything stubborn, our <a href="/services/stain-removal">stain removal service</a> assesses the fabric before any treatment begins.</p>
<h2>4. Don''t iron directly on embroidery or stones</h2>
<p>If you''re touching up a piece yourself between cleans, iron from the reverse side, or place a thin cloth over decorated panels first. Direct heat on stonework or metallic thread can melt adhesive backing or flatten the texture permanently.</p>
<h2>5. Store it in breathable fabric, not plastic</h2>
<p>Plastic covers trap moisture, and in the rainy season that is an open invitation to mildew and yellowing. Use a cotton garment bag or an old clean bedsheet, keep the piece out of direct sunlight to prevent fading, and give it room in the wardrobe so the embroidery isn''t crushed.</p>
<h2>When to send native wear for professional cleaning</h2>
<p>Send it in after any event where you sweated heavily, got a stain, or wore it for a full day, and always before storing it for a long time. At Shalah Rex Laundry, native wear is sorted and treated according to its specific fabric as part of our <a href="/services/clothing-care">clothing care service</a>, not run through a one-size-fits-all cycle. If you''re in Enugu, you don''t even have to bring it in: book <a href="/services/pickup-dropoff">home pick up and delivery</a> and we''ll collect it from your door and return it pressed and ready for the next occasion.</p>', 'Fabric Care', 'How to care for native wear like Agbada, Isiagu and George between washes: hanging, airing, spot cleaning, ironing and storage tips from an Enugu laundry.', '2026-07-01T09:23:29.760Z'),
  ('5 Signs Your Suit Needs Professional Dry Cleaning', '5-signs-your-suit-needs-professional-cleaning', 'Don''t wait for a visible stain. These five signs tell you it''s time to send your suit for professional dry cleaning, and how often to do it.', '<p>Most people only think about sending a suit for cleaning once there''s a stain on it. By then, you''ve usually missed a few earlier signs that it needed attention. Whether you wear a suit to the office every day or only for weddings and meetings, here''s what to actually watch for.</p>
<h2>1. It holds onto odour after airing out</h2>
<p>A suit that still smells faintly of the office, a restaurant or a long day even after hanging overnight has absorbed more than it can shake off on its own. Odour sits deep in the fibres of wool and wool-blend suiting in a way that airing alone won''t fix.</p>
<h2>2. The fabric has started to shine</h2>
<p>Watch the elbows, seat and knees. That shine is friction wearing down the fibres, and it''s usually made worse by ironing at home with too much heat. A professional press brings back the texture instead of flattening it further.</p>
<h2>3. It doesn''t hang or sit right anymore</h2>
<p>If your jacket looks slightly misshapen on a hanger, or trousers won''t hold a crease the way they used to, the fabric has lost structure, often from sweat and body oils breaking down the weave over repeated wears without a proper clean in between.</p>
<h2>4. There''s a stain you can''t identify, or an old one</h2>
<p>Older stains (sweat, deodorant, food oil) oxidise and set into the fabric over time, and they get harder to lift the longer they sit. If you can''t tell what it is or how long it''s been there, that''s exactly the kind of thing that needs an expert eye rather than a home remedy.</p>
<h2>5. It''s been worn three or four times without a clean</h2>
<p>Even with no visible stain or odour, a suit worn this many times has collected enough oil and dust in the fibres to affect both how it drapes and how long it lasts. Cleaning on a schedule, not just when something is visibly wrong, is what keeps a good suit good for years.</p>
<h2>How often should you dry clean a suit?</h2>
<p>For a suit in regular rotation, every three to four wears is a good rule, plus a clean before you store it for a while. In between, hang it on a shaped hanger, brush it down, and give it a day''s rest between wears so the fibres can recover.</p>
<h2>Professional suit cleaning in Enugu</h2>
<p>We treat suits and suit jackets as their own category, with pricing and turnaround built for corporate wear. Our <a href="/services/dry-cleaning-ironing">dry cleaning and ironing service</a> uses solvent-based cleaning and hand-finished pressing, and Express turnaround can have your suit ready in 24 to 48 hours. Busy week? Book <a href="/services/pickup-dropoff">home pick up and delivery</a> and we''ll collect it from your home or office anywhere we cover in Enugu.</p>', 'Corporate Wear', 'Five signs your suit needs professional dry cleaning, from lingering odour to shiny fabric, plus how often to clean a suit. Advice from an Enugu laundry.', '2026-07-11T09:23:29.768Z'),
  ('Express vs Regular Laundry: Which Service Fits Your Schedule?', 'express-vs-regular-service-tiers', 'Regular, White Wash or Express? A plain-English breakdown of our three laundry service tiers, their turnaround times, and when each one makes sense.', '<p>Every item in our catalogue comes in three service tiers (Regular, White Wash and Express), and picking the right one is really a question of timing and fabric, not which one is "better". Here''s how to think about it.</p>
<h2>Regular: the everyday choice</h2>
<p>Regular is the default, and it''s the right call for most everyday laundry: shirts, jeans, everyday wear, bedding and household items. It runs on a 2 to 5 day turnaround depending on the item, and covers a full, thorough wash and press without paying a premium for speed you don''t need. If you''re planning ahead, restocking your work wardrobe for the week or handling a routine load, this is the tier to reach for.</p>
<h2>White Wash: for whites and delicates</h2>
<p>White Wash is a separate tier, not just "Regular but for white clothes". It uses a gentler process built around keeping whites bright and delicates intact: white shirts, light fabrics, anything where the wrong detergent or a rough cycle risks yellowing or fading. It''s priced a step above Regular and turns around faster too, in about 2 days for most items, because the process itself is more controlled.</p>
<h2>Express: when the clock is the problem</h2>
<p>Express is for when you''re actually up against the clock: a suit you need for tomorrow''s meeting, or an outfit for an event this weekend that you only just remembered. Express items are ready within 24 to 72 hours depending on the item, at a higher price that reflects the priority handling, not a shortcut in quality. It''s not meant for routine use; it''s meant for the week something can''t wait.</p>
<h2>How to decide in ten seconds</h2>
<ul>
<li><strong>Planning more than a few days ahead?</strong> Regular saves you money for the same result.</li>
<li><strong>Whites or delicates?</strong> White Wash protects the fabric better than a generic cycle.</li>
<li><strong>Need it tomorrow?</strong> Express closes the gap.</li>
</ul>
<h2>Mix tiers in a single order</h2>
<p>You can mix tiers within one order: express the shirt you need tomorrow and send everything else on Regular, so you''re never overpaying just because one item is urgent. Every price is listed per item and per tier on our <a href="/services">services and price list</a>, and with <a href="/services/pickup-dropoff">home pick up and delivery</a> across Enugu, the whole order comes back to your door together.</p>', 'Guides', 'Express vs Regular vs White Wash laundry: compare turnaround times and costs, and learn which service tier fits your schedule and fabrics in Enugu.', '2026-07-18T09:23:29.768Z'),
  ('Home Pick Up and Delivery Laundry in Enugu: How It Works', 'home-pick-up-and-delivery-laundry-enugu', 'Never queue at a laundry again. Here is exactly how home pick up and delivery laundry works with Shalah Rex in Enugu, step by step.', '<p>Between work, traffic and family, very few people in Enugu have a free afternoon to carry a bag of clothes across town and wait at a laundry. That''s why we built Shalah Rex Laundry (Shalarex, to many of our customers) around home pick up and delivery: you book on your phone, we collect from your door, and your clothes come back washed, ironed and folded. Here''s exactly how it works.</p>
<h2>Step 1: Build your order online</h2>
<p>Open the <a href="/order">order page</a> and add your items by category: everyday wear, corporate wear, native wear, bedding, household items and more. For each item you choose a service tier (Regular, White Wash or Express), and you see the exact price before you add it. No guesswork, no surprises at the counter.</p>
<h2>Step 2: Choose how your laundry travels</h2>
<p>At checkout you pick one of four options:</p>
<ul>
<li><strong>Pickup &amp; Delivery:</strong> we collect from your door and bring everything back. This is the full home pick up and delivery laundry service.</li>
<li><strong>Pickup Only:</strong> we collect, you come and get it when it''s ready.</li>
<li><strong>Delivery Only:</strong> you drop off, we deliver it back to you.</li>
<li><strong>Self Drop-off:</strong> bring it to our facility in Lomalinda Extension and collect it yourself. Always free.</li>
</ul>
<p>You then select your area and a pick up window that suits you. A small zone-based fee applies to pick up and delivery, and it''s shown clearly before you pay.</p>
<h2>Step 3: Pay the way you prefer</h2>
<p>Pay securely online by card, bank transfer or USSD through Paystack, or choose cash on delivery.</p>
<h2>Step 4: We pick up and log every item</h2>
<p>Our rider arrives in your window and collects your laundry. Every item is logged at collection and matched again at delivery, so nothing goes missing between your door and ours.</p>
<h2>Step 5: Track your laundry live</h2>
<p>From the moment we collect, you can <a href="/track">track your order</a> through every stage: picked up, in processing, ready, and out for delivery. No calls needed to ask "is it ready yet?".</p>
<h2>Step 6: Delivered fresh to your door</h2>
<p>Your clothes are washed according to their fabric, pressed, folded and delivered back to your home or office. If anything isn''t right, we''ll re-clean it free of charge.</p>
<h2>Which areas of Enugu do you cover?</h2>
<p>We currently offer home pick up and delivery across Lomalinda Extension, Independence Layout, GRA, New Haven, Trans-Ekulu, Uwani, Achara Layout, Asata, Ugwuaji, Gariki, Holy Ghost, Coal Camp, Abakpa Nike, Maryland and Centenary City. If your area isn''t listed, send us a message on WhatsApp and we''ll let you know what we can arrange.</p>
<h2>How long does it take?</h2>
<p>Regular laundry is typically ready in 2 to 5 days depending on the item, White Wash in about 2 days, and Express in as little as 24 hours. Read our guide to <a href="/blog/express-vs-regular-service-tiers">Express vs Regular laundry</a> to choose the right tier.</p>
<h2>Tips for a smooth pick up</h2>
<ul>
<li>Empty all pockets (pens and coins are the most common culprits for damaged loads).</li>
<li>Point out stains when you book, and upload a photo if you can, so our team treats them before washing.</li>
<li>Keep delicate or high-value items in a separate bag and mention them in your order notes.</li>
</ul>
<p>Ready to take laundry off your to-do list? <a href="/order">Book your home pick up</a> in a few minutes, or read more about our <a href="/services/pickup-dropoff">pick up and delivery service</a>.</p>', 'Guides', 'How home pick up and delivery laundry works in Enugu: booking online, pick up options, areas covered, turnaround, fees and payment with Shalah Rex Laundry.', '2026-10-09T08:00:00.000Z'),
  ('How to Choose a Laundry in Enugu: 7 Things to Check', 'how-to-choose-a-laundry-in-enugu', 'Not every laundry treats your clothes the same way. Use these 7 checks to pick an Enugu laundry you can trust with everything from shirts to Agbada.', '<p>Handing over your clothes is an act of trust, especially when the bag includes a favourite suit, a white shirt for Monday, or an Agbada you wore to a wedding. Enugu has plenty of laundries and dry cleaners, but they don''t all work the same way. Before you choose one, check these seven things.</p>
<h2>1. Clear, published prices</h2>
<p>You should know what you''ll pay before you hand anything over. A good laundry publishes a price per item, not a vague estimate at the counter that changes on collection day. See how we do it on our <a href="/services">laundry price list</a>.</p>
<h2>2. Care by fabric, not one cycle for everything</h2>
<p>Cotton, denim, silk, wool and native fabrics each need different water temperatures, detergents and heat. Ask whether items are sorted by fabric and colour before washing. If the answer is "we wash everything together", keep looking.</p>
<h2>3. Honest turnaround times</h2>
<p>"Come back tomorrow" that turns into a week is frustrating. Look for a laundry that tells you how long each service takes and offers an express option when you genuinely need something fast.</p>
<h2>4. Home pick up and delivery</h2>
<p>The best laundry is the one you don''t have to drive to. A home pick up and delivery laundry saves you the trip, the traffic and the waiting. Check which areas they cover and whether the pick up fee is shown upfront.</p>
<h2>5. A way to track your order</h2>
<p>You shouldn''t have to call three times to find out if your clothes are ready. Live order tracking means you always know whether your laundry has been picked up, is being processed, or is on its way back.</p>
<h2>6. A quality guarantee and real support</h2>
<p>Mistakes happen everywhere. What matters is what happens next. Ask whether they will re-clean an item that isn''t right, and how you can raise a complaint about a damaged or missing item.</p>
<h2>7. Payment that suits you</h2>
<p>Card, bank transfer, USSD and cash on delivery should all be on the table, with secure online payment and a proper receipt for every order.</p>
<h2>How Shalah Rex Laundry measures up</h2>
<p>We built Shalah Rex Laundry to tick every box on this list: per-item prices across Regular, White Wash and Express tiers, fabric-by-fabric <a href="/services/clothing-care">clothing care</a>, <a href="/services/pickup-dropoff">home pick up and delivery</a> across Enugu, live order tracking, a free re-clean guarantee, and payment by card, transfer, USSD or cash on delivery. Visit us in Lomalinda Extension, or <a href="/order">book a pick up online</a> and see the difference for yourself.</p>', 'Guides', 'Choosing a laundry in Enugu? Check these 7 things first: fabric care, turnaround, clear pricing, pick up and delivery, tracking, guarantees and payment.', '2026-10-10T08:00:00.000Z')
on conflict (slug) do update set title = excluded.title, excerpt = excluded.excerpt, content = excluded.content, category = excluded.category, seo_description = excluded.seo_description, published_at = excluded.published_at;

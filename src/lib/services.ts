import { Droplet, FlaskConical, PackageCheck, Ruler, ShieldCheck, Scissors, Shirt, Truck, Wand2, Wind } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface ServiceHighlight {
  icon: LucideIcon
  title: string
  body: string
}

export interface ServiceFaq {
  q: string
  a: string
}

export interface ServiceOffering {
  slug: string
  title: string
  /** Short line used on the Services grid and Home page cards. */
  description: string
  image: string
  /** Small pill label at the top of the detail page hero. */
  badge: string
  /** Two-line marketing headline for the detail page hero. */
  heroHeadline: string
  /** Longer supporting paragraph shown under the hero headline. */
  heroDescription: string
  sectionTitle: string
  sectionBody: string
  highlights: [ServiceHighlight, ServiceHighlight]
  whyChooseUs: [string, string, string, string]
  serviceLeadRole: string
  faqs: [ServiceFaq, ServiceFaq, ServiceFaq, ServiceFaq]
}

/** The 6 marketing services offered, shown on Home, Services, and each service detail page. */
export const services: ServiceOffering[] = [
  {
    slug: 'pickup-dropoff',
    title: 'Pickup & Drop-off',
    description: 'A convenient service that brings laundry care directly to your doorstep.',
    image: '/images/services/pickup-dropoff.jpg',
    badge: 'DOOR-TO-DOOR',
    heroHeadline: 'Laundry Day, Delivered to Your Door',
    heroDescription:
      "Skip the trip. We collect your laundry from home or office and bring it back fresh, folded, and ready to wear, on a schedule that works for you.",
    sectionTitle: 'Convenient Collection, Every Time',
    sectionBody:
      "Book a pickup window that fits your day and we handle the rest. Our riders collect from your address, log every item at drop-off, and return your finished laundry right to your door, no queues, no detours.",
    highlights: [
      { icon: Truck, title: 'Scheduled Pickups', body: 'Choose a pickup window that fits around your day.' },
      { icon: PackageCheck, title: 'Item Tracking', body: 'Every piece is logged at collection and matched at delivery.' },
    ],
    whyChooseUs: [
      'Flexible Pickup Windows',
      'Real-Time Order Updates',
      'Safe Handling In Transit',
      'Coverage Across Enugu Zones',
    ],
    serviceLeadRole: 'Logistics Lead',
    faqs: [
      {
        q: 'How do I schedule a pickup?',
        a: "Choose Pickup Only or Pickup & Delivery at checkout, then pick a time window that works for you. We'll confirm before our rider arrives.",
      },
      {
        q: 'What areas do you cover?',
        a: 'We currently pick up and deliver across Independence Layout, New Haven, Lomalinda Extension, Uwani, Ugwuaji, Achara, Asata, Gariki, GRA, and Holy Ghost.',
      },
      {
        q: 'Is there a fee for pickup and delivery?',
        a: 'Yes, a small zone-based fee applies. Self drop-off at our facility is always free.',
      },
      {
        q: 'Can I reschedule a pickup?',
        a: "Yes, contact us via WhatsApp or your account before the pickup window and we'll adjust the schedule for you.",
      },
    ],
  },
  {
    slug: 'clothing-care',
    title: 'Clothing Care',
    description: 'Specialized care for a variety of items, including shirts, dresses, jeans, and traditional attire.',
    image: '/images/services/clothing-care.jpg',
    badge: 'EXPERT CARE',
    heroHeadline: 'Everyday Wear, Cared for Like New',
    heroDescription:
      "From shirts and jeans to Agbada and native wear, our clothing care service treats every fabric with the right wash, the right heat, and the right finish.",
    sectionTitle: 'Tailored Care for Every Fabric',
    sectionBody:
      "Cotton, denim, silk, and native fabrics all behave differently in the wash. Our team sorts and treats each item by fabric type and colour, so your clothes keep their shape, colour, and fit, wash after wash.",
    highlights: [
      { icon: Shirt, title: 'Fabric Sorting', body: 'Every item is grouped by fabric and colour before washing.' },
      { icon: Wind, title: 'Careful Pressing', body: 'Finished with a crisp press so items are ready to wear.' },
    ],
    whyChooseUs: [
      'Fabric-Matched Wash Cycles',
      'Colour-Safe Detergents',
      'Precision Ironing & Folding',
      'Same-Day Express Option',
    ],
    serviceLeadRole: 'Care Team Lead',
    faqs: [
      {
        q: 'What items do you clean?',
        a: 'Shirts, trousers, jeans, native wear like Agbada and Buba, and everyday casual wear. See the full price list on our Services page.',
      },
      {
        q: 'Do you separate colours?',
        a: 'Yes, every load is sorted by fabric type and colour before washing to prevent bleeding or damage.',
      },
      {
        q: "What's the turnaround time?",
        a: 'Regular wash is typically ready in 2 to 4 days, White Wash in 2 days, and Express in as fast as 24 hours.',
      },
      {
        q: 'Do you press and fold my clothes?',
        a: "Yes, every item is finished with a press and neatly folded before it's returned to you.",
      },
    ],
  },
  {
    slug: 'home-textiles',
    title: 'Home Textiles Cleaning',
    description: 'Cleaning services for home fabrics like curtains.',
    image: '/images/services/home-textiles.jpg',
    badge: 'PREMIUM CARE',
    heroHeadline: 'Restore the Freshness of Your Home Textiles',
    heroDescription:
      "Specialized cleaning for your most delicate curtains, luxury bedding, and upholstery. Professional allergen removal with fabric-safe technology.",
    sectionTitle: 'Expert Textile Restoration',
    sectionBody:
      "Your home textiles are an investment in comfort and style. Unlike standard laundry, our specialized home textile process treats every fibre with clinical precision. We handle everything from heavy velvet drapes to delicate Egyptian cotton sheets.",
    highlights: [
      { icon: Wand2, title: 'Fabric-Safe Tech', body: 'Gentle pH-balanced solvents for luxury fabrics.' },
      { icon: ShieldCheck, title: 'Allergen Removal', body: '99.9% removal of dust mites and pollutants.' },
    ],
    whyChooseUs: [
      'Convenient Home Pickup',
      'Expert Fiber Handling',
      'Advanced Stain Protection',
      'Insurance for High-Value Items',
    ],
    serviceLeadRole: 'Service Lead',
    faqs: [
      {
        q: 'How long does it take for curtain cleaning?',
        a: 'Most curtains are ready within 4 to 5 days on Regular, or 48 hours on Express, depending on size and fabric.',
      },
      {
        q: 'Do you handle heavy drapes and blackout curtains?',
        a: 'Yes, our process is suited to heavy drapes, blackout linings, and multi-panel curtains.',
      },
      {
        q: 'Is there a risk of shrinkage?',
        a: 'No, we use fabric-matched, pH-balanced solvents specifically to prevent shrinkage and colour fading.',
      },
      {
        q: 'Do you offer de-installation and re-installation?',
        a: 'Yes, this can be arranged as part of our pickup and delivery service. Just let us know when booking.',
      },
    ],
  },
  {
    slug: 'dry-cleaning-ironing',
    title: 'Dry Cleaning & Ironing',
    description: 'Thorough cleaning services designed for delicate or high-value fabrics.',
    image: '/images/services/dry-cleaning-ironing.jpg',
    badge: 'SPECIALIST CARE',
    heroHeadline: 'Sharp, Polished Results for Delicate Fabrics',
    heroDescription:
      "Suits, gowns, and delicate fabrics need more than a standard wash. Our dry cleaning and ironing service uses solvent-based cleaning and precision pressing to keep them looking their best.",
    sectionTitle: 'Precision Dry Cleaning, Every Garment',
    sectionBody:
      "Delicate fabrics like silk, wool, and structured suits can be damaged by water and heat. We use professional-grade solvents and hand-finished pressing to clean thoroughly while protecting shape, colour, and texture.",
    highlights: [
      { icon: FlaskConical, title: 'Solvent-Based Cleaning', body: 'Gentle on delicate fibers, tough on dirt and odour.' },
      { icon: Shirt, title: 'Hand-Finished Pressing', body: 'Crisp, sharp lines on suits, shirts, and gowns.' },
    ],
    whyChooseUs: [
      'Safe for Silk, Wool & Suits',
      'Odour & Stain Treatment',
      'Hand-Pressed Finish',
      'Ready for Same-Day Wear',
    ],
    serviceLeadRole: 'Dry Cleaning Lead',
    faqs: [
      {
        q: 'What fabrics need dry cleaning instead of washing?',
        a: "Silk, wool, structured suits, and garments labelled 'Dry Clean Only' are best handled with our solvent-based process.",
      },
      {
        q: 'Will dry cleaning remove all stains?',
        a: "Most stains lift fully, but very old or set-in stains may fade rather than disappear completely. We'll always let you know what to expect.",
      },
      {
        q: "Do you iron items that aren't dry cleaned?",
        a: 'Yes, ironing is available as a standalone finish for any regular wash order.',
      },
      {
        q: 'How fast can I get my suit back?',
        a: 'Express turnaround is available for most dry cleaning items, ready within 24 to 48 hours.',
      },
    ],
  },
  {
    slug: 'stain-removal',
    title: 'Stain Removal',
    description: 'Expert treatments designed to safely remove stubborn stains.',
    image: '/images/services/stain-removal.jpg',
    badge: 'DEEP CLEAN',
    heroHeadline: 'Stubborn Stains, Professionally Lifted',
    heroDescription:
      "Oil, wine, ink, or mud, our stain removal specialists identify the stain and apply the right treatment to lift it without damaging the fabric underneath.",
    sectionTitle: 'Targeted Treatment for Every Stain',
    sectionBody:
      "Not all stains respond to the same treatment. We assess the fabric and stain type first, then apply a targeted pre-treatment before washing, giving stubborn marks the best chance of coming out completely.",
    highlights: [
      { icon: Droplet, title: 'Stain Assessment', body: 'Every mark is identified before any treatment begins.' },
      { icon: ShieldCheck, title: 'Fabric-Safe Treatment', body: 'Formulated to lift stains without weakening fibers.' },
    ],
    whyChooseUs: [
      'Pre-Treatment for Tough Stains',
      'Safe on Coloured & Delicate Fabrics',
      'No Extra Charge for Assessment',
      'High Success Rate on Fresh Stains',
    ],
    serviceLeadRole: 'Stain Treatment Lead',
    faqs: [
      {
        q: 'What types of stains can you remove?',
        a: 'Oil, grease, wine, ink, mud, and most common food and drink stains respond well to our treatment process.',
      },
      {
        q: 'Will stain removal damage my fabric?',
        a: 'No, we match the treatment to the fabric type first, so delicate and coloured items are handled safely.',
      },
      {
        q: 'Can old, set-in stains be removed?',
        a: "Fresh stains have the highest success rate. Older stains are treated too, though full removal isn't always guaranteed.",
      },
      {
        q: 'Do you charge extra for stain treatment?',
        a: 'Stain assessment is free. A treatment fee may apply depending on the stain type and fabric.',
      },
    ],
  },
  {
    slug: 'repairs-alterations',
    title: 'Repairs & Alterations',
    description: 'Repair and alteration services to help maintain and extend the life of your garments.',
    image: '/images/services/repairs-alterations.jpg',
    badge: 'SKILLED CRAFT',
    heroHeadline: 'Extend the Life of Your Favourite Garments',
    heroDescription:
      "A loose hem, a missing button, or a fit that's changed, our tailors handle repairs and alterations so you can keep wearing the clothes you already love.",
    sectionTitle: 'Skilled Repairs, Lasting Fit',
    sectionBody:
      "Our in-house tailors assess each garment before any work begins, matching thread, fabric, and technique so repairs blend in and alterations sit exactly right.",
    highlights: [
      { icon: Scissors, title: 'Skilled Tailoring', body: 'Hems, buttons, zips, and seams repaired by hand.' },
      { icon: Ruler, title: 'Precise Fit', body: 'Alterations measured and fitted to you.' },
    ],
    whyChooseUs: [
      'Experienced In-House Tailors',
      'Thread & Fabric Matching',
      'Fitted Alterations, Not Guesswork',
      'Quick Turnaround on Minor Repairs',
    ],
    serviceLeadRole: 'Tailoring Lead',
    faqs: [
      {
        q: 'What repairs do you offer?',
        a: 'Hems, button replacement, zip repair, seam stitching, and general mending on most garment types.',
      },
      {
        q: 'Can you alter the fit of clothing?',
        a: 'Yes, our tailors can take in, let out, shorten, or adjust the fit of most garments.',
      },
      {
        q: 'How long do repairs take?',
        a: 'Minor repairs are typically ready within 2 to 3 days. Larger alterations may take longer depending on the work involved.',
      },
      {
        q: 'Do you match thread and fabric colour?',
        a: 'Yes, we match thread and, where possible, fabric to keep repairs looking seamless.',
      },
    ],
  },
]

export const heroImage = '/images/services/hero-laundromat.jpg'

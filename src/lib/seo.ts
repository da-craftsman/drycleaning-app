// Single source of truth for search metadata. Imported by both the app (runtime `useSeo`) and the
// build-time SEO plugin (scripts/vite-plugin-seo.ts, which pre-writes per-route HTML, sitemap.xml and
// robots.txt), so it must stay self-contained: no `@/` alias imports, no browser-only APIs.

/** Canonical origin, no trailing slash. The apex domain 308-redirects to www, so www is canonical. */
export const SITE_URL = 'https://www.shalahrexlaundry.ng'

export const SITE_NAME = 'Shalah Rex Laundry'

/** Spellings people actually type into Google. Fed into structured data so all of them map to the brand. */
export const BRAND_ALT_NAMES = ['Shalarex Laundry', 'ShalaRex Laundry', 'Shalah Rex Laundry Enugu', 'Shalarex Laundry Enugu']

export const DEFAULT_OG_IMAGE = '/og-image.jpg'

export const BUSINESS_PHONE_E164 = '+2348161747997'

/** Live delivery zones (mirrors the delivery_zones table), written out in full for content and schema. */
export const SERVICE_AREAS = [
  'Lomalinda Extension',
  'Independence Layout',
  'GRA',
  'New Haven',
  'Trans-Ekulu',
  'Uwani',
  'Achara Layout',
  'Asata',
  'Ugwuaji',
  'Gariki',
  'Holy Ghost',
  'Coal Camp',
  'Abakpa Nike',
  'Maryland',
  'Centenary City',
]

export interface PageSeo {
  /** Full <title>. Aim for 50-60 characters with the main keyword first. */
  title: string
  /** Meta description. Aim for 140-160 characters. */
  description: string
}

/** Metadata for every indexable static route, keyed by path. */
export const staticPageSeo = {
  '/': {
    title: 'Shalarex Laundry Enugu | Home Pick Up & Delivery Laundry',
    description:
      "Shalah Rex Laundry (Shalarex) is Enugu's laundry and dry cleaning service with home pick up and delivery. Wash, iron and express 24h service. Book online.",
  },
  '/about': {
    title: 'About Shalah Rex Laundry | Trusted Laundry in Enugu',
    description:
      'Meet Shalah Rex Laundry (Shalarex), the Enugu laundry in Lomalinda Extension offering fabric-safe washing, ironing and home pick up and delivery across Enugu.',
  },
  '/services': {
    title: 'Laundry Services & Prices in Enugu | Shalah Rex Laundry',
    description:
      'See every Shalah Rex Laundry service and price in Enugu: wash and iron, dry cleaning, stain removal, home textiles and home pick up and delivery laundry.',
  },
  '/blog': {
    title: 'Laundry Tips & Fabric Care Blog | Shalah Rex Laundry Enugu',
    description:
      'Fabric care guides and laundry tips from Shalah Rex Laundry, Enugu: native wear care, suit cleaning, express vs regular service and home pick up advice.',
  },
  '/support': {
    title: 'Laundry FAQs & Contact | Shalah Rex Laundry Enugu',
    description:
      'Answers on turnaround times, home pick up and delivery, payment and damaged items. Call, WhatsApp or email Shalah Rex Laundry in Lomalinda Extension, Enugu.',
  },
  '/order': {
    title: 'Book Laundry Pick Up Online in Enugu | Shalah Rex Laundry',
    description:
      'Build your laundry order in minutes: choose items, pick Regular, White Wash or Express, then schedule home pick up and delivery anywhere we cover in Enugu.',
  },
  '/track': {
    title: 'Track Your Laundry Order | Shalah Rex Laundry',
    description:
      'Enter your Shalah Rex Laundry order ID to see live status, from pick up and washing to ironing and delivery back to your door in Enugu.',
  },
  '/privacy-policy': {
    title: 'Privacy Policy | Shalah Rex Laundry',
    description:
      'How Shalah Rex Laundry collects, uses and protects your personal data when you book laundry, pay online or use home pick up and delivery in Enugu.',
  },
  '/terms-of-service': {
    title: 'Terms of Service | Shalah Rex Laundry',
    description:
      'The terms for using Shalah Rex Laundry: orders and payment, pick up and delivery, cancellations, our re-clean quality guarantee and damaged item claims.',
  },
} satisfies Record<string, PageSeo>

export type StaticSeoPath = keyof typeof staticPageSeo

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path
  return path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`
}

/** Canonical form of a path: absolute, no trailing slash (except the root). */
export function canonicalUrl(path: string): string {
  const clean = path.length > 1 ? path.replace(/\/+$/, '') : path
  return clean === '/' ? `${SITE_URL}/` : `${SITE_URL}${clean}`
}

export type JsonLd = Record<string, unknown>

const businessId = `${SITE_URL}/#business`

/** Site-wide LocalBusiness entity. schema.org's DryCleaningOrLaundry is the most specific type available. */
export function localBusinessJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'DryCleaningOrLaundry',
    '@id': businessId,
    name: SITE_NAME,
    alternateName: BRAND_ALT_NAMES,
    description:
      'Laundry and dry cleaning service in Enugu, Nigeria with home pick up and delivery, wash and iron, stain removal and express 24 hour turnaround.',
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/icons/icon-512.png`,
    image: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
    telephone: BUSINESS_PHONE_E164,
    email: 'Shalahrexlaundry@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'No. 7 Elder Anthony Nwobodo Street, Lomalinda Extension',
      addressLocality: 'Enugu',
      addressRegion: 'Enugu State',
      addressCountry: 'NG',
    },
    areaServed: [
      { '@type': 'City', name: 'Enugu' },
      ...SERVICE_AREAS.map((name) => ({ '@type': 'Place', name: `${name}, Enugu` })),
    ],
    currenciesAccepted: 'NGN',
    paymentAccepted: 'Cash, Debit Card, Bank Transfer, USSD',
    knowsAbout: ['Laundry', 'Dry cleaning', 'Home pick up and delivery laundry', 'Stain removal', 'Ironing', 'Native wear care'],
  }
}

export function websiteJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    alternateName: BRAND_ALT_NAMES,
    url: `${SITE_URL}/`,
    publisher: { '@id': businessId },
    inLanguage: 'en-NG',
  }
}

export function breadcrumbJsonLd(crumbs: { name: string; path: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: canonicalUrl(c.path),
    })),
  }
}

export function faqJsonLd(faqs: { q: string; a: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

export function serviceJsonLd(opts: { name: string; description: string; path: string; image: string }): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    serviceType: opts.name,
    description: opts.description,
    url: canonicalUrl(opts.path),
    image: absoluteUrl(opts.image),
    provider: { '@id': businessId },
    areaServed: { '@type': 'City', name: 'Enugu' },
  }
}

export function blogPostingJsonLd(post: {
  title: string
  description: string
  slug: string
  image: string
  publishedAt: string | null
  category: string
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    url: canonicalUrl(`/blog/${post.slug}`),
    mainEntityOfPage: canonicalUrl(`/blog/${post.slug}`),
    image: absoluteUrl(post.image),
    ...(post.publishedAt ? { datePublished: post.publishedAt, dateModified: post.publishedAt } : {}),
    articleSection: post.category,
    inLanguage: 'en-NG',
    author: { '@type': 'Organization', name: SITE_NAME, url: `${SITE_URL}/` },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icons/icon-512.png` },
    },
  }
}

/** Search-friendly description for a blog post: its SEO description, else excerpt, else a generic line. */
export function blogDescription(post: { seo_description: string | null; excerpt: string; title: string }): string {
  return post.seo_description?.trim() || post.excerpt.trim() || `${post.title}, from the Shalah Rex Laundry blog in Enugu.`
}

/** Feature images are sometimes stored inline as data: URIs, which can't be used as share images. */
export function shareableImage(image: string | null | undefined): string {
  return image && !image.startsWith('data:') ? image : DEFAULT_OG_IMAGE
}

export function blogTitle(title: string): string {
  const suffix = ' | Shalah Rex Laundry'
  return title.length + suffix.length <= 65 ? `${title}${suffix}` : title
}

// ── Head tags ──────────────────────────────────────────────────────────────

export interface SeoMeta extends PageSeo {
  /** Route path, used for the canonical URL and og:url. */
  path: string
  /** Share image, absolute or site-relative. Defaults to the site OG image. */
  image?: string
  imageAlt?: string
  type?: 'website' | 'article'
  publishedTime?: string | null
  /** Keep the page out of search results (account, checkout, admin, 404...). */
  noindex?: boolean
  /** Page-specific structured data blocks. */
  jsonLd?: JsonLd[]
}

export interface HeadTag {
  tag: 'meta' | 'link' | 'script'
  attrs: Record<string, string>
  /** Inner text, only for JSON-LD scripts. */
  text?: string
}

/** Every page-specific head tag, in a framework-neutral shape. Tagged `data-seo` so they can be swapped per route. */
export function buildHeadTags(meta: SeoMeta): HeadTag[] {
  const url = canonicalUrl(meta.path)
  const image = absoluteUrl(meta.image ?? DEFAULT_OG_IMAGE)
  const imageAlt = meta.imageAlt ?? meta.title
  const tags: HeadTag[] = [
    { tag: 'meta', attrs: { name: 'description', content: meta.description } },
    {
      tag: 'meta',
      attrs: {
        name: 'robots',
        content: meta.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1',
      },
    },
    { tag: 'meta', attrs: { property: 'og:type', content: meta.type ?? 'website' } },
    { tag: 'meta', attrs: { property: 'og:site_name', content: SITE_NAME } },
    { tag: 'meta', attrs: { property: 'og:locale', content: 'en_NG' } },
    { tag: 'meta', attrs: { property: 'og:title', content: meta.title } },
    { tag: 'meta', attrs: { property: 'og:description', content: meta.description } },
    { tag: 'meta', attrs: { property: 'og:url', content: url } },
    { tag: 'meta', attrs: { property: 'og:image', content: image } },
    { tag: 'meta', attrs: { property: 'og:image:alt', content: imageAlt } },
    { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
    { tag: 'meta', attrs: { name: 'twitter:title', content: meta.title } },
    { tag: 'meta', attrs: { name: 'twitter:description', content: meta.description } },
    { tag: 'meta', attrs: { name: 'twitter:image', content: image } },
  ]
  if (!meta.noindex) tags.push({ tag: 'link', attrs: { rel: 'canonical', href: url } })
  if (meta.publishedTime) {
    tags.push({ tag: 'meta', attrs: { property: 'article:published_time', content: meta.publishedTime } })
  }
  for (const block of meta.jsonLd ?? []) {
    tags.push({ tag: 'script', attrs: { type: 'application/ld+json' }, text: JSON.stringify(block) })
  }
  return tags
}

// ── Page builders (shared by runtime pages and the build-time prerender) ─────

export function staticSeo(path: StaticSeoPath, extra: Partial<SeoMeta> = {}): SeoMeta {
  const crumbName: Record<string, string> = { '/services': 'Services', '/blog': 'Blog', '/about': 'About', '/support': 'Support' }
  const jsonLd = crumbName[path] ? [breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: crumbName[path], path }])] : []
  return { ...staticPageSeo[path], path, jsonLd, ...extra }
}

export function serviceSeo(s: {
  slug: string
  title: string
  seoTitle: string
  seoDescription: string
  image: string
  faqs: { q: string; a: string }[]
}): SeoMeta {
  const path = `/services/${s.slug}`
  return {
    title: s.seoTitle,
    description: s.seoDescription,
    path,
    image: s.image,
    imageAlt: `${s.title} by Shalah Rex Laundry, Enugu`,
    jsonLd: [
      serviceJsonLd({ name: s.title, description: s.seoDescription, path, image: s.image }),
      faqJsonLd(s.faqs),
      breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Services', path: '/services' },
        { name: s.title, path },
      ]),
    ],
  }
}

export function blogPostSeo(p: {
  title: string
  slug: string
  excerpt: string
  seo_description: string | null
  category: string
  feature_image: string | null
  published_at: string | null
}): SeoMeta {
  const description = blogDescription(p)
  const image = shareableImage(p.feature_image)
  const path = `/blog/${p.slug}`
  return {
    title: blogTitle(p.title),
    description,
    path,
    image,
    imageAlt: p.title,
    type: 'article',
    publishedTime: p.published_at,
    jsonLd: [
      blogPostingJsonLd({ title: p.title, description, slug: p.slug, image, publishedAt: p.published_at, category: p.category }),
      breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Blog', path: '/blog' },
        { name: p.title, path },
      ]),
    ],
  }
}

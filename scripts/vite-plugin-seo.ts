// Build-time SEO for the SPA. Search engines and link-preview bots (WhatsApp, Facebook, X) read the
// raw HTML before any JavaScript runs, and a plain Vite build serves the same index.html, with the
// home page's title and canonical, for every URL. This plugin:
//   1. fills the site-wide JSON-LD and the home page's tags into index.html (dev + build),
//   2. writes one HTML file per public route (about.html, services/<slug>.html, blog/<slug>.html...)
//      with that page's own title, description, canonical, Open Graph and JSON-LD. Vercel serves
//      them via `cleanUrls`; the app itself is identical, and useSeo() keeps tags right after that,
//   3. generates sitemap.xml and robots.txt, including every published blog post from Supabase.
// New blog posts reach the sitemap on the next deploy.

import { loadEnv, type Plugin } from 'vite'
import {
  SITE_URL,
  blogPostSeo,
  buildHeadTags,
  canonicalUrl,
  localBusinessJsonLd,
  serviceSeo,
  staticPageSeo,
  staticSeo,
  websiteJsonLd,
  type SeoMeta,
  type StaticSeoPath,
} from '../src/lib/seo.ts'
import { services } from '../src/lib/services.ts'

interface PublishedPost {
  slug: string
  title: string
  excerpt: string
  seo_description: string | null
  category: string
  feature_image: string | null
  published_at: string | null
}

/** Static routes left out of the sitemap (still crawlable, just not worth promoting). */
const SITEMAP_EXCLUDE = new Set<string>(['/track'])

const ROBOTS_DISALLOW = ['/admin', '/account', '/order/checkout', '/order/confirmation', '/track/', '/api/', '/dev/']

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** JSON inside <script> must not be able to close the tag early. */
function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

function renderSeoBlock(meta: SeoMeta): string {
  const lines = [`<title>${escapeHtml(meta.title)}</title>`]
  for (const tag of buildHeadTags(meta)) {
    const attrs = Object.entries(tag.attrs)
      .map(([name, value]) => `${name}="${escapeHtml(value)}"`)
      .join(' ')
    if (tag.tag === 'script') {
      lines.push(`<script data-seo ${attrs}>${tag.text!.replace(/</g, '\\u003c')}</script>`)
    } else {
      lines.push(`<${tag.tag} data-seo ${attrs} />`)
    }
  }
  return `<!-- seo:start -->\n    ${lines.join('\n    ')}\n    <!-- seo:end -->`
}

function applySeo(html: string, meta: SeoMeta): string {
  const replaced = html.replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/, renderSeoBlock(meta))
  if (replaced === html) throw new Error('[seo] index.html is missing its <!-- seo:start --> / <!-- seo:end --> markers')
  return replaced
}

async function fetchPublishedPosts(env: Record<string, string>): Promise<PublishedPost[]> {
  const url = env.VITE_SUPABASE_URL
  const key = env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) {
    console.warn('[seo] Supabase env vars not set: blog posts left out of sitemap.xml and prerendering.')
    return []
  }
  try {
    const res = await fetch(
      `${url}/rest/v1/blog_posts?select=slug,title,excerpt,seo_description,category,feature_image,published_at` +
        '&published_at=not.is.null&order=published_at.desc',
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(15000) },
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as PublishedPost[]
  } catch (error) {
    console.warn(`[seo] Could not fetch blog posts (${String(error)}): left out of sitemap.xml and prerendering.`)
    return []
  }
}

function sitemapXml(entries: { path: string; lastmod?: string }[]): string {
  const urls = entries
    .map(({ path, lastmod }) => {
      const lastmodTag = lastmod ? `\n    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : ''
      return `  <url>\n    <loc>${escapeHtml(canonicalUrl(path))}</loc>${lastmodTag}\n  </url>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

function robotsTxt(): string {
  return [
    'User-agent: *',
    'Allow: /',
    ...ROBOTS_DISALLOW.map((p) => `Disallow: ${p}`),
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n')
}

export function seoPlugin(): Plugin {
  let env: Record<string, string> = {}

  return {
    name: 'shalah-rex-seo',
    enforce: 'post',

    configResolved(config) {
      env = loadEnv(config.mode, config.envDir || config.root, 'VITE_')
    },

    transformIndexHtml(html) {
      return applySeo(html, staticSeo('/'))
        .replace('__LOCAL_BUSINESS_JSON_LD__', safeJson(localBusinessJsonLd()))
        .replace('__WEBSITE_JSON_LD__', safeJson(websiteJsonLd()))
    },

    async generateBundle(_options, bundle) {
      const indexAsset = bundle['index.html']
      if (!indexAsset || indexAsset.type !== 'asset') return
      const indexHtml = String(indexAsset.source)
      const posts = await fetchPublishedPosts(env)

      const pages: { fileName: string; meta: SeoMeta }[] = []
      for (const path of Object.keys(staticPageSeo) as StaticSeoPath[]) {
        if (path === '/') continue // index.html already carries the home page's tags
        pages.push({ fileName: `${path.slice(1)}.html`, meta: staticSeo(path) })
      }
      for (const service of services) {
        pages.push({ fileName: `services/${service.slug}.html`, meta: serviceSeo(service) })
      }
      for (const post of posts) {
        pages.push({ fileName: `blog/${post.slug}.html`, meta: blogPostSeo(post) })
      }

      for (const page of pages) {
        this.emitFile({ type: 'asset', fileName: page.fileName, source: applySeo(indexHtml, page.meta) })
      }

      const latestPost = posts[0]?.published_at ?? undefined
      const sitemapEntries = [
        { path: '/', lastmod: latestPost },
        ...(Object.keys(staticPageSeo) as StaticSeoPath[])
          .filter((p) => p !== '/' && !SITEMAP_EXCLUDE.has(p))
          .map((path) => ({ path, lastmod: path === '/blog' ? latestPost : undefined })),
        ...services.map((s) => ({ path: `/services/${s.slug}` })),
        ...posts.map((p) => ({ path: `/blog/${p.slug}`, lastmod: p.published_at ?? undefined })),
      ]
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml(sitemapEntries) })
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt() })

      console.log(`[seo] Prerendered ${pages.length} pages, sitemap.xml with ${sitemapEntries.length} URLs (${posts.length} blog posts).`)
    },
  }
}

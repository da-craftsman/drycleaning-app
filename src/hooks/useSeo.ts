import { useEffect } from 'react'
import { buildHeadTags, type SeoMeta } from '@/lib/seo'

/**
 * Sets the page's <title>, meta description, canonical, Open Graph/Twitter tags and JSON-LD.
 * Replaces every `data-seo` tag in <head> (including the ones pre-written into the static HTML at
 * build time), so client-side navigation never leaves stale or duplicate tags behind.
 */
export function useSeo(meta: SeoMeta) {
  const key = JSON.stringify(meta)

  useEffect(() => {
    const parsed = JSON.parse(key) as SeoMeta
    document.title = parsed.title
    document.head.querySelectorAll('[data-seo]').forEach((el) => el.remove())
    for (const tag of buildHeadTags(parsed)) {
      const el = document.createElement(tag.tag)
      for (const [name, value] of Object.entries(tag.attrs)) el.setAttribute(name, value)
      if (tag.text) el.textContent = tag.text
      el.setAttribute('data-seo', '')
      document.head.appendChild(el)
    }
  }, [key])
}

/** For pages that should never appear in search results (account, checkout, admin, auth, 404). */
export function useNoIndex(title: string, path: string) {
  useSeo({ title, description: 'Shalah Rex Laundry, Enugu.', path, noindex: true })
}

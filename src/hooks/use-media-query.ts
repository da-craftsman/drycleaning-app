import { useSyncExternalStore } from 'react'

function subscribe(query: string, callback: () => void) {
  const mql = window.matchMedia(query)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => subscribe(query, callback),
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** True at the `md` breakpoint (768px) and up — matches Tailwind's default `md:` prefix. */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 768px)')
}

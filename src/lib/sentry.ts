import * as Sentry from '@sentry/react'
import { supabase } from '@/lib/supabase'

const dsn = import.meta.env.VITE_SENTRY_DSN

function stripHash(url: string) {
  return url.split('#')[0]
}

/**
 * Error monitoring. Does nothing until VITE_SENTRY_DSN is set (Sentry → Project Settings → Client
 * Keys), so local dev and preview builds without it stay silent. Imported first in main.tsx so it
 * catches errors from the very start of the app.
 */
if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    // Ad-blockers and privacy extensions cut requests to *.sentry.io, so on the live site errors are
    // sent to our own domain and vercel.json's /api/ev rewrite forwards them to Sentry. (Dev has no
    // Vercel rewrites, so it talks to Sentry directly.) If the DSN/project changes, update that rewrite.
    tunnel: import.meta.env.PROD ? '/api/ev' : undefined,
    // Customer names, phones and addresses are on most pages — don't attach user info, cookies,
    // headers, request bodies or query strings, and identify users by id only (below).
    dataCollection: { userInfo: false, cookies: false, httpHeaders: false, httpBodies: [], urlQueryParams: false },
    // Supabase password-reset and magic links put login tokens in the URL #fragment.
    beforeSend(event) {
      if (event.request?.url) event.request.url = stripHash(event.request.url)
      return event
    },
    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.category === 'navigation' && breadcrumb.data) {
        if (typeof breadcrumb.data.from === 'string') breadcrumb.data.from = stripHash(breadcrumb.data.from)
        if (typeof breadcrumb.data.to === 'string') breadcrumb.data.to = stripHash(breadcrumb.data.to)
      }
      return breadcrumb
    },
    integrations: [Sentry.browserTracingIntegration()],
    // A sample of page loads/navigations for performance data; errors are always captured in full.
    tracesSampleRate: 0.1,
    // Noise from browser extensions and flaky mobile networks, not bugs in this app.
    ignoreErrors: ['ResizeObserver loop limit exceeded', 'ResizeObserver loop completed with undelivered notifications'],
    denyUrls: [/^chrome-extension:\/\//, /^moz-extension:\/\//, /^safari-extension:\/\//],
  })

  // Tags each error with the signed-in user's id, so a reported problem can be matched to an
  // account in the admin dashboard without sending their name or email to Sentry.
  supabase?.auth.onAuthStateChange((_event, session) => {
    Sentry.setUser(session ? { id: session.user.id } : null)
  })
}

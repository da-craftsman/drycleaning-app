import { useEffect, useRef } from 'react'

const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY

/**
 * True once a Cloudflare Turnstile site key is configured. Until then the widget renders nothing
 * and forms submit without a token, so this can ship before the Turnstile account exists. Turn on
 * Supabase's CAPTCHA protection (Auth → Bot and Abuse Protection) only AFTER the site key is live
 * on Vercel — once Supabase requires a token, every signup/login/reset without one is rejected.
 */
export const captchaEnabled = Boolean(siteKey)

interface Turnstile {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string
      callback: (token: string) => void
      'expired-callback': () => void
      'error-callback': () => void
      theme?: 'auto' | 'light' | 'dark'
      size?: 'normal' | 'flexible' | 'compact'
    },
  ) => string
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: Turnstile
  }
}

let scriptPromise: Promise<void> | null = null

function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptPromise = null
      reject(new Error('Failed to load the security check.'))
    }
    document.head.appendChild(script)
  })
  return scriptPromise
}

/**
 * Cloudflare Turnstile bot check. Tokens are single-use, so after every submit attempt the parent
 * should clear its token and remount this widget (change its `key`) to get a fresh one.
 */
function CaptchaWidget({ onToken }: { onToken: (token: string | null) => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onTokenRef = useRef(onToken)
  onTokenRef.current = onToken

  useEffect(() => {
    if (!siteKey) return
    let widgetId: string | undefined
    let cancelled = false
    loadTurnstile()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return
        widgetId = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => onTokenRef.current(token),
          'expired-callback': () => onTokenRef.current(null),
          'error-callback': () => onTokenRef.current(null),
          theme: 'auto',
          size: 'flexible',
        })
      })
      .catch((err) => console.error(err))
    return () => {
      cancelled = true
      if (widgetId) window.turnstile?.remove(widgetId)
    }
  }, [])

  if (!siteKey) return null
  return <div ref={containerRef} className="min-h-[65px]" />
}

export { CaptchaWidget }

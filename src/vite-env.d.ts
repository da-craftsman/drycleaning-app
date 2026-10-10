/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_PAYSTACK_PUBLIC_KEY: string
  /** Cloudflare Turnstile site key. Optional — CAPTCHA is skipped while unset. */
  readonly VITE_TURNSTILE_SITE_KEY?: string
  /** Sentry DSN. Optional — error monitoring is off while unset. */
  readonly VITE_SENTRY_DSN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

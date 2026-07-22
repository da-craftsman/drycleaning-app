import { clsx } from 'clsx'
import type { ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Every custom color token defined in src/index.css's @theme block. Without registering these,
// tailwind-merge falls back to lumping any unrecognized `text-*` utility (our custom font-size
// tokens like `text-body-lg` AND our custom color tokens like `text-on-primary`) into one group
// and silently drops whichever comes first, e.g. `text-on-primary text-body-lg` collapsed to just
// `text-body-lg` and buttons rendered with default (black) text instead of on-primary white.
const themeColors = [
  'surface',
  'surface-dim',
  'surface-bright',
  'surface-container-lowest',
  'surface-container-low',
  'surface-container',
  'surface-container-high',
  'surface-container-highest',
  'on-surface',
  'on-surface-variant',
  'inverse-surface',
  'inverse-on-surface',
  'outline',
  'outline-variant',
  'surface-tint',
  'primary',
  'on-primary',
  'primary-container',
  'on-primary-container',
  'inverse-primary',
  'secondary',
  'on-secondary',
  'secondary-container',
  'on-secondary-container',
  'tertiary',
  'on-tertiary',
  'tertiary-container',
  'on-tertiary-container',
  'error',
  'on-error',
  'error-container',
  'on-error-container',
  'primary-fixed',
  'primary-fixed-dim',
  'on-primary-fixed',
  'on-primary-fixed-variant',
  'secondary-fixed',
  'secondary-fixed-dim',
  'on-secondary-fixed',
  'on-secondary-fixed-variant',
  'tertiary-fixed',
  'tertiary-fixed-dim',
  'on-tertiary-fixed',
  'on-tertiary-fixed-variant',
  'background',
  'on-background',
  'surface-variant',
  'laundry-blue-deep',
  'clean-white',
  'success-green',
  'urgent-express',
] as const

const themeFontSizes = [
  'display-lg',
  'headline-lg',
  'headline-lg-mobile',
  'headline-md',
  'body-lg',
  'body-md',
  'label-md',
  'label-sm',
] as const

const colorClasses = (prefix: string) => themeColors.map((c) => `${prefix}-${c}`)

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': themeFontSizes.map((s) => `text-${s}`),
      'text-color': colorClasses('text'),
      'bg-color': colorClasses('bg'),
      'border-color': colorClasses('border'),
      'ring-color': colorClasses('ring'),
      'outline-color': colorClasses('outline'),
      'gradient-from': colorClasses('from'),
      'gradient-via': colorClasses('via'),
      'gradient-to': colorClasses('to'),
    },
    // Registers our custom spacing scale (src/index.css's --spacing-stack-* tokens) so tailwind-merge
    // recognizes e.g. `py-stack-md` as conflicting with (and overriding) `pt-0` on the same axis.
    // Without this, unrecognized custom spacing utilities aren't grouped with the standard p/m/gap
    // utilities they conflict with, so both survive in the DOM and the actual generated CSS's source
    // order decides the winner — e.g. Card's default `pt-0` silently beat a passed-in `py-stack-md`,
    // leaving several cards with zero top padding on mobile despite the JSX looking correct.
    theme: {
      spacing: ['stack-sm', 'stack-md', 'stack-lg'],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** True for absolute http(s) URLs — used to route admin-entered links (e.g. the promo banner) to a real page navigation instead of client-side routing. */
export function isExternalUrl(url: string) {
  return /^https?:\/\//i.test(url)
}

/**
 * Extracts a human-readable message from a caught error. Supabase's auth errors (AuthError) extend
 * the native Error class, but its Postgrest errors (from `.from(table)` queries) don't — they're
 * plain `{ message, details, hint, code }` objects. An `err instanceof Error` check alone silently
 * drops the real reason for any thrown PostgrestError and falls through to a generic fallback.
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') return err.message
  return fallback
}

/** Short, customer-friendly order display ID, e.g. "SRL-178446" — the last 6 digits of a millisecond timestamp. */
export function generateOrderDisplayId(fromTimestampMs: number = Date.now()): string {
  return `SRL-${fromTimestampMs.toString().slice(-6)}`
}

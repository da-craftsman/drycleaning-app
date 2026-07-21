import type { AdminPermission } from '@/types/database'

/** The 7 delegable admin features a superadmin can grant to a sub-admin. Settings and admin-user
 * management are intentionally excluded — they stay superadmin-only regardless of grants. */
export const ADMIN_PERMISSIONS: { key: AdminPermission; label: string }[] = [
  { key: 'orders', label: 'Orders' },
  { key: 'customers', label: 'Customers' },
  { key: 'catalog', label: 'Catalog & Pricing' },
  { key: 'zones', label: 'Zones' },
  { key: 'banner', label: 'Banner' },
  { key: 'tickets', label: 'Tickets' },
  { key: 'blog', label: 'Blog' },
]

/** Business contact details. */
export const business = {
  name: 'Shalah Rex Laundry',
  city: 'Enugu, Nigeria',
  phoneDisplay: '+234 816 174 7997',
  whatsappNumber: '2348161747997', // wa.me expects digits only, country code first, no leading +
  email: 'Shalahrexlaundry@gmail.com',
  address: 'No. 7 Elder Anthony Nwobodo Street, Lomalinda Extension, Enugu, Nigeria',
} as const

/** Converts a local Nigerian number ("08098765432") to the digits-only, country-code-first format wa.me expects. Already-international numbers pass through unchanged. */
function toWhatsappDigits(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('234')) return digits
  if (digits.startsWith('0')) return `234${digits.slice(1)}`
  return digits
}

/** Without `phoneNumber`, links to the business's own WhatsApp (customer contacting us). With it, links to that number instead (us contacting a customer). */
export function whatsappLink(message?: string, phoneNumber?: string) {
  const number = phoneNumber ? toWhatsappDigits(phoneNumber) : business.whatsappNumber
  const base = `https://wa.me/${number}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

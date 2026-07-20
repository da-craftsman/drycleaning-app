/** Business contact details. */
export const business = {
  name: 'Shalah Rex Laundry',
  city: 'Enugu, Nigeria',
  phoneDisplay: '+234 816 174 7997',
  whatsappNumber: '2348161747997', // wa.me expects digits only, country code first, no leading +
  email: 'Shalahrexlaundry@gmail.com',
  address: 'No. 7 Elder Anthony Nwobodo Street, Lomalinda Extension, Enugu, Nigeria',
} as const

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${business.whatsappNumber}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

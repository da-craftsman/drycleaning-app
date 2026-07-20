import { business } from '@/lib/constants'

const sections = [
  {
    title: '1. Information We Collect',
    body: [
      `When you create an account or place an order with ${business.name}, we collect your full name, phone number, WhatsApp number, delivery/pickup address, and email address.`,
      'When you pay by card or bank transfer through Paystack, Paystack processes your payment details directly — we never see or store your card number, CVV, or bank credentials.',
      'If you upload photos of stained or damaged items, those images are stored so our team can assess them alongside your order.',
    ],
  },
  {
    title: '2. How We Use Your Information',
    body: [
      'To create and manage your account, process and fulfill your orders, and communicate with you about order status, pickups, and deliveries.',
      'To respond to support tickets and complaints you raise with us.',
      'To send transactional emails (order confirmations, order-ready notices, account emails) and, where relevant, service updates via WhatsApp or SMS.',
      'To improve our service and catalog based on order patterns — we do not sell your personal data to third parties.',
    ],
  },
  {
    title: '3. Who We Share Data With',
    body: [
      'Paystack — to process payments securely. See Paystack\'s own privacy policy for how they handle payment data.',
      'Resend — our email delivery provider, used to send order and account emails.',
      'Supabase — our database and authentication provider, which stores your account and order records.',
      'We do not share your personal information with any other third party for marketing purposes.',
    ],
  },
  {
    title: '4. Data Retention',
    body: [
      'We retain your account and order history for as long as your account is active, and as needed to meet our legal, accounting, and tax obligations.',
      'You may request deletion of your account and associated personal data at any time by contacting us — see Section 6.',
    ],
  },
  {
    title: '5. Cookies & Local Storage',
    body: [
      'We use browser local storage to keep you signed in and to remember items in your cart between visits. We do not use third-party advertising or tracking cookies.',
    ],
  },
  {
    title: '6. Your Rights',
    body: [
      'Under the Nigeria Data Protection Act, you have the right to access the personal data we hold about you, request corrections, request deletion, and object to certain uses of your data.',
      `To exercise any of these rights, contact us at ${business.email} or ${business.phoneDisplay}.`,
    ],
  },
  {
    title: '7. Changes to This Policy',
    body: [
      'We may update this policy from time to time. Material changes will be reflected by updating the date below.',
    ],
  },
]

export default function PrivacyPolicyPage() {
  return (
    <article className="mx-auto w-full min-w-0 max-w-2xl px-margin-mobile py-stack-lg md:px-gutter">
      <h1 className="text-headline-lg-mobile font-display text-laundry-blue-deep md:text-headline-lg">Privacy Policy</h1>
      <p className="mt-1 text-label-sm text-on-surface-variant">Last updated: 20 July 2026</p>

      <p className="mt-stack-md text-body-lg text-on-surface">
        {business.name} ("we", "us", "our") respects your privacy. This policy explains what personal information we
        collect when you use our website and laundry service, how we use it, and your rights over it.
      </p>

      <div className="mt-stack-lg flex flex-col gap-stack-lg">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="mb-stack-sm text-headline-md font-display text-on-surface">{section.title}</h2>
            <div className="flex flex-col gap-2">
              {section.body.map((paragraph, i) => (
                <p key={i} className="text-body-md text-on-surface-variant">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}

        <section>
          <h2 className="mb-stack-sm text-headline-md font-display text-on-surface">Contact Us</h2>
          <p className="text-body-md text-on-surface-variant">
            {business.name}
            <br />
            {business.address}
            <br />
            {business.phoneDisplay} · {business.email}
          </p>
        </section>
      </div>
    </article>
  )
}

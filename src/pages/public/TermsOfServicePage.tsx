import { business } from '@/lib/constants'

const sections = [
  {
    title: '1. Our Service',
    body: [
      `${business.name} provides garment cleaning services (washing, dry cleaning, ironing) in ${business.city}, with self drop-off, pickup, and delivery logistics options as shown at checkout.`,
      'Turnaround times shown per item (Regular, White Wash, Express) are estimates that begin once we have received your items, not from the time an order is placed.',
    ],
  },
  {
    title: '2. Orders & Payment',
    body: [
      'Prices shown at checkout are final and include any delivery/pickup fee for the zone and logistics option you select. Self drop-off & pickup is always free.',
      'We accept payment by card/bank transfer via Paystack, or cash on delivery. Orders paid by card are confirmed only after Paystack verifies the transaction was successful.',
      'For cash-on-delivery orders, payment is due in full at the time your items are delivered or picked up.',
    ],
  },
  {
    title: '3. Cancellations',
    body: [
      'You may cancel an order before it has been collected/received by contacting us directly. Once items are in our care and processing has begun, cancellation may not be possible.',
      'If you paid online for an order that is cancelled before processing begins, we will refund you to your original payment method.',
    ],
  },
  {
    title: '4. Quality Guarantee',
    body: [
      "If you're not satisfied with how an item was cleaned, let us know within 48 hours of delivery/pickup via a support ticket or by contacting us directly, and we'll re-clean the affected item at no extra charge.",
    ],
  },
  {
    title: '5. Damaged, Stained, or Lost Items',
    body: [
      'We take care to sort and treat every item appropriately for its fabric. If you flag an item as stained or damaged when placing your order, we assess it before cleaning and will contact you if we believe cleaning could worsen its condition.',
      'If an item is lost or damaged while in our care due to our error, contact us via a support ticket with your order details so we can investigate and, where appropriate, offer a repair, replacement value, or refund for that item, in our reasonable discretion.',
      'We are not responsible for items left in pockets, or for pre-existing damage/wear not disclosed at drop-off.',
    ],
  },
  {
    title: '6. Your Responsibilities',
    body: [
      'Please provide accurate contact and address details so we can reach you and complete pickup/delivery as arranged.',
      'Please point out any special care instructions, valuables in pockets, or existing damage before we collect your items.',
    ],
  },
  {
    title: '7. Changes to These Terms',
    body: [
      'We may update these terms from time to time. Continuing to use our service after a change means you accept the updated terms.',
    ],
  },
  {
    title: '8. Governing Law',
    body: ['These terms are governed by the laws of the Federal Republic of Nigeria.'],
  },
]

export default function TermsOfServicePage() {
  return (
    <article className="mx-auto w-full min-w-0 max-w-2xl px-margin-mobile py-stack-lg md:px-gutter">
      <h1 className="text-headline-lg-mobile font-display text-laundry-blue-deep md:text-headline-lg">Terms of Service</h1>
      <p className="mt-1 text-label-sm text-on-surface-variant">Last updated: 20 July 2026</p>

      <p className="mt-stack-md text-body-lg text-on-surface">
        These terms govern your use of {business.name}'s website and laundry service. By placing an order with us,
        you agree to these terms.
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

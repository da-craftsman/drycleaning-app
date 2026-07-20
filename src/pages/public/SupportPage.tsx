import { Mail, MapPin, Phone } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { business, whatsappLink } from '@/lib/constants'

const faqs = [
  {
    q: 'How long does a Regular wash take?',
    a: 'Most items are ready in 2-4 days on the Regular tier. Exact turnaround varies slightly by garment and is shown on every item before you add it to your order.',
  },
  {
    q: "What's the difference between White Wash and Express?",
    a: 'White Wash is a deeper, whiter-focused clean with a faster turnaround than Regular. Express prioritizes speed, most items are ready within 24 hours, at a premium price.',
  },
  {
    q: 'Do you offer pickup and delivery?',
    a: 'Yes. At checkout you can choose Self Drop-off, Pickup Only, Delivery Only, or Pickup & Delivery, and select your Enugu zone for the applicable fee.',
  },
  {
    q: 'What if an item comes back damaged or missing?',
    a: "Submit a support ticket from your account with the order attached, we'll review it and get back to you, usually within a day.",
  },
  {
    q: 'How do I pay?',
    a: 'We accept card, bank transfer, and USSD via Paystack, or Cash on Delivery.',
  },
]

export default function SupportPage() {
  return (
    <div className="mx-auto w-full min-w-0 max-w-shell px-margin-mobile py-stack-lg md:px-gutter md:py-16">
      <h1 className="text-center text-headline-lg-mobile font-display text-laundry-blue-deep md:text-headline-lg">Support</h1>

      <div className="mt-stack-lg grid grid-cols-1 gap-stack-lg md:grid-cols-[2fr_1fr]">
        <div>
          <h2 className="mb-stack-sm text-headline-md font-display text-on-surface">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible>
            {faqs.map((faq) => (
              <AccordionItem key={faq.q} value={faq.q}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <Card className="h-fit">
          <CardContent className="flex flex-col gap-stack-sm pt-stack-md">
            <p className="text-label-sm uppercase text-on-surface-variant">Contact Us</p>
            <a href={`tel:${business.phoneDisplay.replace(/\s/g, '')}`} className="flex items-center gap-2 text-body-md text-on-surface-variant hover:text-primary">
              <Phone className="h-4 w-4" /> {business.phoneDisplay}
            </a>
            <a href={`mailto:${business.email}`} className="flex items-center gap-2 text-body-md text-on-surface-variant hover:text-primary">
              <Mail className="h-4 w-4" /> {business.email}
            </a>
            <p className="flex items-center gap-2 text-body-md text-on-surface-variant">
              <MapPin className="h-4 w-4" /> {business.address}
            </p>
            <Button asChild className="mt-2 bg-[#25D366] text-white hover:bg-[#20bd5a] active:bg-[#1da851]">
              <a href={whatsappLink("Hi Shalah Rex, I need some help.")} target="_blank" rel="noreferrer">
                <WhatsAppIcon className="h-4 w-4" /> Chat on WhatsApp
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

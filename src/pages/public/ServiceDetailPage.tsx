import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, ChevronLeft, FileText, Phone, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { services } from '@/lib/services'
import { business, whatsappLink } from '@/lib/constants'
import { paths } from '@/routes/paths'

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const service = services.find((s) => s.slug === slug)
  const otherServices = services.filter((s) => s.slug !== slug).slice(0, 3)

  if (!service) {
    return (
      <div className="mx-auto w-full min-w-0 max-w-2xl px-margin-mobile py-stack-lg text-center">
        <p className="text-body-lg text-on-surface-variant">We couldn't find that service.</p>
        <Button asChild className="mt-stack-md">
          <Link to={paths.services}>Back to Services</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-shell px-margin-mobile py-stack-lg md:px-gutter md:py-16">
      <Link to={paths.services} className="mb-stack-md flex items-center gap-1 text-label-md text-on-surface-variant hover:text-on-surface">
        <ChevronLeft className="h-4 w-4" /> All Services
      </Link>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl">
        <img src={service.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-br from-laundry-blue-deep/90 via-laundry-blue-deep/80 to-primary/70" />
        <div className="relative flex flex-col gap-stack-sm px-margin-mobile py-stack-lg md:max-w-xl md:px-12 md:py-16">
          <Badge variant="express" className="w-fit">
            {service.badge}
          </Badge>
          <h1 className="text-headline-lg-mobile font-display text-clean-white md:text-headline-lg">{service.heroHeadline}</h1>
          <p className="text-body-lg text-clean-white/85">{service.heroDescription}</p>
          <Button size="lg" asChild className="mt-2 w-fit">
            <Link to={paths.order}>
              <FileText className="h-4 w-4" /> Start an Order
            </Link>
          </Button>
        </div>
      </div>

      {/* Details + Why Choose Us */}
      <div className="mt-stack-lg grid grid-cols-1 gap-stack-lg md:grid-cols-[2fr_1fr] md:items-stretch">
        <Card>
          <CardContent className="flex h-full flex-col gap-stack-md pt-stack-md">
            <div>
              <h2 className="mb-stack-sm text-headline-md font-display text-primary">{service.sectionTitle}</h2>
              <p className="text-body-md text-on-surface-variant">{service.sectionBody}</p>
            </div>
            <div className="grid grid-cols-1 gap-stack-sm sm:grid-cols-2">
              {service.highlights.map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex items-start gap-3 rounded-lg bg-surface-container-low p-stack-sm">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.75} />
                  <div>
                    <p className="text-label-md font-bold normal-case text-on-surface">{title}</p>
                    <p className="text-label-sm text-on-surface-variant">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-laundry-blue-deep">
          <CardContent className="flex h-full flex-col gap-stack-sm pt-stack-md">
            <h2 className="text-headline-md font-display text-clean-white">Why Choose Us?</h2>
            <ul className="flex flex-col gap-2">
              {service.whyChooseUs.map((item) => (
                <li key={item} className="flex items-center gap-2 text-body-md text-clean-white/90">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-secondary-container" /> {item}
                </li>
              ))}
            </ul>
            <div className="mt-auto flex items-center gap-2 border-t border-clean-white/15 pt-stack-sm">
              <Avatar>
                <AvatarFallback className="bg-secondary-container text-on-secondary-container">
                  <Users className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-label-sm font-bold uppercase text-secondary-container">{service.serviceLeadRole}</p>
                <p className="text-label-md font-bold normal-case text-clean-white">ShalaRex Cleaning Solutions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom quote CTA */}
      <Card className="mt-stack-lg">
        <CardContent className="flex flex-col items-center gap-stack-sm pb-stack-lg pt-5 text-center">
          <h2 className="text-headline-md font-display text-laundry-blue-deep">Need a Custom Quote?</h2>
          <p className="max-w-md text-body-md text-on-surface-variant">
            For large volume orders, intricate items, or specialized cleaning needs, our team is ready to provide a precise estimate.
          </p>
          <div className="mt-1 flex flex-wrap justify-center gap-2">
            <Button asChild className="bg-[#25D366] text-white hover:bg-[#20bd5a] active:bg-[#1da851]">
              <a href={whatsappLink(`Hi Shalah Rex, I'd like a quote for ${service.title}.`)} target="_blank" rel="noreferrer">
                <WhatsAppIcon className="h-4 w-4" /> Chat on WhatsApp
              </a>
            </Button>
            <Button asChild>
              <a href={`tel:${business.phoneDisplay.replace(/\s/g, '')}`}>
                <Phone className="h-4 w-4" /> Call Now
              </a>
            </Button>
          </div>
          <p className="text-label-sm italic text-on-surface-variant">Average response time: 15 minutes</p>
        </CardContent>
      </Card>

      {/* FAQs */}
      <div className="mt-stack-lg">
        <h2 className="mb-stack-md text-center text-headline-md font-display text-on-surface">{service.title} FAQs</h2>
        <div className="mx-auto max-w-2xl">
          <Accordion type="single" collapsible className="flex flex-col gap-2">
            {service.faqs.map((faq) => (
              <AccordionItem key={faq.q} value={faq.q} className="rounded-lg border border-outline-variant/40 px-stack-sm">
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* Cross-sell */}
      <div className="mt-stack-lg">
        <h2 className="mb-stack-sm text-headline-md font-display text-on-surface">Other Services</h2>
        <div className="grid grid-cols-1 gap-stack-md sm:grid-cols-3">
          {otherServices.map((s) => (
            <Link key={s.slug} to={paths.serviceDetail(s.slug)}>
              <Card className="overflow-hidden transition-shadow hover:shadow-soft-lift">
                <img src={s.image} alt="" className="aspect-video w-full object-cover" />
                <CardContent className="pt-stack-sm">
                  <p className="text-label-md font-bold normal-case text-on-surface">{s.title}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

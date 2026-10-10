import { Link } from 'react-router-dom'
import { ShieldCheck, Leaf, Clock, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { business } from '@/lib/constants'
import { heroImage, services } from '@/lib/services'
import { useSeo } from '@/hooks/useSeo'
import { SERVICE_AREAS, staticSeo } from '@/lib/seo'
import { paths } from '@/routes/paths'

const pillars = [
  { icon: ShieldCheck, title: 'Quality Guarantee', desc: "Not happy with a wash? We'll re-clean it free of charge, no questions asked." },
  { icon: Clock, title: 'Reliable Timing', desc: 'Regular, White Wash, and Express tiers with honest, published turnaround times.' },
  { icon: Leaf, title: 'Fabric Care', desc: 'Every garment is sorted and treated according to its fabric, nothing gets a one-size-fits-all wash.' },
]

export default function AboutPage() {
  useSeo(staticSeo('/about'))

  return (
    <div className="flex flex-col">
      <div className="relative flex min-h-60 items-end overflow-hidden md:min-h-80">
        <img src={heroImage} alt={`${business.name} laundry in Lomalinda Extension, Enugu`} fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-laundry-blue-deep via-laundry-blue-deep/50 to-transparent" />
        <div className="relative mx-auto w-full min-w-0 max-w-shell px-margin-mobile pb-stack-lg md:px-gutter">
          <h1 className="text-headline-lg-mobile font-display text-clean-white md:text-headline-lg">About {business.name}, Enugu</h1>
        </div>
      </div>

      <div className="mx-auto w-full min-w-0 max-w-shell px-margin-mobile py-stack-lg md:px-gutter md:py-16">
        <p className="mx-auto max-w-2xl text-center text-body-lg text-on-surface-variant">
          We started {business.name} in {business.city} to bring a sophisticated, e-commerce-style laundry
          experience to a service that's traditionally felt like a chore. Every order, from a single T-shirt to a
          full Agbada, is treated with the same clinical care and attention to fabric detail.
        </p>
        <p className="mx-auto mt-stack-md max-w-2xl text-center text-body-lg text-on-surface-variant">
          Some customers know us as Shalarex Laundry. Whatever you call us, the idea is the same: laundry that
          comes to you. Our home pick up and delivery laundry service collects from your home or office, and every
          order can be tracked live from pick up to delivery.
        </p>

        <div className="mt-stack-lg grid grid-cols-1 gap-stack-md md:grid-cols-3">
          {pillars.map((pillar) => (
            <Card key={pillar.title}>
              <CardContent className="flex flex-col items-center gap-2 pt-stack-lg text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <pillar.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-label-md font-bold normal-case text-on-surface">{pillar.title}</p>
                <p className="text-body-md text-on-surface-variant">{pillar.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-stack-lg grid grid-cols-1 gap-stack-lg md:grid-cols-2">
          <section>
            <h2 className="text-headline-md font-display text-on-surface">What We Do</h2>
            <p className="mt-stack-sm text-body-md text-on-surface-variant">
              We are a full-service Enugu laundry: washing and ironing for everyday and native wear, dry cleaning for
              suits and delicates, stain removal, curtain and bedding cleaning, and repairs. Choose Regular, White
              Wash or Express (as fast as 24 hours) on every item, and pay by card, bank transfer, USSD or cash on
              delivery.
            </p>
            <ul className="mt-stack-sm flex flex-col gap-1">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link to={paths.serviceDetail(s.slug)} className="text-body-md font-semibold text-primary underline">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-headline-md font-display text-on-surface">Where We Are</h2>
            <p className="mt-stack-sm flex items-start gap-2 text-body-md text-on-surface-variant">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {business.address}
            </p>
            <p className="mt-stack-sm text-body-md text-on-surface-variant">
              Drop off at our facility for free, or book home pick up and delivery anywhere we cover in Enugu:
            </p>
            <p className="mt-1 text-body-md text-on-surface">{SERVICE_AREAS.join(', ')}.</p>
          </section>
        </div>
      </div>
    </div>
  )
}

import { ShieldCheck, Leaf, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { business } from '@/lib/constants'
import { heroImage } from '@/lib/services'

const pillars = [
  { icon: ShieldCheck, title: 'Quality Guarantee', desc: "Not happy with a wash? We'll re-clean it free of charge, no questions asked." },
  { icon: Clock, title: 'Reliable Timing', desc: 'Regular, White Wash, and Express tiers with honest, published turnaround times.' },
  { icon: Leaf, title: 'Fabric Care', desc: 'Every garment is sorted and treated according to its fabric, nothing gets a one-size-fits-all wash.' },
]

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      <div className="relative flex min-h-60 items-end overflow-hidden md:min-h-80">
        <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-laundry-blue-deep via-laundry-blue-deep/50 to-transparent" />
        <div className="relative mx-auto w-full min-w-0 max-w-shell px-margin-mobile pb-stack-lg md:px-gutter">
          <h1 className="text-headline-lg-mobile font-display text-clean-white md:text-headline-lg">About {business.name}</h1>
        </div>
      </div>

      <div className="mx-auto w-full min-w-0 max-w-shell px-margin-mobile py-stack-lg md:px-gutter md:py-16">
        <p className="mx-auto max-w-2xl text-center text-body-lg text-on-surface-variant">
          We started {business.name} in {business.city} to bring a sophisticated, e-commerce-style laundry
          experience to a service that's traditionally felt like a chore. Every order, from a single T-shirt to a
          full Agbada, is treated with the same clinical care and attention to fabric detail.
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
      </div>
    </div>
  )
}

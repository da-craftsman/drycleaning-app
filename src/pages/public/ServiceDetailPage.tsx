import { useParams, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { services } from '@/lib/services'
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
    <div className="flex flex-col">
      <div className="relative flex min-h-70 items-end overflow-hidden md:min-h-90">
        <img src={service.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-laundry-blue-deep via-laundry-blue-deep/50 to-transparent" />
        <div className="relative mx-auto w-full min-w-0 max-w-shell px-margin-mobile pb-stack-lg md:px-gutter">
          <h1 className="text-headline-lg-mobile font-display text-clean-white md:text-headline-lg">{service.title}</h1>
        </div>
      </div>

      <div className="mx-auto w-full min-w-0 max-w-shell px-margin-mobile py-stack-lg md:px-gutter">
        <Link to={paths.services} className="mb-stack-md flex items-center gap-1 text-label-md text-on-surface-variant hover:text-on-surface">
          <ChevronLeft className="h-4 w-4" /> All Services
        </Link>

        <p className="max-w-2xl text-body-lg text-on-surface-variant">{service.description}</p>

        <Button size="lg" asChild className="mt-stack-md">
          <Link to={paths.order}>Start an Order</Link>
        </Button>

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
    </div>
  )
}

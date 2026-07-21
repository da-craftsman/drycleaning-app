import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BadgeCheck,
  Check,
  ChevronRight,
  Clock,
  Leaf,
  Package,
  ReceiptText,
  ShieldCheck,
  ShieldQuestion,
  Star,
  Truck,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ItemCard } from '@/features/catalog/ItemCard'
import { useClothingItems } from '@/lib/queries/useClothingItems'
import { usePromoBanner } from '@/lib/queries/usePromoBanner'
import { usePublishedBlogPosts } from '@/lib/queries/useBlogPosts'
import { paths } from '@/routes/paths'
import { cn, isExternalUrl } from '@/lib/utils'
import { services, heroImage } from '@/lib/services'

const trackEveryStepImage = '/images/home/track-every-step.jpg'

/** Renders a real page navigation for admin-entered external URLs (e.g. https://wa.me/...), or client-side routing for internal paths. */
function BannerLink({ to, className, children }: { to: string; className?: string; children: ReactNode }) {
  if (isExternalUrl(to)) {
    return (
      <a href={to} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    )
  }
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  )
}

const heroStats = [
  { value: '500+', label: 'Orders completed' },
  { value: '24h', label: 'Express available' },
  { value: '8+', label: 'Enugu zones covered' },
]

const valueProps = [
  {
    variant: 'light' as const,
    icon: ShieldQuestion,
    title: 'Expert Care',
    bullets: ['Specialized Dry Cleaning', 'Delicate Fabric Handling', 'Professional Stain Removal'],
  },
  {
    variant: 'featured' as const,
    icon: Zap,
    title: 'Speedy Turnaround',
    desc: 'Need it fast? Our express service guarantees your garments are ready within 24 hours without compromising on quality.',
    badge: 'Express 24H Wash',
  },
  {
    variant: 'light' as const,
    icon: Truck,
    title: 'Seamless Logistics',
    bullets: ['Doorstep Pickup & Delivery', 'Real-time Tracking', 'Contactless Service'],
  },
]

const whyChooseUs = [
  { icon: ShieldCheck, title: 'Trusted Across Enugu', desc: 'Hundreds of households and businesses trust us with their laundry every week.' },
  { icon: Clock, title: 'Live Order Tracking', desc: 'Know exactly where your order is, from pickup to a freshly pressed finish.' },
  { icon: BadgeCheck, title: 'Transparent Pricing', desc: 'No hidden fees. See the exact price per item before you place an order.' },
  { icon: Leaf, title: 'Eco-Conscious Wash', desc: 'Detergents and processes chosen to be gentle on fabric and on the environment.' },
]

const trackingSteps = [
  { title: 'Pickup Confirmed', desc: 'Agent assigned and on the way', status: 'done' as const },
  { title: 'In Processing', desc: 'Your clothes are undergoing specialized care', status: 'active' as const },
  { title: 'Ready for Delivery', desc: 'Final quality inspection completed', status: 'pending' as const },
]

const testimonials = [
  { name: 'Ngozi A.', quote: 'Express turnaround saved me before a big meeting. Spotless shirts, right on time.', rating: 5 },
  { name: 'Chukwuemeka O.', quote: 'The tracking page is genuinely useful, I always know exactly where my order is.', rating: 5 },
  { name: 'Adaeze I.', quote: 'My agbada came back looking brand new. Worth every naira.', rating: 5 },
]

export default function HomePage() {
  const { data: items, isLoading } = useClothingItems()
  const popular = items?.slice(0, 8)
  const { data: banner } = usePromoBanner()
  const { data: posts } = usePublishedBlogPosts()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative flex min-h-105 items-center overflow-hidden md:min-h-140">
        <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-laundry-blue-deep via-laundry-blue-deep/60 to-laundry-blue-deep/10" />
        <div className="relative mx-auto flex w-full min-w-0 max-w-shell flex-col gap-stack-sm px-margin-mobile py-16 md:px-gutter md:py-24">
          <h1 className="max-w-md text-headline-lg-mobile font-display text-clean-white md:max-w-xl md:text-display-lg">
            Pristine clothes, simplified living.
          </h1>
          <p className="max-w-sm text-body-md text-clean-white/85 md:max-w-md md:text-body-lg">
            Premium wash, iron, pickup and delivery for Enugu, track every stage live.
          </p>
          <Button size="lg" asChild className="mt-2 w-fit">
            <Link to={paths.order}>
              <Package className="h-5 w-5" /> Start New Order
            </Link>
          </Button>

          <div className="mt-8 flex min-w-0 items-center gap-3 md:gap-8">
            {heroStats.map((stat, i) => (
              <div
                key={stat.label}
                className={cn('flex min-w-0 items-center gap-3 md:gap-8', i > 0 && 'border-l border-clean-white/20 pl-3 md:pl-8')}
              >
                <div className="min-w-0">
                  <p className="font-display text-label-md text-clean-white md:text-headline-md">{stat.value}</p>
                  <p className="whitespace-nowrap text-[10px] leading-tight text-clean-white/70 md:text-label-sm">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promo banner */}
      {banner && banner.is_active && (
        <section className="bg-surface-container-low py-stack-md">
          <div className="mx-auto w-full min-w-0 max-w-shell px-margin-mobile md:px-gutter">
            <BannerLink
              to={banner.link_url}
              className="relative flex min-h-37.5 items-center overflow-hidden rounded-2xl shadow-soft-lift md:min-h-97.5"
            >
              {banner.image_url ? (
                <>
                  <img src={banner.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-linear-to-t from-laundry-blue-deep/80 via-laundry-blue-deep/20 to-transparent" />
                  <div className="relative flex w-full items-center justify-between p-stack-md">
                    <div>
                      <p className="text-label-sm font-bold uppercase text-clean-white">{banner.title}</p>
                      <p className="text-headline-md font-display text-clean-white">{banner.subtitle}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex w-full items-center justify-between bg-linear-to-r from-secondary-fixed to-secondary-container p-stack-md">
                  <div>
                    <p className="text-label-sm font-bold uppercase text-on-secondary-container">{banner.title}</p>
                    <p className="text-headline-md font-display text-on-secondary-container">{banner.subtitle}</p>
                  </div>
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-on-secondary-container/10">
                    <ReceiptText className="h-7 w-7 text-on-secondary-container" />
                  </div>
                </div>
              )}
            </BannerLink>
          </div>
        </section>
      )}

      <div className="mx-auto w-full min-w-0 max-w-shell px-margin-mobile md:px-gutter">
        {/* Value proposition */}
        <div className="mt-stack-lg grid grid-cols-1 gap-stack-md md:grid-cols-3">
          {valueProps.map((v) =>
            v.variant === 'featured' ? (
              <div key={v.title} className="flex flex-col gap-stack-sm rounded-2xl bg-laundry-blue-deep p-stack-lg shadow-soft-lift md:scale-105">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary-container">
                  <v.icon className="h-5 w-5 text-on-secondary-container" />
                </div>
                <p className="text-body-lg font-bold normal-case text-clean-white">{v.title}</p>
                <p className="text-body-md text-clean-white/75">{v.desc}</p>
                <span className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-urgent-express/15 px-3 py-1 text-label-sm font-bold uppercase text-urgent-express">
                  <Zap className="h-3.5 w-3.5" /> {v.badge}
                </span>
              </div>
            ) : (
              <div key={v.title} className="flex flex-col gap-stack-sm rounded-2xl bg-surface-container-low p-stack-lg">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <v.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-body-lg font-bold normal-case text-on-surface">{v.title}</p>
                <ul className="flex flex-col gap-1.5">
                  {v.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-body-md text-on-surface-variant">
                      <Check className="h-4 w-4 shrink-0 text-success-green" /> {b}
                    </li>
                  ))}
                </ul>
              </div>
            ),
          )}
        </div>

        {/* Quick actions */}
        <div className="mt-stack-lg grid grid-cols-2 gap-3">
          <Link to={paths.trackLookup} className="block w-full">
            <Card className="w-full transition-shadow hover:shadow-soft-lift">
              <CardContent className="flex w-full flex-col items-center justify-center gap-2 py-stack-md text-center">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <span className="text-label-md font-bold normal-case text-on-surface">Track Order</span>
              </CardContent>
            </Card>
          </Link>
          <Link to={paths.services} className="block w-full">
            <Card className="w-full transition-shadow hover:shadow-soft-lift">
              <CardContent className="flex w-full flex-col items-center justify-center gap-2 py-stack-md text-center">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary-container/40">
                  <ReceiptText className="h-5 w-5 text-on-secondary-container" />
                </div>
                <span className="text-label-md font-bold normal-case text-on-surface">Price List</span>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Our Services */}
        <div className="mt-stack-lg flex items-center justify-between">
          <h2 className="text-headline-md font-display text-on-surface">Our Services</h2>
          <Link to={paths.services} className="text-label-md font-semibold text-primary">
            View all
          </Link>
        </div>
        <div className="mt-stack-sm flex flex-col gap-2">
          {services.slice(0, 4).map((service) => (
            <Link key={service.slug} to={paths.services}>
              <Card className="flex items-center gap-3 p-stack-sm transition-shadow hover:shadow-soft-lift">
                <img src={service.image} alt="" className="h-16 w-16 shrink-0 rounded object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-label-md font-bold normal-case text-on-surface">{service.title}</p>
                  <p className="truncate text-label-sm text-on-surface-variant">{service.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-on-surface-variant" />
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Why choose us */}
      <section className="mt-stack-lg bg-surface-container-low py-stack-lg md:py-16">
        <div className="mx-auto w-full min-w-0 max-w-shell px-margin-mobile md:px-gutter">
          <h2 className="text-center text-headline-md font-display text-on-surface md:text-headline-lg">Why Choose Us</h2>
          <div className="mt-stack-lg grid grid-cols-1 gap-stack-md sm:grid-cols-2 md:grid-cols-4">
            {whyChooseUs.map((w) => (
              <Card key={w.title}>
                <CardContent className="flex flex-col items-center gap-2 pt-stack-lg text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                    <w.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-label-md font-bold normal-case text-on-surface">{w.title}</p>
                  <p className="text-body-md text-on-surface-variant">{w.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Track every step */}
      <section className="py-stack-lg md:py-16">
        <div className="mx-auto w-full min-w-0 max-w-shell px-margin-mobile md:px-gutter">
          <div className="grid grid-cols-1 items-center gap-stack-lg md:grid-cols-2 md:gap-stack-lg">
            <img
              src={trackEveryStepImage}
              alt="Customer checking their laundry order status on a phone"
              className="aspect-4/5 w-full rounded-2xl object-cover md:aspect-square"
            />
            <div>
              <h2 className="text-headline-md font-display text-on-surface md:text-headline-lg">Track Every Step</h2>
              <p className="mt-stack-sm text-body-md text-on-surface-variant md:text-body-lg">
                Stay informed from the moment we pick up your laundry until it arrives back at your doorstep, fresh and pressed.
              </p>
              <div className="mt-stack-md flex flex-col gap-stack-sm">
                {trackingSteps.map((step) => (
                  <div key={step.title} className="flex items-start gap-3">
                    {step.status === 'done' && (
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    )}
                    {step.status === 'active' && (
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-primary">
                        <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                      </span>
                    )}
                    {step.status === 'pending' && (
                      <span className="mt-0.5 h-6 w-6 shrink-0 rounded-full border-2 border-outline-variant" />
                    )}
                    <div>
                      <p className={cn('text-label-md font-bold normal-case', step.status === 'pending' ? 'text-on-surface-variant' : 'text-on-surface')}>
                        {step.title}
                      </p>
                      <p className="text-body-md text-on-surface-variant">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Most Cleaned Items */}
      <section className="bg-surface-container-low py-stack-lg md:py-16">
        <div className="mx-auto w-full min-w-0 max-w-shell px-margin-mobile md:px-gutter">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-md font-display text-on-surface md:text-headline-lg">Most Cleaned Items</h2>
            <Link to={paths.order} className="text-label-md font-semibold text-primary">
              Add More to Wash
            </Link>
          </div>
          <div className="mt-stack-md grid grid-cols-2 gap-3 sm:grid-cols-4">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-4/5 w-full" />)
              : popular?.map((item) => <ItemCard key={item.id} item={item} onSelect={() => navigate(paths.order)} />)}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-stack-lg md:py-16">
        <div className="mx-auto w-full min-w-0 max-w-shell px-margin-mobile md:px-gutter">
          <h2 className="text-center text-headline-md font-display text-on-surface md:text-headline-lg">What customers say</h2>
          <div className="mt-stack-lg grid grid-cols-1 gap-stack-md md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name}>
                <CardContent className="flex flex-col gap-2 pt-stack-md">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-secondary-container text-secondary-container" />
                    ))}
                  </div>
                  <p className="text-body-md text-on-surface-variant">&ldquo;{t.quote}&rdquo;</p>
                  <p className="text-label-md font-bold text-on-surface">{t.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-stack-lg md:py-16">
        <div className="mx-auto flex w-full min-w-0 max-w-shell flex-col items-center gap-stack-md px-margin-mobile text-center md:px-gutter">
          <h2 className="text-headline-md font-display text-on-primary md:text-headline-lg">Ready for fresher laundry?</h2>
          <p className="max-w-md text-body-md text-on-primary/90">
            Build your order in minutes and let us handle the rest: wash, iron, pickup, delivery.
          </p>
          <Button size="lg" variant="express" asChild>
            <Link to={paths.order}>Start a New Order</Link>
          </Button>
        </div>
      </section>

      {/* News & Insight */}
      {posts && posts.length > 0 && (
        <section className="bg-surface-container-low py-stack-lg md:py-16">
          <div className="mx-auto w-full min-w-0 max-w-shell px-margin-mobile md:px-gutter">
            <div className="flex items-center justify-between">
              <h2 className="text-headline-md font-display text-on-surface md:text-headline-lg">News & Insight</h2>
              <Link to={paths.blog} className="text-label-md font-semibold text-primary">
                Read more
              </Link>
            </div>
            <div className="mt-stack-md grid grid-cols-1 gap-stack-md md:grid-cols-3">
              {posts.slice(0, 3).map((post) => (
                <Link key={post.id} to={paths.blogPost(post.slug)}>
                  <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-soft-lift">
                    {post.feature_image ? (
                      <img src={post.feature_image} alt="" className="aspect-video w-full object-cover" />
                    ) : (
                      <div className="aspect-video w-full bg-surface-container" />
                    )}
                    <CardContent className="flex flex-1 flex-col gap-1 pt-stack-md">
                      <p className="text-label-sm uppercase text-on-surface-variant">{post.category}</p>
                      <p className="text-label-md font-bold normal-case text-on-surface">{post.title}</p>
                      <p className="text-body-md text-on-surface-variant">{post.excerpt}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

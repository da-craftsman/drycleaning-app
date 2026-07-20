import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Shirt } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CategoryPills, ALL_CATEGORIES } from '@/features/catalog/CategoryPills'
import { formatNaira } from '@/features/catalog/ItemCard'
import { useClothingItems } from '@/lib/queries/useClothingItems'
import { paths } from '@/routes/paths'
import { services } from '@/lib/services'

export default function ServicesPage() {
  const { data: items, isLoading } = useClothingItems()
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES)
  const navigate = useNavigate()

  const visibleItems = useMemo(
    () => (items ?? []).filter((i) => activeCategory === ALL_CATEGORIES || i.category_id === activeCategory),
    [items, activeCategory],
  )

  return (
    <div className="flex flex-col">
      <div className="mx-auto w-full min-w-0 max-w-shell px-margin-mobile py-stack-lg md:px-gutter md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-headline-lg-mobile font-display text-laundry-blue-deep md:text-headline-lg">
            Our Services
          </h1>
          <p className="mt-stack-sm text-body-md text-on-surface-variant">
            Six ways we take laundry off your plate, every service bundles Washing + Ironing.
          </p>
        </div>

        <div className="mt-stack-lg grid grid-cols-1 gap-stack-md sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link key={service.slug} to={paths.serviceDetail(service.slug)}>
              <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-soft-lift">
                <img src={service.image} alt="" className="aspect-video w-full object-cover" />
                <CardContent className="flex flex-1 flex-col gap-1 pt-stack-md">
                  <p className="text-label-md font-bold normal-case text-on-surface">{service.title}</p>
                  <p className="text-body-md text-on-surface-variant">{service.description}</p>
                  <span className="mt-auto flex items-center gap-1 pt-2 text-label-md font-semibold text-primary">
                    Learn more <ChevronRight className="h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-surface-container-low py-stack-lg md:py-16">
        <div className="mx-auto w-full min-w-0 max-w-shell px-margin-mobile md:px-gutter">
          <div className="mb-stack-md flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-headline-md font-display text-on-surface">Full Price List</h2>
              <p className="text-body-md text-on-surface-variant">Every item, every tier.</p>
            </div>
            <Button onClick={() => navigate(paths.order)}>Start an Order</Button>
          </div>

          <div className="mb-stack-md">
            <CategoryPills value={activeCategory} onChange={setActiveCategory} />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {visibleItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="flex items-center gap-3 pt-stack-md">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded bg-surface-container-low p-1">
                      {item.thumbnail_url ? (
                        <img src={item.thumbnail_url} alt={item.name} className="h-full w-full object-contain" />
                      ) : (
                        <Shirt className="h-5 w-5 text-outline" strokeWidth={1.5} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-label-md font-bold normal-case text-on-surface">{item.name}</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <Badge variant="neutral">{formatNaira(item.price_regular)} Regular</Badge>
                        <Badge variant="primary">{formatNaira(item.price_white)} White</Badge>
                        <Badge variant="express">{formatNaira(item.price_express)} Express</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

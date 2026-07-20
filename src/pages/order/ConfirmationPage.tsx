import { useParams, Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatNaira } from '@/features/catalog/ItemCard'
import { useOrderByDisplayId, useOrderItems } from '@/lib/queries/useOrders'
import { paths } from '@/routes/paths'

export default function ConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { data: order, isLoading } = useOrderByDisplayId(orderId)
  const { data: items } = useOrderItems(order?.id)

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-stack-md px-margin-mobile py-stack-lg">
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="mx-auto w-full min-w-0 max-w-2xl px-margin-mobile py-stack-lg text-center">
        <p className="text-body-lg text-on-surface-variant">We couldn't find that order.</p>
        <Button asChild className="mt-stack-md">
          <Link to={paths.order}>Start a New Order</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-stack-lg px-margin-mobile py-stack-lg text-center md:px-gutter">
      <div className="flex flex-col items-center gap-stack-sm">
        <CheckCircle2 className="h-14 w-14 text-success-green" strokeWidth={1.5} />
        <h1 className="font-display text-headline-lg-mobile text-laundry-blue-deep md:text-headline-lg">Order Confirmed</h1>
        <p className="text-body-md text-on-surface-variant">
          Order <span className="font-bold text-on-surface">{order.display_id}</span> has been received.
        </p>
      </div>

      <Card className="text-left">
        <CardContent className="flex flex-col gap-stack-sm pt-stack-md">
          {items?.map((line) => (
            <div key={line.id} className="flex items-center justify-between text-body-md">
              <span className="text-on-surface-variant">
                {line.quantity} × {line.item_name} <span className="capitalize">({line.service_tier})</span>
              </span>
              <span className="font-semibold text-on-surface">{formatNaira(line.line_total)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-outline-variant/40 pt-stack-sm text-body-md">
            <span className="text-on-surface-variant">Delivery fee</span>
            <span className="font-semibold text-on-surface">{formatNaira(order.delivery_fee)}</span>
          </div>
          <div className="flex items-center justify-between text-body-lg">
            <span className="font-bold text-on-surface">Total</span>
            <span className="font-bold text-on-surface">{formatNaira(order.total)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button asChild size="lg">
          <Link to={paths.track(order.display_id)}>Track Your Order</Link>
        </Button>
        <Button asChild variant="ghost" size="lg">
          <Link to={paths.order}>Place Another Order</Link>
        </Button>
      </div>
    </div>
  )
}

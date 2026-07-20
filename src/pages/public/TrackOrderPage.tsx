import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Search, Phone, MessageCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { OrderHeader } from '@/features/tracking/OrderHeader'
import { OrderDetailTabs } from '@/features/tracking/OrderDetailTabs'
import { useOrderByDisplayId, useOrderItems } from '@/lib/queries/useOrders'
import { useDeliveryZones } from '@/lib/queries/useDeliveryZones'
import { paths } from '@/routes/paths'
import { whatsappLink } from '@/lib/constants'

function LookupForm() {
  const [value, setValue] = useState('')
  const navigate = useNavigate()

  return (
    <form
      className="mx-auto flex w-full max-w-md flex-col gap-stack-sm"
      onSubmit={(e) => {
        e.preventDefault()
        if (value.trim()) navigate(paths.track(value.trim()))
      }}
    >
      <label htmlFor="order-lookup" className="text-label-sm uppercase text-on-surface-variant">
        Order ID
      </label>
      <div className="flex gap-2">
        <Input
          id="order-lookup"
          placeholder="SRL-178446"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button type="submit" size="md">
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}

function TrackingView({ orderId }: { orderId: string }) {
  const { data: order, isLoading } = useOrderByDisplayId(orderId)
  const { data: items } = useOrderItems(order?.id)
  const { data: zones } = useDeliveryZones()
  const zone = zones?.find((z) => z.id === order?.zone_id)

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-2xl px-margin-mobile py-stack-lg">
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-stack-md px-margin-mobile py-stack-lg text-center">
        <p className="text-body-lg text-on-surface-variant">
          We couldn't find an order with ID <span className="font-bold text-on-surface">{orderId}</span>.
        </p>
        <LookupForm />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-stack-md px-margin-mobile py-stack-lg md:px-gutter">
      <OrderHeader order={order} />

      <OrderDetailTabs order={order} items={items} zoneName={zone?.name} />

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button asChild variant="outline">
          <a href={`tel:${order.phone}`}>
            <Phone className="h-4 w-4" /> Call Support
          </a>
        </Button>
        <Button asChild variant="ghost">
          <a href={whatsappLink(`Hi, I'd like an update on order ${order.display_id}.`)} target="_blank" rel="noreferrer">
            <MessageCircle className="h-4 w-4" /> WhatsApp Us
          </a>
        </Button>
      </div>
    </div>
  )
}

export default function TrackOrderPage() {
  const { orderId } = useParams<{ orderId: string }>()

  if (!orderId) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-stack-lg px-margin-mobile py-stack-lg text-center md:px-gutter">
        <div>
          <h1 className="font-display text-headline-lg-mobile text-laundry-blue-deep md:text-headline-lg">Track an Order</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">Enter the order ID from your confirmation to see live status.</p>
        </div>
        <LookupForm />
      </div>
    )
  }

  return <TrackingView orderId={orderId} />
}

import { useParams, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { OrderHeader } from '@/features/tracking/OrderHeader'
import { OrderDetailTabs } from '@/features/tracking/OrderDetailTabs'
import { ReorderButton } from '@/features/dashboard/ReorderButton'
import { ReceiptDownload } from '@/features/dashboard/ReceiptDownload'
import { useDeliveryZones } from '@/lib/queries/useDeliveryZones'
import { useOrder, useOrderItems } from '@/lib/queries/useOrders'
import { paths } from '@/routes/paths'

export default function AccountOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: order, isLoading } = useOrder(id)
  const { data: items } = useOrderItems(id)
  const { data: zones } = useDeliveryZones()
  const zone = zones?.find((z) => z.id === order?.zone_id)

  if (isLoading || !order) {
    return (
      <div className="mx-auto w-full min-w-0 max-w-2xl px-margin-mobile py-stack-lg">
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-stack-md px-margin-mobile py-stack-lg md:px-gutter">
      <Link to={paths.accountOrders} className="flex items-center gap-1 text-label-md text-on-surface-variant hover:text-on-surface">
        <ChevronLeft className="h-4 w-4" /> My Orders
      </Link>

      <OrderHeader order={order} />

      <OrderDetailTabs order={order} items={items} zoneName={zone?.name} />

      <div className="flex flex-wrap gap-2">
        <ReorderButton order={order} />
        {items && <ReceiptDownload order={order} items={items} />}
        <Button variant="outline" size="sm" asChild>
          <Link to={paths.accountTickets}>Report an Issue</Link>
        </Button>
      </div>
    </div>
  )
}

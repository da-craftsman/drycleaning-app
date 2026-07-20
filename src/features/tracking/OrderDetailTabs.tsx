import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { TrackingTimeline } from '@/features/tracking/TrackingTimeline'
import { formatNaira } from '@/features/catalog/ItemCard'
import { useOrderStatusHistory } from '@/lib/queries/useOrders'
import type { LogisticsType, Order, OrderItem } from '@/types/database'

const logisticsLabels: Record<LogisticsType, string> = {
  self_dropoff: 'Self drop-off & pickup',
  pickup_only: 'Pickup only',
  delivery_only: 'Delivery only',
  pickup_and_delivery: 'Pickup & delivery',
}

/** Shared Summary/Tracking Status tabs used on both the public tracking page and the account order detail page. */
function OrderDetailTabs({ order, items, zoneName }: { order: Order; items: OrderItem[] | undefined; zoneName?: string }) {
  const { data: history = [] } = useOrderStatusHistory(order.id)

  return (
    <Tabs defaultValue="summary">
      <TabsList>
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="tracking">Tracking Status</TabsTrigger>
      </TabsList>

      <TabsContent value="summary" className="flex flex-col gap-stack-md pt-stack-md">
        <Card>
          <CardContent className="flex flex-col gap-stack-sm pt-stack-md">
            <p className="text-label-sm uppercase text-on-surface-variant">Items</p>
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

        <Card>
          <CardContent className="flex flex-col gap-1 pt-stack-md text-body-md text-on-surface-variant">
            <p className="text-label-sm uppercase text-on-surface-variant">Delivery</p>
            <p>
              {logisticsLabels[order.logistics_type]}
              {zoneName && ` · ${zoneName}`}
            </p>
            <p>{order.address}</p>
            {order.special_instructions && <p>Instructions: {order.special_instructions}</p>}
            {order.rider_name && <p>Rider: {order.rider_name}</p>}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="tracking" className="pt-stack-md">
        <Card className="p-stack-md">
          <p className="mb-stack-sm text-label-sm uppercase text-on-surface-variant">Tracking Status</p>
          <TrackingTimeline status={order.status} history={history} />
        </Card>
      </TabsContent>
    </Tabs>
  )
}

export { OrderDetailTabs }

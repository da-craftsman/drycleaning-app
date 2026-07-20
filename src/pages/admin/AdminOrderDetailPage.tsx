import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Phone, MessageCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrackingTimeline } from '@/features/tracking/TrackingTimeline'
import { OrderStatusBadge, orderStatusLabels } from '@/features/dashboard/OrderStatusBadge'
import { ReceiptDownload } from '@/features/dashboard/ReceiptDownload'
import { formatNaira } from '@/features/catalog/ItemCard'
import { useToast } from '@/hooks/use-toast'
import { useOrder, useOrderItems, useOrderStatusHistory } from '@/lib/queries/useOrders'
import { useUpdateOrderStatus } from '@/lib/queries/useCreateOrder'
import { whatsappLink } from '@/lib/constants'
import { getErrorMessage } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { OrderStatus } from '@/types/database'

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: order, isLoading } = useOrder(id)
  const { data: items } = useOrderItems(id)
  const { data: history = [] } = useOrderStatusHistory(id)
  const updateStatus = useUpdateOrderStatus()
  const { toast } = useToast()
  const [rider, setRider] = useState('')

  useEffect(() => {
    if (order) setRider(order.rider_name ?? '')
  }, [order])

  if (isLoading || !order) {
    return (
      <div className="mx-auto w-full min-w-0 max-w-2xl px-margin-mobile py-stack-lg">
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-stack-md px-margin-mobile py-stack-lg md:px-gutter">
      <Link to={paths.adminOrders} className="flex items-center gap-1 text-label-md text-on-surface-variant hover:text-on-surface">
        <ChevronLeft className="h-4 w-4" /> Orders
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-headline-md font-display text-on-surface">{order.display_id}</h1>
        <OrderStatusBadge status={order.status} />
      </div>

      <Card className="p-stack-md">
        <TrackingTimeline status={order.status} history={history} />
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-stack-md pt-stack-md">
          <div className="grid grid-cols-1 gap-stack-md sm:grid-cols-2">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={order.status}
                onValueChange={(status) =>
                  updateStatus.mutate(
                    { orderId: order.id, status: status as OrderStatus, riderName: rider },
                    {
                      onSuccess: () => toast({ title: 'Order status updated', variant: 'success' }),
                      onError: (err) =>
                        toast({ title: 'Failed to update status', description: getErrorMessage(err, 'Please try again.'), variant: 'error' }),
                    },
                  )
                }
              >
                <SelectTrigger id="status" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(orderStatusLabels) as OrderStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {orderStatusLabels[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="rider">Rider</Label>
              <div className="mt-1 flex gap-2">
                <Input id="rider" value={rider} onChange={(e) => setRider(e.target.value)} placeholder="Assign a rider" />
                <Button
                  variant="outline"
                  onClick={() =>
                    updateStatus.mutate(
                      { orderId: order.id, status: order.status, riderName: rider },
                      {
                        onSuccess: () => toast({ title: 'Rider updated', variant: 'success' }),
                        onError: (err) =>
                          toast({ title: 'Failed to update rider', description: getErrorMessage(err, 'Please try again.'), variant: 'error' }),
                      },
                    )
                  }
                  disabled={updateStatus.isPending}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={`tel:${order.phone}`}>
                <Phone className="h-4 w-4" /> Call
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={whatsappLink(`Hi, this is Shalah Rex Laundry regarding your order ${order.display_id}.`)} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </Button>
            {items && <ReceiptDownload order={order} items={items} />}
          </div>
        </CardContent>
      </Card>

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
          <div className="flex items-center justify-between border-t border-outline-variant/40 pt-stack-sm text-body-lg">
            <span className="font-bold text-on-surface">Total</span>
            <span className="font-bold text-on-surface">{formatNaira(order.total)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-1 pt-stack-md text-body-md text-on-surface-variant">
          <p className="text-label-sm uppercase text-on-surface-variant">Delivery</p>
          <p>{order.address}</p>
          {order.special_instructions && <p>Instructions: {order.special_instructions}</p>}
        </CardContent>
      </Card>
    </div>
  )
}

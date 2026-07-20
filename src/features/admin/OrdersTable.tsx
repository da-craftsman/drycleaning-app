import { Link } from 'react-router-dom'
import { Phone, MessageCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OrderStatusBadge, orderStatusLabels } from '@/features/dashboard/OrderStatusBadge'
import { formatNaira } from '@/features/catalog/ItemCard'
import { useToast } from '@/hooks/use-toast'
import { useUpdateOrderStatus } from '@/lib/queries/useCreateOrder'
import { whatsappLink } from '@/lib/constants'
import { getErrorMessage } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { Order, OrderStatus } from '@/types/database'

function OrdersTable({ orders, isLoading }: { orders?: Order[]; isLoading: boolean }) {
  const updateStatus = useUpdateOrderStatus()
  const { toast } = useToast()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  if (!orders || orders.length === 0) {
    return <p className="py-stack-lg text-center text-body-md text-on-surface-variant">No orders found.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardContent className="flex flex-col gap-stack-sm pt-stack-md sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <Link to={paths.adminOrder(order.id)} className="text-label-md font-bold normal-case text-primary">
                {order.display_id}
              </Link>
              <p className="text-label-sm text-on-surface-variant">
                {new Date(order.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })} · {order.phone}
              </p>
              <p className="text-label-md font-bold text-on-surface">{formatNaira(order.total)}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={order.status}
                onValueChange={(status) =>
                  updateStatus.mutate(
                    { orderId: order.id, status: status as OrderStatus },
                    {
                      onSuccess: () => toast({ title: 'Order status updated', variant: 'success' }),
                      onError: (err) =>
                        toast({ title: 'Failed to update status', description: getErrorMessage(err, 'Please try again.'), variant: 'error' }),
                    },
                  )
                }
              >
                <SelectTrigger className="h-9 w-44 text-label-sm">
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

              <a
                href={`tel:${order.phone}`}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low"
                aria-label="Call customer"
              >
                <Phone className="h-4 w-4" />
              </a>
              <a
                href={whatsappLink(`Hi, this is Shalah Rex Laundry regarding your order ${order.display_id}.`, order.whatsapp ?? order.phone)}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low"
                aria-label="WhatsApp customer"
              >
                <MessageCircle className="h-4 w-4" />
              </a>

              <OrderStatusBadge status={order.status} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export { OrdersTable }

import { Badge } from '@/components/ui/badge'
import type { OrderStatus } from '@/types/database'

const labels: Record<OrderStatus, string> = {
  order_received: 'Order Received',
  collected: 'Collected',
  processing: 'Processing',
  washing: 'Washing',
  ironing: 'Ironing',
  quality_check: 'Quality Check',
  ready: 'Ready',
  out_for_delivery: 'Out for Delivery',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const variant = status === 'completed' ? 'success' : status === 'cancelled' ? 'error' : 'primary'
  return <Badge variant={variant}>{labels[status]}</Badge>
}

export { OrderStatusBadge, labels as orderStatusLabels }

import { OrderStatusBadge } from '@/features/dashboard/OrderStatusBadge'
import type { Order } from '@/types/database'

const paymentMethodLabels: Record<Order['payment_method'], string> = {
  paystack: 'Paystack',
  cash_on_delivery: 'Cash on delivery',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
}

/** Status pill + order ID + last-update line, followed by an "Order Placed" / "Payment" meta row — shared across the tracking and account order detail pages. */
function OrderHeader({ order }: { order: Order }) {
  return (
    <div className="flex flex-col gap-stack-md">
      <div className="flex flex-col gap-1">
        <OrderStatusBadge status={order.status} />
        <h1 className="font-display text-headline-lg-mobile text-on-surface md:text-headline-lg">{order.display_id}</h1>
        <p className="text-label-sm text-on-surface-variant">Last update: {formatDate(order.updated_at)}</p>
      </div>

      <div className="grid grid-cols-2 gap-stack-md">
        <div>
          <p className="text-label-sm uppercase text-on-surface-variant">Order Placed</p>
          <p className="text-body-md font-bold text-on-surface">{formatDate(order.created_at)}</p>
        </div>
        <div>
          <p className="text-label-sm uppercase text-on-surface-variant">Payment</p>
          <p className="text-body-md font-bold text-on-surface">
            {paymentMethodLabels[order.payment_method]} · {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
          </p>
        </div>
      </div>
    </div>
  )
}

export { OrderHeader }

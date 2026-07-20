import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Phone, MessageCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { TrackingTimeline } from '@/features/tracking/TrackingTimeline'
import { OrderStatusBadge, orderStatusLabels } from '@/features/dashboard/OrderStatusBadge'
import { ReceiptDownload } from '@/features/dashboard/ReceiptDownload'
import { formatNaira } from '@/features/catalog/ItemCard'
import { useToast } from '@/hooks/use-toast'
import { useOrder, useOrderItems, useOrderStatusHistory } from '@/lib/queries/useOrders'
import { useUpdateOrderStatus, useMarkOrderPaid } from '@/lib/queries/useCreateOrder'
import { useProfile } from '@/lib/queries/useProfile'
import { whatsappLink } from '@/lib/constants'
import { getErrorMessage } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { Order, OrderItem, OrderStatus, OrderStatusHistoryEntry, Profile } from '@/types/database'

const paymentMethodLabels: Record<Order['payment_method'], string> = {
  paystack: 'Paystack',
  cash_on_delivery: 'Cash on delivery',
}

/** The live tracking timeline. Shown as its own tab on mobile (where it competes for vertical space) and side by side with ManagementCard on desktop. */
function TrackingCard({ status, history }: { status: OrderStatus; history: OrderStatusHistoryEntry[] }) {
  return (
    <Card className="p-stack-md">
      <TrackingTimeline status={status} history={history} />
    </Card>
  )
}

/** Status/rider controls and quick actions. Rendered twice (mobile tab + desktop column) with distinct field ids, sharing the same lifted state so both stay in sync. */
function ManagementCard({
  idSuffix,
  order,
  items,
  rider,
  onRiderChange,
  onStatusChange,
  onSaveRider,
  saving,
  onMarkPaid,
  markingPaid,
}: {
  idSuffix: string
  order: Order
  items: OrderItem[] | undefined
  rider: string
  onRiderChange: (value: string) => void
  onStatusChange: (status: OrderStatus) => void
  onSaveRider: () => void
  saving: boolean
  onMarkPaid: () => void
  markingPaid: boolean
}) {
  const statusId = `status-${idSuffix}`
  const riderId = `rider-${idSuffix}`
  return (
    <Card>
      <CardContent className="flex flex-col gap-stack-md pt-stack-md">
        <div>
          <Label htmlFor={statusId}>Status</Label>
          <Select value={order.status} onValueChange={(status) => onStatusChange(status as OrderStatus)}>
            <SelectTrigger id={statusId} className="mt-1">
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
          <Label>Payment</Label>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge variant={order.payment_status === 'paid' ? 'success' : 'neutral'}>
              {paymentMethodLabels[order.payment_method]} · {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
            </Badge>
            {order.payment_method === 'cash_on_delivery' && order.payment_status !== 'paid' && (
              <Button variant="outline" size="sm" onClick={onMarkPaid} disabled={markingPaid}>
                Mark as Paid
              </Button>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor={riderId}>Rider</Label>
          <div className="mt-1 flex gap-2">
            <Input id={riderId} value={rider} onChange={(e) => onRiderChange(e.target.value)} placeholder="Assign a rider" />
            <Button variant="outline" onClick={onSaveRider} disabled={saving}>
              Save
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={`tel:${order.phone}`}>
              <Phone className="h-4 w-4" /> Call
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a
              href={whatsappLink(`Hi, this is Shalah Rex Laundry regarding your order ${order.display_id}.`, order.whatsapp ?? order.phone)}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </Button>
          {items && <ReceiptDownload order={order} items={items} />}
        </div>
      </CardContent>
    </Card>
  )
}

/** Everything about the customer/order that isn't a live management action: who placed it, contact info, address, and the line-item breakdown. */
function CustomerDetailsCard({ order, items, profile }: { order: Order; items: OrderItem[] | undefined; profile: Profile | null | undefined }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-stack-md pt-stack-md">
        <p className="text-label-sm uppercase text-on-surface-variant">Customer Details</p>

        <div className="flex flex-col gap-1 text-body-md">
          <p className="text-on-surface-variant">
            Name: <span className="text-on-surface">{profile?.full_name ?? '—'}</span>
          </p>
          <p className="text-on-surface-variant">
            Email: <span className="text-on-surface">{profile?.email ?? '—'}</span>
          </p>
          <p className="text-on-surface-variant">
            Phone: <span className="text-on-surface">{order.phone}</span>
          </p>
          {order.whatsapp && (
            <p className="text-on-surface-variant">
              WhatsApp: <span className="text-on-surface">{order.whatsapp}</span>
            </p>
          )}
          <p className="text-on-surface-variant">
            Address: <span className="text-on-surface">{order.address}</span>
          </p>
          {order.special_instructions && (
            <p className="text-on-surface-variant">
              Instructions: <span className="text-on-surface">{order.special_instructions}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1 border-t border-outline-variant/40 pt-stack-sm">
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
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: order, isLoading } = useOrder(id)
  const { data: items } = useOrderItems(id)
  const { data: history = [] } = useOrderStatusHistory(id)
  const { data: profile } = useProfile(order?.user_id)
  const updateStatus = useUpdateOrderStatus()
  const markPaid = useMarkOrderPaid()
  const { toast } = useToast()
  const [rider, setRider] = useState('')

  useEffect(() => {
    if (order) setRider(order.rider_name ?? '')
  }, [order])

  if (isLoading || !order) {
    return (
      <div className="mx-auto w-full min-w-0 max-w-6xl px-margin-mobile py-stack-lg">
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const handleStatusChange = (status: OrderStatus) =>
    updateStatus.mutate(
      { orderId: order.id, status, riderName: rider },
      {
        onSuccess: () => toast({ title: 'Order status updated', variant: 'success' }),
        onError: (err) => toast({ title: 'Failed to update status', description: getErrorMessage(err, 'Please try again.'), variant: 'error' }),
      },
    )

  const handleSaveRider = () =>
    updateStatus.mutate(
      { orderId: order.id, status: order.status, riderName: rider },
      {
        onSuccess: () => toast({ title: 'Rider updated', variant: 'success' }),
        onError: (err) => toast({ title: 'Failed to update rider', description: getErrorMessage(err, 'Please try again.'), variant: 'error' }),
      },
    )

  const handleMarkPaid = () =>
    markPaid.mutate(order.id, {
      onSuccess: () => toast({ title: 'Order marked as paid', variant: 'success' }),
      onError: (err) => toast({ title: 'Failed to mark order paid', description: getErrorMessage(err, 'Please try again.'), variant: 'error' }),
    })

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-stack-md px-margin-mobile py-stack-lg md:px-gutter">
      <Link to={paths.adminOrders} className="flex items-center gap-1 text-label-md text-on-surface-variant hover:text-on-surface">
        <ChevronLeft className="h-4 w-4" /> Orders
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-headline-md font-display text-on-surface">{order.display_id}</h1>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Mobile: tracking competes with the management card for vertical space, so it's tucked behind a tab instead of always shown. Customer Details stays outside the tabs, always visible. */}
      <div className="flex flex-col gap-stack-md md:hidden">
        <Tabs defaultValue="manage">
          <TabsList>
            <TabsTrigger value="manage">Manage</TabsTrigger>
            <TabsTrigger value="tracking">Tracking</TabsTrigger>
          </TabsList>
          <TabsContent value="manage" className="pt-stack-md">
            <ManagementCard
              idSuffix="mobile"
              order={order}
              items={items}
              rider={rider}
              onRiderChange={setRider}
              onStatusChange={handleStatusChange}
              onSaveRider={handleSaveRider}
              saving={updateStatus.isPending}
              onMarkPaid={handleMarkPaid}
              markingPaid={markPaid.isPending}
            />
          </TabsContent>
          <TabsContent value="tracking" className="pt-stack-md">
            <TrackingCard status={order.status} history={history} />
          </TabsContent>
        </Tabs>
        <CustomerDetailsCard order={order} items={items} profile={profile} />
      </div>

      {/* Desktop: tracking on the left (free to use the extra width), management + customer details stacked in a fixed-width column on the right. */}
      <div className="hidden md:grid md:grid-cols-[1fr_400px] md:items-start md:gap-stack-md">
        <TrackingCard status={order.status} history={history} />
        <div className="flex flex-col gap-stack-md">
          <ManagementCard
            idSuffix="desktop"
            order={order}
            items={items}
            rider={rider}
            onRiderChange={setRider}
            onStatusChange={handleStatusChange}
            onSaveRider={handleSaveRider}
            saving={updateStatus.isPending}
            onMarkPaid={handleMarkPaid}
            markingPaid={markPaid.isPending}
          />
          <CustomerDetailsCard order={order} items={items} profile={profile} />
        </div>
      </div>
    </div>
  )
}

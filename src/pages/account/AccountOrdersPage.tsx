import { useMemo, useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { OrdersList } from '@/features/dashboard/OrdersList'
import { useAuth } from '@/hooks/useAuth'
import { useOrdersForUser } from '@/lib/queries/useOrders'

const ACTIVE_STATUSES = new Set(['order_received', 'collected', 'processing', 'washing', 'ironing', 'quality_check', 'ready', 'out_for_delivery'])

export default function AccountOrdersPage() {
  const { profile } = useAuth()
  const { data: orders, isLoading } = useOrdersForUser(profile?.id)
  const [tab, setTab] = useState('active')

  const active = useMemo(() => orders?.filter((o) => ACTIVE_STATUSES.has(o.status)), [orders])
  const past = useMemo(() => orders?.filter((o) => !ACTIVE_STATUSES.has(o.status)), [orders])

  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl px-margin-mobile py-stack-lg md:px-gutter">
      <h1 className="mb-stack-md text-headline-lg-mobile font-display text-laundry-blue-deep md:text-headline-lg">My Orders</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="pt-stack-md">
          <OrdersList orders={active} isLoading={isLoading} emptyLabel="No active orders." />
        </TabsContent>
        <TabsContent value="past" className="pt-stack-md">
          <OrdersList orders={past} isLoading={isLoading} emptyLabel="No past orders yet." />
        </TabsContent>
      </Tabs>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { OrdersTable } from '@/features/admin/OrdersTable'
import { useAllOrders } from '@/lib/queries/useOrders'

export default function AdminOrdersPage() {
  const { data: orders, isLoading } = useAllOrders()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!orders) return orders
    const q = search.trim().toLowerCase()
    if (!q) return orders
    return orders.filter((o) => o.display_id.toLowerCase().includes(q) || o.phone.includes(q))
  }, [orders, search])

  return (
    <div className="mx-auto w-full min-w-0 max-w-shell px-margin-mobile py-stack-lg md:px-gutter">
      <h1 className="mb-stack-md text-headline-lg-mobile font-display text-laundry-blue-deep md:text-headline-lg">Orders</h1>
      <Input
        placeholder="Search by order ID or phone…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-stack-md max-w-sm"
      />
      <OrdersTable orders={filtered} isLoading={isLoading} />
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { History } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { OrdersTable } from '@/features/admin/OrdersTable'
import { useAllOrders } from '@/lib/queries/useOrders'
import { isCurrentMonth } from '@/lib/orderHistory'
import { paths } from '@/routes/paths'

/** Only this calendar month's orders show here — older orders move to Order History automatically
 * once the month rolls over, keeping the working list focused on what staff are actively handling. */
export default function AdminOrdersPage() {
  const { data: orders, isLoading } = useAllOrders()
  const [search, setSearch] = useState('')

  const currentMonthOrders = useMemo(() => orders?.filter((o) => isCurrentMonth(o)), [orders])

  const filtered = useMemo(() => {
    if (!currentMonthOrders) return currentMonthOrders
    const q = search.trim().toLowerCase()
    if (!q) return currentMonthOrders
    return currentMonthOrders.filter((o) => o.display_id.toLowerCase().includes(q) || o.phone.includes(q))
  }, [currentMonthOrders, search])

  return (
    <div className="mx-auto w-full min-w-0 max-w-shell px-margin-mobile py-stack-lg md:px-gutter">
      <div className="mb-stack-md flex items-center justify-between gap-3">
        <h1 className="text-headline-lg-mobile font-display text-laundry-blue-deep md:text-headline-lg">Orders</h1>
        <Button variant="outline" size="sm" asChild>
          <Link to={paths.adminOrderHistory}>
            <History className="h-4 w-4" /> Order History
          </Link>
        </Button>
      </div>
      <p className="mb-stack-md text-label-sm text-on-surface-variant">
        Showing this month's orders. Past months are archived in Order History.
      </p>
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

import { Link } from 'react-router-dom'
import { MetricsCards } from '@/features/admin/MetricsCards'
import { OrdersList } from '@/features/dashboard/OrdersList'
import { useAllOrders } from '@/lib/queries/useOrders'
import { paths } from '@/routes/paths'

export default function AdminDashboardPage() {
  const { data: orders, isLoading } = useAllOrders()

  return (
    <div className="mx-auto w-full min-w-0 max-w-shell px-margin-mobile py-stack-lg md:px-gutter">
      <h1 className="mb-stack-md text-headline-lg-mobile font-display text-laundry-blue-deep md:text-headline-lg">Admin Dashboard</h1>

      <MetricsCards orders={orders} isLoading={isLoading} />

      <div className="mt-stack-lg flex items-center justify-between">
        <h2 className="text-headline-md font-display text-on-surface">Recent Orders</h2>
        <Link to={paths.adminOrders} className="text-label-md font-semibold text-primary">
          View all
        </Link>
      </div>
      <div className="mt-stack-sm">
        <OrdersList orders={orders?.slice(0, 8)} isLoading={isLoading} linkTo={paths.adminOrder} />
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { ChevronRight, ClipboardList, MessageSquare, PackageCheck, Plus, Tags, Users, Wallet, Inbox } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { MetricsCards } from '@/features/admin/MetricsCards'
import { OrdersList } from '@/features/dashboard/OrdersList'
import { useAuth } from '@/hooks/useAuth'
import { useAllOrders } from '@/lib/queries/useOrders'
import { useAllTickets } from '@/lib/queries/useTickets'
import { paths } from '@/routes/paths'
import { cn } from '@/lib/utils'

function greeting(now: Date) {
  const hour = now.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function AttentionRow({
  to,
  icon: Icon,
  label,
  count,
}: {
  to: string
  icon: typeof Inbox
  label: string
  count: number
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded px-2 py-2.5 transition-colors hover:bg-surface-container-low"
    >
      <Icon className="h-5 w-5 shrink-0 text-on-surface-variant" />
      <span className="flex-1 text-body-md text-on-surface">{label}</span>
      <span
        className={cn(
          'min-w-7 rounded-full px-2 py-0.5 text-center text-label-md font-bold',
          count > 0 ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant',
        )}
      >
        {count}
      </span>
      <ChevronRight className="h-4 w-4 text-outline" />
    </Link>
  )
}

export default function AdminDashboardPage() {
  const { profile, hasPermission } = useAuth()
  const { data: orders, isLoading } = useAllOrders()
  const canSeeTickets = hasPermission('tickets')
  const { data: tickets } = useAllTickets()

  const now = new Date()
  const activeOrders = orders?.filter((o) => o.status !== 'cancelled') ?? []
  const newOrders = activeOrders.filter((o) => o.status === 'order_received').length
  const readyOrders = activeOrders.filter((o) => o.status === 'ready').length
  const unpaidCash = activeOrders.filter((o) => o.payment_method === 'cash_on_delivery' && o.payment_status !== 'paid').length
  const openTickets = tickets?.filter((t) => t.status !== 'resolved').length ?? 0

  const quickActions = [
    { to: paths.adminWalkIn, label: 'New Walk-in Order', icon: Plus, show: hasPermission('walkin') },
    { to: paths.adminOrders, label: 'Manage Orders', icon: ClipboardList, show: hasPermission('orders') },
    { to: paths.adminCatalog, label: 'Catalog & Pricing', icon: Tags, show: hasPermission('catalog') },
    { to: paths.adminCustomers, label: 'Customers', icon: Users, show: hasPermission('customers') },
  ].filter((a) => a.show)

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-shell flex-col gap-stack-lg px-margin-mobile py-stack-lg md:px-gutter">
      <div>
        <p className="text-label-md text-on-surface-variant">
          {now.toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <h1 className="text-headline-lg-mobile font-display text-laundry-blue-deep md:text-headline-lg">
          {greeting(now)}
          {profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
        </h1>
      </div>

      <MetricsCards orders={orders} isLoading={isLoading} />

      <div className="grid grid-cols-1 gap-stack-lg lg:grid-cols-[1fr_340px] lg:items-start">
        <section className="min-w-0">
          <div className="mb-stack-sm flex items-center justify-between">
            <h2 className="text-headline-md font-display text-on-surface">Recent Orders</h2>
            <Link to={paths.adminOrders} className="text-label-md font-semibold text-primary">
              View all
            </Link>
          </div>
          <OrdersList orders={orders?.slice(0, 8)} isLoading={isLoading} linkTo={paths.adminOrder} />
        </section>

        <aside className="flex flex-col gap-stack-md">
          <Card>
            <CardContent className="pt-stack-md">
              <h2 className="mb-stack-sm text-label-sm font-bold uppercase text-on-surface-variant">Needs Attention</h2>
              {isLoading ? (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-9 w-full" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col">
                  <AttentionRow to={paths.adminOrders} icon={Inbox} label="New orders to collect" count={newOrders} />
                  <AttentionRow to={paths.adminOrders} icon={PackageCheck} label="Ready for pickup / delivery" count={readyOrders} />
                  <AttentionRow to={paths.adminOrders} icon={Wallet} label="Cash orders not yet paid" count={unpaidCash} />
                  {canSeeTickets && (
                    <AttentionRow to={paths.adminTickets} icon={MessageSquare} label="Open support tickets" count={openTickets} />
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {quickActions.length > 0 && (
            <Card>
              <CardContent className="pt-stack-md">
                <h2 className="mb-stack-sm text-label-sm font-bold uppercase text-on-surface-variant">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      className="flex flex-col items-start gap-2 rounded border border-outline-variant/40 p-3 text-label-md font-semibold text-on-surface transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      <Icon className="h-5 w-5 text-primary" />
                      {label}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  )
}

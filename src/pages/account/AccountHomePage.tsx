import { Link } from 'react-router-dom'
import { Shirt, Package, MessageSquare, User as UserIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { AnalyticsCards } from '@/features/dashboard/AnalyticsCards'
import { OrdersList } from '@/features/dashboard/OrdersList'
import { useAuth } from '@/hooks/useAuth'
import { useOrdersForUser } from '@/lib/queries/useOrders'
import { paths } from '@/routes/paths'

const quickLinks = [
  { to: paths.order, label: 'New Order', icon: Shirt },
  { to: paths.accountOrders, label: 'My Orders', icon: Package },
  { to: paths.accountTickets, label: 'Support Tickets', icon: MessageSquare },
  { to: paths.accountProfile, label: 'Profile', icon: UserIcon },
]

export default function AccountHomePage() {
  const { profile } = useAuth()
  const { data: orders, isLoading } = useOrdersForUser(profile?.id)

  return (
    <div className="mx-auto w-full min-w-0 max-w-shell px-margin-mobile py-stack-lg md:px-gutter">
      <h1 className="text-headline-lg-mobile font-display text-laundry-blue-deep md:text-headline-lg">
        Welcome back{profile ? `, ${profile.full_name.split(' ')[0]}` : ''}
      </h1>

      <div className="mt-stack-md grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickLinks.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to}>
            <Card className="transition-shadow hover:shadow-soft-lift">
              <CardContent className="flex flex-col items-center gap-2 py-stack-md text-center">
                <Icon className="h-5 w-5 text-primary" />
                <span className="text-label-sm font-bold normal-case text-on-surface">{label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-stack-lg">
        <AnalyticsCards orders={orders} isLoading={isLoading} />
      </div>

      <div className="mt-stack-lg">
        <h2 className="mb-stack-sm text-headline-md font-display text-on-surface">Recent Orders</h2>
        <OrdersList orders={orders?.slice(0, 5)} isLoading={isLoading} />
      </div>
    </div>
  )
}

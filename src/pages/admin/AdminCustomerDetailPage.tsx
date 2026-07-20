import { Link, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { OrdersTable } from '@/features/admin/OrdersTable'
import { formatNaira } from '@/features/catalog/ItemCard'
import { useProfile } from '@/lib/queries/useProfile'
import { useOrdersForUser } from '@/lib/queries/useOrders'
import { paths } from '@/routes/paths'

export default function AdminCustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: profile, isLoading: profileLoading } = useProfile(id)
  const { data: orders, isLoading: ordersLoading } = useOrdersForUser(id)

  if (profileLoading || !profile) {
    return (
      <div className="mx-auto w-full min-w-0 max-w-3xl px-margin-mobile py-stack-lg">
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const totalSpend = (orders ?? []).filter((o) => o.payment_status === 'paid').reduce((sum, o) => sum + o.total, 0)

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-stack-md px-margin-mobile py-stack-lg md:px-gutter">
      <Link to={paths.adminCustomers} className="flex items-center gap-1 text-label-md text-on-surface-variant hover:text-on-surface">
        <ChevronLeft className="h-4 w-4" /> Customers
      </Link>

      <h1 className="text-headline-md font-display text-on-surface">{profile.full_name}</h1>

      <Card>
        <CardContent className="flex flex-col gap-1 pt-stack-md text-body-md">
          <p className="text-on-surface-variant">
            Email: <span className="text-on-surface">{profile.email}</span>
          </p>
          <p className="text-on-surface-variant">
            Phone: <span className="text-on-surface">{profile.phone}</span>
          </p>
          {profile.whatsapp && (
            <p className="text-on-surface-variant">
              WhatsApp: <span className="text-on-surface">{profile.whatsapp}</span>
            </p>
          )}
          {profile.address && (
            <p className="text-on-surface-variant">
              Address: <span className="text-on-surface">{profile.address}</span>
            </p>
          )}
          <p className="text-on-surface-variant">
            Customer since:{' '}
            <span className="text-on-surface">
              {new Date(profile.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-stack-md">
            <p className="text-label-sm uppercase text-on-surface-variant">Orders</p>
            <p className="mt-1 text-headline-md font-display text-on-surface">{orders?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-stack-md">
            <p className="text-label-sm uppercase text-on-surface-variant">Total Spend</p>
            <p className="mt-1 text-headline-md font-display text-on-surface">{formatNaira(totalSpend)}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-stack-sm text-headline-md font-display text-on-surface">Order History</h2>
        <OrdersTable orders={orders} isLoading={ordersLoading} />
      </div>
    </div>
  )
}

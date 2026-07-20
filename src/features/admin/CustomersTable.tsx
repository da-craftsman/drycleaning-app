import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatNaira } from '@/features/catalog/ItemCard'
import { paths } from '@/routes/paths'
import type { CustomerSummary } from '@/types/domain'

function CustomersTable({ customers, isLoading }: { customers?: CustomerSummary[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  if (!customers || customers.length === 0) {
    return <p className="py-stack-lg text-center text-body-md text-on-surface-variant">No customers found.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {customers.map(({ profile, orderCount, totalSpend }) => (
        <Link key={profile.id} to={paths.adminCustomer(profile.id)}>
          <Card className="transition-shadow hover:shadow-soft-lift">
            <CardContent className="flex flex-col gap-stack-sm pt-stack-md sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-label-md font-bold normal-case text-on-surface">{profile.full_name}</p>
                <p className="text-label-sm text-on-surface-variant">
                  {profile.email} · {profile.phone}
                </p>
              </div>
              <div className="flex items-center gap-stack-lg">
                <div className="text-right">
                  <p className="text-label-sm uppercase text-on-surface-variant">Orders</p>
                  <p className="text-label-md font-bold text-on-surface">{orderCount}</p>
                </div>
                <div className="text-right">
                  <p className="text-label-sm uppercase text-on-surface-variant">Total Spend</p>
                  <p className="text-label-md font-bold text-on-surface">{formatNaira(totalSpend)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

export { CustomersTable }

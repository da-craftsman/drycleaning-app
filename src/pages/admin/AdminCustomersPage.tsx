import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { CustomersTable } from '@/features/admin/CustomersTable'
import { formatNaira } from '@/features/catalog/ItemCard'
import { useAllCustomers } from '@/lib/queries/useCustomers'

export default function AdminCustomersPage() {
  const { data: customers, isLoading } = useAllCustomers()
  const [search, setSearch] = useState('')

  // Already sorted by totalSpend desc from the data layer, so the top spender is just the first entry.
  const topCustomer = customers?.length && customers[0].totalSpend > 0 ? customers[0] : undefined

  const filtered = useMemo(() => {
    if (!customers) return customers
    const q = search.trim().toLowerCase()
    if (!q) return customers
    return customers.filter(
      ({ profile }) => profile.full_name.toLowerCase().includes(q) || profile.email.toLowerCase().includes(q) || profile.phone.includes(q),
    )
  }, [customers, search])

  return (
    <div className="mx-auto w-full min-w-0 max-w-shell px-margin-mobile py-stack-lg md:px-gutter">
      <h1 className="mb-stack-md text-headline-lg-mobile font-display text-laundry-blue-deep md:text-headline-lg">Customers</h1>

      {topCustomer && (
        <Card className="mb-stack-md">
          <CardContent className="flex items-center justify-between gap-3 pt-stack-md">
            <div>
              <p className="text-label-sm uppercase text-on-surface-variant">Top Spending Customer</p>
              <p className="text-headline-md font-display text-on-surface">{topCustomer.profile.full_name}</p>
            </div>
            <p className="text-headline-md font-display text-primary">{formatNaira(topCustomer.totalSpend)}</p>
          </CardContent>
        </Card>
      )}

      <Input
        placeholder="Search by name, email, or phone…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-stack-md max-w-sm"
      />

      <CustomersTable customers={filtered} isLoading={isLoading} />
    </div>
  )
}

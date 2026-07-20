import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { getAllCustomersMock } from '@/lib/data/mock/customers.mock'
import type { PaymentStatus, Profile } from '@/types/database'
import type { CustomerSummary } from '@/types/domain'

type CustomerOrderRow = { total: number; payment_status: PaymentStatus; created_at: string }

function summarize(profile: Profile, orders: CustomerOrderRow[]): CustomerSummary {
  const paidOrders = orders.filter((o) => o.payment_status === 'paid')
  return {
    profile,
    orderCount: orders.length,
    totalSpend: paidOrders.reduce((sum, o) => sum + o.total, 0),
    lastOrderAt: orders.length ? orders.reduce((latest, o) => (o.created_at > latest ? o.created_at : latest), orders[0].created_at) : null,
  }
}

export async function getAllCustomers(): Promise<CustomerSummary[]> {
  if (!isSupabaseConfigured) return getAllCustomersMock()
  // Relies on Supabase's FK-based embedding (orders.user_id -> profiles.id) to fetch each
  // customer's orders in the same round trip, rather than an N+1 of per-customer queries.
  const { data, error } = await supabase!.from('profiles').select('*, orders(total, payment_status, created_at)').eq('role', 'customer')
  if (error) throw error
  return (data as (Profile & { orders: CustomerOrderRow[] })[])
    .map(({ orders, ...profile }) => summarize(profile, orders))
    .sort((a, b) => b.totalSpend - a.totalSpend)
}

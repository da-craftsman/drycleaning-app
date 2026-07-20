import { db, delay } from '@/lib/data/mock/store'
import type { CustomerSummary } from '@/types/domain'

export function getAllCustomersMock(): Promise<CustomerSummary[]> {
  const summaries = db.profiles
    .filter((p) => p.role === 'customer')
    .map((profile): CustomerSummary => {
      const orders = db.orders.filter((o) => o.user_id === profile.id)
      const paidOrders = orders.filter((o) => o.payment_status === 'paid')
      return {
        profile,
        orderCount: orders.length,
        totalSpend: paidOrders.reduce((sum, o) => sum + o.total, 0),
        lastOrderAt: orders.length ? orders.reduce((latest, o) => (o.created_at > latest ? o.created_at : latest), orders[0].created_at) : null,
      }
    })
    .sort((a, b) => b.totalSpend - a.totalSpend)
  return delay(summaries)
}

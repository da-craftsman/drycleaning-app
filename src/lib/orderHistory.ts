import type { Order } from '@/types/database'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export interface OrderHistoryMonthGroup<T extends Order = Order> {
  year: number
  month: number
  monthLabel: string
  orders: T[]
}

export interface OrderHistoryYearGroup<T extends Order = Order> {
  year: number
  months: OrderHistoryMonthGroup<T>[]
}

/** Buckets orders into Year -> Month groups, newest year and month first. Orders within a month
 * keep whatever order they arrived in (callers already sort by created_at desc). */
export function groupOrdersByYearMonth<T extends Order>(orders: T[]): OrderHistoryYearGroup<T>[] {
  const byYear = new Map<number, Map<number, T[]>>()
  for (const order of orders) {
    const created = new Date(order.created_at)
    const year = created.getFullYear()
    const month = created.getMonth()
    if (!byYear.has(year)) byYear.set(year, new Map())
    const byMonth = byYear.get(year)!
    if (!byMonth.has(month)) byMonth.set(month, [])
    byMonth.get(month)!.push(order)
  }

  return [...byYear.entries()]
    .sort(([a], [b]) => b - a)
    .map(([year, byMonth]) => ({
      year,
      months: [...byMonth.entries()]
        .sort(([a], [b]) => b - a)
        .map(([month, monthOrders]) => ({ year, month, monthLabel: MONTH_NAMES[month], orders: monthOrders })),
    }))
}

export function isCurrentMonth(order: Order, now: Date = new Date()): boolean {
  const created = new Date(order.created_at)
  return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth()
}

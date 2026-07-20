import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createOrder, markOrderPaid, updateOrderStatus } from '@/lib/data/orders'
import { queryKeys } from '@/lib/queries/keys'
import type { OrderStatus } from '@/types/database'

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ordersForUser(order.user_id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.allOrders })
    },
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, status, riderName }: { orderId: string; status: OrderStatus; riderName?: string }) =>
      updateOrderStatus(orderId, status, riderName),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.order(order.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.orderByDisplayId(order.display_id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.orderStatusHistory(order.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.allOrders })
      queryClient.invalidateQueries({ queryKey: queryKeys.ordersForUser(order.user_id) })
    },
  })
}

export function useMarkOrderPaid() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderId: string) => markOrderPaid(orderId),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.order(order.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.orderByDisplayId(order.display_id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.allOrders })
      queryClient.invalidateQueries({ queryKey: queryKeys.ordersForUser(order.user_id) })
      // Total Spend on the Customers list/detail pages is paid-orders-only, so it needs a refresh too.
      queryClient.invalidateQueries({ queryKey: queryKeys.allCustomers })
    },
  })
}

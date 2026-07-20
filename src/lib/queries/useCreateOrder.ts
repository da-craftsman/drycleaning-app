import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createOrder, updateOrderStatus } from '@/lib/data/orders'
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

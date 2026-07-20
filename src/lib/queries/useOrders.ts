import { useQuery } from '@tanstack/react-query'
import {
  getAllOrders,
  getOrder,
  getOrderByDisplayId,
  getOrderImages,
  getOrderItems,
  getOrderStatusHistory,
  getOrdersForUser,
} from '@/lib/data/orders'
import { queryKeys } from '@/lib/queries/keys'

export function useOrdersForUser(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.ordersForUser(userId ?? ''),
    queryFn: () => getOrdersForUser(userId!),
    enabled: Boolean(userId),
  })
}

export function useAllOrders() {
  return useQuery({ queryKey: queryKeys.allOrders, queryFn: getAllOrders })
}

export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.order(orderId ?? ''),
    queryFn: () => getOrder(orderId!),
    enabled: Boolean(orderId),
  })
}

export function useOrderByDisplayId(displayId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.orderByDisplayId(displayId ?? ''),
    queryFn: () => getOrderByDisplayId(displayId!),
    enabled: Boolean(displayId),
  })
}

export function useOrderItems(orderId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.orderItems(orderId ?? ''),
    queryFn: () => getOrderItems(orderId!),
    enabled: Boolean(orderId),
  })
}

export function useOrderImages(orderId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.orderImages(orderId ?? ''),
    queryFn: () => getOrderImages(orderId!),
    enabled: Boolean(orderId),
  })
}

export function useOrderStatusHistory(orderId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.orderStatusHistory(orderId ?? ''),
    queryFn: () => getOrderStatusHistory(orderId!),
    enabled: Boolean(orderId),
  })
}

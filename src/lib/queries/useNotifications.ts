import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getNotifications,
  getUnreadNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationsReadForOrder,
  markNotificationsReadForTicket,
} from '@/lib/data/notifications'
import { queryKeys } from '@/lib/queries/keys'

export function useNotifications(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.notifications(userId ?? ''),
    queryFn: () => getNotifications(userId!),
    enabled: Boolean(userId),
  })
}

// Polled rather than pushed (no Realtime subscription) — frequent enough that the red dot / bell
// badge feel current without needing a persistent connection.
export function useUnreadNotifications(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.unreadNotifications(userId ?? ''),
    queryFn: () => getUnreadNotifications(userId!),
    enabled: Boolean(userId),
    refetchInterval: 30000,
  })
}

function useInvalidateNotifications(userId: string | undefined) {
  const queryClient = useQueryClient()
  return () => {
    if (!userId) return
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications(userId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.unreadNotifications(userId) })
  }
}

export function useMarkNotificationRead(userId: string | undefined) {
  const invalidate = useInvalidateNotifications(userId)
  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(userId!, notificationId),
    onSuccess: invalidate,
  })
}

export function useMarkNotificationsReadForOrder(userId: string | undefined) {
  const invalidate = useInvalidateNotifications(userId)
  return useMutation({
    mutationFn: (orderId: string) => markNotificationsReadForOrder(userId!, orderId),
    onSuccess: invalidate,
  })
}

export function useMarkNotificationsReadForTicket(userId: string | undefined) {
  const invalidate = useInvalidateNotifications(userId)
  return useMutation({
    mutationFn: (ticketId: string) => markNotificationsReadForTicket(userId!, ticketId),
    onSuccess: invalidate,
  })
}

export function useMarkAllNotificationsRead(userId: string | undefined) {
  const invalidate = useInvalidateNotifications(userId)
  return useMutation({
    mutationFn: () => markAllNotificationsRead(userId!),
    onSuccess: invalidate,
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createDeliveryZone, deleteDeliveryZone, getDeliveryZones, updateDeliveryZone } from '@/lib/data/zones'
import { queryKeys } from '@/lib/queries/keys'
import type { DeliveryZone } from '@/types/database'

export function useDeliveryZones() {
  return useQuery({ queryKey: queryKeys.zones, queryFn: getDeliveryZones })
}

export function useCreateDeliveryZone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ name, pickupFee, deliveryFee }: { name: string; pickupFee: number; deliveryFee: number }) =>
      createDeliveryZone(name, pickupFee, deliveryFee),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.zones }),
  })
}

export function useUpdateDeliveryZone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ zoneId, patch }: { zoneId: string; patch: Partial<Pick<DeliveryZone, 'name' | 'pickup_fee' | 'delivery_fee'>> }) =>
      updateDeliveryZone(zoneId, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.zones }),
  })
}

export function useDeleteDeliveryZone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (zoneId: string) => deleteDeliveryZone(zoneId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.zones }),
  })
}

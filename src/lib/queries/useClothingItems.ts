import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAllClothingItems, getClothingItem, getClothingItems, updateClothingItem } from '@/lib/data/items'
import { queryKeys } from '@/lib/queries/keys'
import type { ClothingItem } from '@/types/database'

export function useClothingItems() {
  return useQuery({ queryKey: queryKeys.items, queryFn: getClothingItems })
}

/** Includes inactive items — for the admin catalog manager. */
export function useAllClothingItems() {
  return useQuery({ queryKey: queryKeys.allItems, queryFn: getAllClothingItems })
}

export function useClothingItem(itemId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.item(itemId ?? ''),
    queryFn: () => getClothingItem(itemId!),
    enabled: Boolean(itemId),
  })
}

export function useUpdateClothingItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      itemId,
      patch,
    }: {
      itemId: string
      patch: Partial<Pick<ClothingItem, 'price_regular' | 'price_white' | 'price_express' | 'is_active' | 'thumbnail_url'>>
    }) => updateClothingItem(itemId, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items })
      queryClient.invalidateQueries({ queryKey: queryKeys.allItems })
    },
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getPromoBanner, updatePromoBanner } from '@/lib/data/banner'
import { queryKeys } from '@/lib/queries/keys'
import type { PromoBanner } from '@/types/database'

export function usePromoBanner() {
  return useQuery({ queryKey: queryKeys.promoBanner, queryFn: getPromoBanner })
}

export function useUpdatePromoBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (patch: Partial<Omit<PromoBanner, 'id'>>) => updatePromoBanner(patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.promoBanner }),
  })
}

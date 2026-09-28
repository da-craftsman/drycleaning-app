import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClothingCategory, getClothingCategories } from '@/lib/data/categories'
import { queryKeys } from '@/lib/queries/keys'

export function useCategories() {
  return useQuery({ queryKey: queryKeys.categories, queryFn: getClothingCategories })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => createClothingCategory(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
  })
}

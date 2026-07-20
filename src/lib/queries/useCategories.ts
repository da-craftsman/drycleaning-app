import { useQuery } from '@tanstack/react-query'
import { getClothingCategories } from '@/lib/data/categories'
import { queryKeys } from '@/lib/queries/keys'

export function useCategories() {
  return useQuery({ queryKey: queryKeys.categories, queryFn: getClothingCategories })
}

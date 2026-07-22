import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createWalkInCustomer } from '@/lib/data/walkin'
import { queryKeys } from '@/lib/queries/keys'

export function useCreateWalkInCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createWalkInCustomer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.allCustomers }),
  })
}

import { useQuery } from '@tanstack/react-query'
import { getAllCustomers } from '@/lib/data/customers'
import { queryKeys } from '@/lib/queries/keys'

export function useAllCustomers() {
  return useQuery({ queryKey: queryKeys.allCustomers, queryFn: getAllCustomers })
}

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getSessionProfile } from '@/lib/data/auth'
import { queryKeys } from '@/lib/queries/keys'

export function useSession() {
  return useQuery({ queryKey: queryKeys.session, queryFn: getSessionProfile, staleTime: 5 * 60_000 })
}

export function useInvalidateSession() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.session })
}

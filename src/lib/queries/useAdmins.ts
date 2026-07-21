import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createSubAdmin, getAdminUsers, updateAdminUser } from '@/lib/data/admins'
import { queryKeys } from '@/lib/queries/keys'

export function useAdminUsers() {
  return useQuery({
    queryKey: queryKeys.adminUsers,
    queryFn: getAdminUsers,
  })
}

export function useCreateSubAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createSubAdmin,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers }),
  })
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, patch }: { userId: string; patch: Parameters<typeof updateAdminUser>[1] }) => updateAdminUser(userId, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers }),
  })
}

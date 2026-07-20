import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getProfile, updateProfile } from '@/lib/data/profile'
import { queryKeys } from '@/lib/queries/keys'
import type { Profile } from '@/types/database'

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.profile(userId ?? ''),
    queryFn: () => getProfile(userId!),
    enabled: Boolean(userId),
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, patch }: { userId: string; patch: Partial<Profile> }) => updateProfile(userId, patch),
    onSuccess: (profile) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile(profile.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.session })
    },
  })
}

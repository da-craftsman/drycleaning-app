import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  confirmPasswordReset,
  requestPasswordReset,
  sendVerificationEmail,
  signIn,
  signOut,
  signUp,
  updatePassword,
} from '@/lib/data/auth'
import { useSession } from '@/lib/queries/useSession'
import { queryKeys } from '@/lib/queries/keys'

/** Session + auth actions in one place. `profile` is null while loading and while signed out. */
export function useAuth() {
  const { data: profile, isLoading } = useSession()
  const queryClient = useQueryClient()

  const signInMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => signIn(email, password),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.session }),
  })

  const signUpMutation = useMutation({
    mutationFn: signUp,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.session }),
  })

  const signOutMutation = useMutation({
    mutationFn: signOut,
    onSuccess: () => queryClient.setQueryData(queryKeys.session, null),
  })

  const updatePasswordMutation = useMutation({
    mutationFn: ({ userId, currentPassword, newPassword }: { userId: string; currentPassword: string; newPassword: string }) =>
      updatePassword(userId, currentPassword, newPassword),
  })

  const sendVerificationEmailMutation = useMutation({
    mutationFn: (email: string) => sendVerificationEmail(email),
  })

  const requestPasswordResetMutation = useMutation({
    mutationFn: (email: string) => requestPasswordReset(email),
  })

  const confirmPasswordResetMutation = useMutation({
    mutationFn: (newPassword: string) => confirmPasswordReset(newPassword),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.session }),
  })

  return {
    profile,
    isLoading,
    isAuthenticated: Boolean(profile),
    isAdmin: profile?.role === 'admin',
    signIn: signInMutation.mutateAsync,
    signInStatus: signInMutation,
    signUp: signUpMutation.mutateAsync,
    signUpStatus: signUpMutation,
    signOut: signOutMutation.mutateAsync,
    updatePassword: updatePasswordMutation.mutateAsync,
    updatePasswordStatus: updatePasswordMutation,
    sendVerificationEmail: sendVerificationEmailMutation.mutateAsync,
    sendVerificationEmailStatus: sendVerificationEmailMutation,
    requestPasswordReset: requestPasswordResetMutation.mutateAsync,
    requestPasswordResetStatus: requestPasswordResetMutation,
    confirmPasswordReset: confirmPasswordResetMutation.mutateAsync,
    confirmPasswordResetStatus: confirmPasswordResetMutation,
  }
}

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Label } from '@/components/ui/label'
import { Input, FieldError } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password.'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Confirm your new password.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match.",
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

/** Change-password form for the currently signed-in user — used on both the customer profile page and admin settings. */
function ChangePasswordForm() {
  const { profile, updatePassword, updatePasswordStatus } = useAuth()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  if (!profile) return null

  const onSubmit = async (values: FormValues) => {
    try {
      await updatePassword({ userId: profile.id, currentPassword: values.currentPassword, newPassword: values.newPassword })
      toast({ title: 'Password updated', variant: 'success' })
      reset()
    } catch {
      // surfaced inline via updatePasswordStatus.error below
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
      <div>
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          className="mt-1"
          error={Boolean(errors.currentPassword)}
          {...register('currentPassword')}
        />
        <FieldError>{errors.currentPassword?.message}</FieldError>
      </div>

      <div className="grid grid-cols-1 gap-stack-md sm:grid-cols-2">
        <div>
          <Label htmlFor="newPassword">New password</Label>
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            className="mt-1"
            error={Boolean(errors.newPassword)}
            {...register('newPassword')}
          />
          <FieldError>{errors.newPassword?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="mt-1"
            error={Boolean(errors.confirmPassword)}
            {...register('confirmPassword')}
          />
          <FieldError>{errors.confirmPassword?.message}</FieldError>
        </div>
      </div>

      {updatePasswordStatus.isError && (
        <p className="text-label-md text-error">{(updatePasswordStatus.error as Error).message}</p>
      )}

      <Button type="submit" disabled={updatePasswordStatus.isPending} className="self-start">
        {updatePasswordStatus.isPending ? 'Updating…' : 'Update Password'}
      </Button>
    </form>
  )
}

export { ChangePasswordForm }

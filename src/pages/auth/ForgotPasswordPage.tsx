import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input, FieldError } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/lib/utils'
import { paths } from '@/routes/paths'

const schema = z.object({
  email: z.string().min(1, 'Enter your email address.').email('Enter a valid email address, like you@example.com.'),
})

type FormValues = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const { requestPasswordReset, requestPasswordResetStatus } = useAuth()
  const [sentTo, setSentTo] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: 'onBlur' })

  const onSubmit = async (values: FormValues) => {
    try {
      await requestPasswordReset(values.email)
      // Shown regardless of whether the address has an account, matching Supabase's own
      // resetPasswordForEmail behavior — revealing that here would let this form be used to
      // check which emails are registered.
      setSentTo(values.email)
    } catch {
      // surfaced via requestPasswordResetStatus.error below
    }
  }

  if (sentTo) {
    return (
      <div className="flex flex-col items-center gap-stack-md text-center">
        <MailCheck className="h-10 w-10 text-laundry-blue-deep" />
        <h1 className="font-display text-headline-md text-on-surface">Check your email</h1>
        <p className="max-w-sm text-body-md text-on-surface-variant">
          If an account exists for <span className="text-on-surface">{sentTo}</span>, we've sent a link to reset your
          password.
        </p>
        <Link to={paths.login} className="text-label-md font-semibold text-primary">
          Back to log in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
      <div>
        <h1 className="font-display text-headline-md text-on-surface">Forgot password</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Enter your account email and we'll send you a link to reset your password.
        </p>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="mt-1"
          error={Boolean(errors.email)}
          {...register('email')}
        />
        <FieldError>{errors.email?.message}</FieldError>
      </div>

      {requestPasswordResetStatus.isError && (
        <p className="text-label-md text-error">{getErrorMessage(requestPasswordResetStatus.error, 'Something went wrong. Please try again.')}</p>
      )}

      <Button type="submit" size="lg" disabled={requestPasswordResetStatus.isPending}>
        {requestPasswordResetStatus.isPending ? 'Sending…' : 'Send Reset Link'}
      </Button>

      <p className="text-center text-body-md text-on-surface-variant">
        Remembered it?{' '}
        <Link to={paths.login} className="font-semibold text-primary">
          Log in
        </Link>
      </p>
    </form>
  )
}

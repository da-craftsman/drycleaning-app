import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { PartyPopper } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { getSessionProfile } from '@/lib/data/auth'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { getErrorMessage } from '@/lib/utils'
import { paths } from '@/routes/paths'

const schema = z
  .object({
    newPassword: z.string().min(8, 'New password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Confirm your new password.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match.",
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

const AUTO_REDIRECT_DELAY_MS = 1500
// Generous enough for Supabase's client to parse the emailed link's recovery token from the URL
// and establish a session; if nothing shows up by then the link genuinely is invalid/expired.
const SESSION_CHECK_TIMEOUT_MS = 2500

export default function ResetPasswordPage() {
  const { profile, confirmPasswordReset, confirmPasswordResetStatus } = useAuth()
  const navigate = useNavigate()
  const [sessionStatus, setSessionStatus] = useState<'checking' | 'ready' | 'invalid'>('checking')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  // Clicking the emailed reset link lands here with a recovery token in the URL, which Supabase's
  // client parses into a real session automatically — that session (not a current password, which
  // a locked-out user by definition doesn't have) is what proves this is genuinely them.
  useEffect(() => {
    let cancelled = false

    if (!isSupabaseConfigured) {
      getSessionProfile().then((p) => {
        if (!cancelled) setSessionStatus(p ? 'ready' : 'invalid')
      })
      return () => {
        cancelled = true
      }
    }

    const {
      data: { subscription },
    } = supabase!.auth.onAuthStateChange((event) => {
      if (!cancelled && (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN')) setSessionStatus('ready')
    })

    supabase!.auth.getSession().then(({ data }) => {
      if (!cancelled && data.session) setSessionStatus('ready')
    })

    const timeout = setTimeout(() => {
      if (!cancelled) setSessionStatus((s) => (s === 'checking' ? 'invalid' : s))
    }, SESSION_CHECK_TIMEOUT_MS)

    return () => {
      cancelled = true
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const onSubmit = async (values: FormValues) => {
    try {
      await confirmPasswordReset(values.newPassword)
    } catch {
      // surfaced via confirmPasswordResetStatus.error below
    }
  }

  useEffect(() => {
    if (!confirmPasswordResetStatus.isSuccess) return
    const timer = setTimeout(() => {
      navigate(profile?.role === 'admin' || profile?.role === 'superadmin' ? paths.admin : paths.account, { replace: true })
    }, AUTO_REDIRECT_DELAY_MS)
    return () => clearTimeout(timer)
  }, [confirmPasswordResetStatus.isSuccess, profile, navigate])

  if (confirmPasswordResetStatus.isSuccess) {
    return (
      <div className="flex flex-col items-center gap-stack-md text-center">
        <PartyPopper className="h-10 w-10 text-success-green" />
        <h1 className="font-display text-headline-md text-on-surface">Password updated</h1>
        <p className="text-body-md text-on-surface-variant">Taking you to your account…</p>
      </div>
    )
  }

  if (sessionStatus === 'checking') {
    return <p className="text-center text-body-md text-on-surface-variant">Verifying your reset link…</p>
  }

  if (sessionStatus === 'invalid') {
    return (
      <div className="flex flex-col items-center gap-stack-md text-center">
        <h1 className="font-display text-headline-md text-on-surface">Link expired or invalid</h1>
        <p className="max-w-sm text-body-md text-on-surface-variant">
          This password reset link is no longer valid. Request a new one to continue.
        </p>
        <Link to={paths.forgotPassword} className="text-label-md font-semibold text-primary">
          Request a new link
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
      <div>
        <h1 className="font-display text-headline-md text-on-surface">Reset password</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Choose a new password for your account.</p>
      </div>

      <div>
        <Label htmlFor="newPassword">New password</Label>
        <PasswordInput
          id="newPassword"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          className="mt-1"
          error={Boolean(errors.newPassword)}
          {...register('newPassword')}
        />
        <FieldError>{errors.newPassword?.message}</FieldError>
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          placeholder="Re-enter your new password"
          className="mt-1"
          error={Boolean(errors.confirmPassword)}
          {...register('confirmPassword')}
        />
        <FieldError>{errors.confirmPassword?.message}</FieldError>
      </div>

      {confirmPasswordResetStatus.isError && (
        <p className="text-label-md text-error">{getErrorMessage(confirmPasswordResetStatus.error, 'Something went wrong. Please try again.')}</p>
      )}

      <Button type="submit" size="lg" disabled={confirmPasswordResetStatus.isPending}>
        {confirmPasswordResetStatus.isPending ? 'Updating…' : 'Update Password'}
      </Button>
    </form>
  )
}

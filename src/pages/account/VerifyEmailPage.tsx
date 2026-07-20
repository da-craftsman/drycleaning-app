import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { MailCheck, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { useUpdateProfile } from '@/lib/queries/useProfile'
import { isEmailConfirmedAtAuthLevel } from '@/lib/data/auth'
import { paths } from '@/routes/paths'

const AUTO_REDIRECT_DELAY_MS = 1500

export default function VerifyEmailPage() {
  const { profile, sendVerificationEmail, sendVerificationEmailStatus } = useAuth()
  const updateProfile = useUpdateProfile()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const confirmed = searchParams.get('confirmed') === '1'
  const [markAttempted, setMarkAttempted] = useState(false)

  useEffect(() => {
    if (!profile || profile.email_verified_at || markAttempted) return

    // The ?confirmed=1 marker is a quick path when it survives the redirect, but Supabase's own
    // verify -> redirect hop doesn't always preserve custom query strings, so it can't be trusted
    // alone. Falling back to asking Supabase Auth directly whether this session completed a real
    // OTP verification catches the case where the marker got lost but the click was genuine.
    if (confirmed) {
      setMarkAttempted(true)
      updateProfile.mutate({ userId: profile.id, patch: { email_verified_at: new Date().toISOString() } })
      return
    }

    let cancelled = false
    isEmailConfirmedAtAuthLevel().then((confirmedAtAuthLevel) => {
      if (!cancelled && confirmedAtAuthLevel && !markAttempted) {
        setMarkAttempted(true)
        updateProfile.mutate({ userId: profile.id, patch: { email_verified_at: new Date().toISOString() } })
      }
    })
    return () => {
      cancelled = true
    }
  }, [confirmed, profile, markAttempted, updateProfile])

  const verified = Boolean(profile?.email_verified_at) || updateProfile.isSuccess

  // Once verified, move on automatically instead of leaving the user parked on this page — the
  // brief success state below is just a moment of feedback before it happens.
  useEffect(() => {
    if (!verified) return
    const timer = setTimeout(() => navigate(paths.account, { replace: true }), AUTO_REDIRECT_DELAY_MS)
    return () => clearTimeout(timer)
  }, [verified, navigate])

  if (!profile) return null

  if (verified) {
    return (
      <div className="mx-auto flex w-full max-w-shell flex-col items-center gap-stack-md px-margin-mobile py-stack-xl text-center">
        <PartyPopper className="h-10 w-10 text-success-green" />
        <h1 className="text-headline-lg font-display text-on-surface">Email verified</h1>
        <p className="text-body-md text-on-surface-variant">You're all set. Head back to your account.</p>
        <Button asChild>
          <Link to={paths.account}>Go to Account</Link>
        </Button>
      </div>
    )
  }

  const handleResend = async () => {
    try {
      await sendVerificationEmail(profile.email)
      toast({ title: 'Verification email sent', description: `Check ${profile.email} for the link.`, variant: 'success' })
    } catch (err) {
      toast({
        title: 'Could not send verification email',
        description: err instanceof Error ? err.message : 'Something went wrong. Please try again shortly.',
        variant: 'error',
      })
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-shell flex-col items-center gap-stack-md px-margin-mobile py-stack-xl text-center">
      <MailCheck className="h-10 w-10 text-laundry-blue-deep" />
      <h1 className="text-headline-lg font-display text-on-surface">Verify your email</h1>
      <p className="max-w-md text-body-md text-on-surface-variant">
        We sent a verification link to <span className="text-on-surface">{profile.email}</span>. Click it to unlock your
        account and order history.
      </p>
      {updateProfile.isPending && <p className="text-label-sm text-on-surface-variant">Confirming…</p>}
      <Button onClick={handleResend} disabled={sendVerificationEmailStatus.isPending} variant="outline">
        {sendVerificationEmailStatus.isPending ? 'Sending…' : 'Resend verification email'}
      </Button>
    </div>
  )
}

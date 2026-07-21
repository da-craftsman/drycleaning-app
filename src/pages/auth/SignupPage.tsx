import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { PartyPopper } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input, FieldError } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { sendWelcomeEmail } from '@/lib/data/auth'
import { getErrorMessage } from '@/lib/utils'
import { paths } from '@/routes/paths'

const schema = z.object({
  fullName: z.string().min(2, 'Enter your full name.'),
  email: z.string().min(1, 'Enter your email address.').email('Enter a valid email address, like you@example.com.'),
  phone: z.string().min(10, 'Enter a valid phone number, e.g. 080X XXX XXXX.'),
  password: z.string().min(8, 'Use at least 8 characters for your password.'),
})

type FormValues = z.infer<typeof schema>

export default function SignupPage() {
  const { signUp, signUpStatus } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: string } }
  const { toast } = useToast()
  const from = location.state?.from

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: 'onBlur' })

  const onSubmit = async (values: FormValues) => {
    try {
      await signUp(values)
      toast({ title: 'Account created', description: 'Welcome to Shalah Rex Laundry!', variant: 'success' })
      // Best-effort: the account already exists at this point, so a mailer hiccup shouldn't affect
      // signup — it's just a welcome email, not something to block or retry on the customer's behalf.
      sendWelcomeEmail().catch((err) => console.error('Failed to send welcome email', err))
      // A new signup is always a customer, so — unlike LoginPage — no role check is needed. With no
      // `from` (an organic signup, not bounced here mid-task), go straight to the account with zero
      // extra friction. With a `from`, fall through to the choice screen below instead of picking
      // for the user — they might want to finish what they started, or just look around first.
      if (!from) navigate(paths.account)
    } catch {
      // surfaced via signUpStatus.error below
    }
  }

  if (signUpStatus.isSuccess && from) {
    const isCheckoutFlow = from.startsWith('/order/checkout')
    return (
      <div className="flex flex-col items-center gap-stack-md text-center">
        <PartyPopper className="h-10 w-10 text-success-green" />
        <h1 className="font-display text-headline-md text-on-surface">Account created!</h1>
        <p className="text-body-md text-on-surface-variant">
          {isCheckoutFlow
            ? "You're all set: pick up right where you left off, or take a look around your account first."
            : 'What would you like to do next?'}
        </p>
        <div className="flex w-full flex-col gap-2">
          <Button size="lg" onClick={() => navigate(from)}>
            {isCheckoutFlow ? 'Continue My Order' : 'Continue'}
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate(paths.account)}>
            Go to My Account
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
      <div>
        <h1 className="font-display text-headline-md text-on-surface">Create account</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Sign up to place orders and track them.</p>
      </div>

      <div>
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          autoComplete="name"
          placeholder="e.g. Chidinma Okafor"
          className="mt-1"
          error={Boolean(errors.fullName)}
          {...register('fullName')}
        />
        <FieldError>{errors.fullName?.message}</FieldError>
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

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          className="mt-1"
          placeholder="080X XXX XXXX"
          error={Boolean(errors.phone)}
          {...register('phone')}
        />
        <FieldError>{errors.phone?.message}</FieldError>
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          className="mt-1"
          error={Boolean(errors.password)}
          {...register('password')}
        />
        <FieldError>{errors.password?.message}</FieldError>
      </div>

      {signUpStatus.isError && (
        <p className="text-label-md text-error">{getErrorMessage(signUpStatus.error, 'Something went wrong. Please try again.')}</p>
      )}

      <Button type="submit" size="lg" disabled={signUpStatus.isPending}>
        {signUpStatus.isPending ? 'Creating account…' : 'Create Account'}
      </Button>

      <p className="text-center text-body-md text-on-surface-variant">
        Already have an account?{' '}
        <Link to={paths.login} className="font-semibold text-primary">
          Log in
        </Link>
      </p>
    </form>
  )
}

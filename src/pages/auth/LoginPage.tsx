import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Input, FieldError } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { paths } from '@/routes/paths';

const schema = z.object({
  email: z
    .string()
    .min(1, 'Enter your email address.')
    .email('Enter a valid email address, like you@example.com.'),
  password: z.string().min(1, 'Enter your password.'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { signIn, signInStatus } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: 'onBlur' });

  const onSubmit = async (values: FormValues) => {
    try {
      const profile = await signIn(values);
      const roleDefault =
        profile.role === 'admin' ? paths.admin : paths.account;
      // Only honor a redirect-back target if it matches the signed-in role — a stale `from`
      // left over from a previous session (e.g. an admin logging in after a customer logged
      // out on a protected page) must not send the wrong role into the wrong area.
      const from = location.state?.from;
      const fromMatchesRole =
        from &&
        (profile.role === 'admin'
          ? from.startsWith('/admin')
          : !from.startsWith('/admin'));
      navigate(fromMatchesRole ? from! : roleDefault);
    } catch {
      // surfaced via signInStatus.error below
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='flex flex-col gap-stack-md'
    >
      <div>
        <h1 className='font-display text-headline-md text-on-surface'>
          Log in
        </h1>
        <p className='mt-1 text-body-md text-on-surface-variant'>
          Welcome back <br />
          Enter your details to continue.
        </p>
      </div>

      <div>
        <Label htmlFor='email'>Email</Label>
        <Input
          id='email'
          type='email'
          autoComplete='email'
          placeholder='you@example.com'
          className='mt-1'
          error={Boolean(errors.email)}
          {...register('email')}
        />
        <FieldError>{errors.email?.message}</FieldError>
      </div>

      <div>
        <div className='flex items-center justify-between'>
          <Label htmlFor='password'>Password</Label>
          <Link
            to={paths.forgotPassword}
            className='text-label-sm font-semibold text-primary'
          >
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id='password'
          autoComplete='current-password'
          placeholder='Enter your password'
          className='mt-1'
          error={Boolean(errors.password)}
          {...register('password')}
        />
        <FieldError>{errors.password?.message}</FieldError>
      </div>

      {signInStatus.isError && (
        <p className='text-label-md text-error'>
          {(signInStatus.error as Error).message}
        </p>
      )}

      <Button type='submit' size='lg' disabled={signInStatus.isPending}>
        {signInStatus.isPending ? 'Logging in…' : 'Log In'}
      </Button>

      <p className='text-center text-body-md text-on-surface-variant'>
        No account?{' '}
        <Link to={paths.signup} className='font-semibold text-primary'>
          Sign up
        </Link>
      </p>
    </form>
  );
}

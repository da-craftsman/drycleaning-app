import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import {
  confirmPasswordResetMock,
  getSessionProfileMock,
  requestPasswordResetMock,
  sendVerificationEmailMock,
  signInMock,
  signOutMock,
  signUpMock,
  updatePasswordMock,
} from '@/lib/data/mock/auth.mock'
import { getProfile } from '@/lib/data/profile'
import { paths } from '@/routes/paths'
import type { Profile } from '@/types/database'

export async function getSessionProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured) return getSessionProfileMock()
  const { data } = await supabase!.auth.getSession()
  if (!data.session) return null
  return getProfile(data.session.user.id)
}

export async function signIn(email: string, password: string): Promise<Profile> {
  if (!isSupabaseConfigured) return signInMock(email, password)
  const { data, error } = await supabase!.auth.signInWithPassword({ email, password })
  if (error) throw error
  const profile = await getProfile(data.user.id)
  if (!profile) throw new Error('Signed in, but no profile record was found.')
  return profile
}

export async function signUp(input: { fullName: string; email: string; phone: string; password: string }): Promise<Profile> {
  if (!isSupabaseConfigured) return signUpMock(input)
  const { data, error } = await supabase!.auth.signUp({ email: input.email, password: input.password })
  if (error) throw error
  if (!data.user) throw new Error('Sign up did not return a user.')
  const { data: profile, error: profileError } = await supabase!
    .from('profiles')
    .insert({ id: data.user.id, full_name: input.fullName, phone: input.phone, whatsapp: input.phone, email: input.email })
    .select()
    .single()
  if (profileError) throw profileError
  // Best-effort: the account is already created at this point, so a mailer hiccup (e.g. rate limit)
  // shouldn't fail signup — the user can always hit "Resend" from the verify-email page.
  try {
    await sendVerificationEmail(input.email)
  } catch (err) {
    console.error('Failed to send verification email', err)
  }
  return profile
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured) return signOutMock()
  const { error } = await supabase!.auth.signOut()
  if (error) throw error
}

export async function updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
  if (!isSupabaseConfigured) return updatePasswordMock(userId, currentPassword, newPassword)
  const { error } = await supabase!.auth.updateUser({ password: newPassword })
  if (error) throw error
}

/**
 * Emails a password-reset link for a locked-out user who doesn't know their current password (so
 * the normal "change password" flow, which requires it, doesn't apply). Always resolves whether or
 * not the address has an account — Supabase's own resetPasswordForEmail doesn't reveal that either,
 * to avoid letting this form be used to enumerate registered emails.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  if (!isSupabaseConfigured) return requestPasswordResetMock(email)
  const { error } = await supabase!.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}${paths.resetPassword}`,
  })
  if (error) throw error
}

/**
 * Sets a new password using the recovery session Supabase establishes client-side when the user
 * clicks the emailed reset link (the recovery session itself proves identity — no current password
 * needed, since the whole point is the user has forgotten it).
 */
export async function confirmPasswordReset(newPassword: string): Promise<void> {
  if (!isSupabaseConfigured) return confirmPasswordResetMock(newPassword)
  const { error } = await supabase!.auth.updateUser({ password: newPassword })
  if (error) throw error
}

/**
 * Emails a verification link via Supabase's magic-link OTP flow. Deliberately not the built-in
 * "Confirm signup" flow — that gate blocks sign-in for unconfirmed users at the auth server level,
 * which would break "sign up and log in immediately." signInWithOtp/verifyOtp work independently of
 * that project setting, so we use them purely to prove ownership of the email address and flip
 * profiles.email_verified_at ourselves, without ever blocking login.
 */
export async function sendVerificationEmail(email: string): Promise<void> {
  if (!isSupabaseConfigured) return sendVerificationEmailMock()
  const { error } = await supabase!.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}${paths.verifyEmail}?confirmed=1` },
  })
  if (error) throw error
}

/**
 * Whether Supabase Auth itself has recorded a successful OTP verification for the current session.
 * Used as the reliable signal that the emailed link was actually clicked, instead of the
 * `?confirmed=1` query param on emailRedirectTo — Supabase's own redirect handling doesn't always
 * preserve custom query strings through the verify → redirect hop, so that param can't be trusted
 * on its own. Any successful OTP verification (magic link, signup, recovery) makes GoTrue set
 * `email_confirmed_at` on the user regardless of the project's "Confirm email" setting, so this
 * works independently of that toggle too.
 */
export async function isEmailConfirmedAtAuthLevel(): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  const { data } = await supabase!.auth.getUser()
  return Boolean(data.user?.email_confirmed_at)
}

import { db, delay, persist } from '@/lib/data/mock/store'
import type { Profile } from '@/types/database'

const SESSION_KEY = 'srl-mock-session'

function readSessionUserId(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(SESSION_KEY)
}

function writeSession(userId: string | null) {
  if (typeof localStorage === 'undefined') return
  if (userId) localStorage.setItem(SESSION_KEY, userId)
  else localStorage.removeItem(SESSION_KEY)
}

export function getSessionProfileMock(): Promise<Profile | null> {
  const userId = readSessionUserId()
  if (!userId) return delay(null, 100)
  return delay(db.profiles.find((p) => p.id === userId) ?? null, 100)
}

export async function signInMock(email: string, password: string): Promise<Profile> {
  await delay(null, 500)
  const profile = db.profiles.find((p) => p.email.toLowerCase() === email.trim().toLowerCase())
  if (!profile || db.passwords[profile.id] !== password) {
    throw new Error('Invalid email or password.')
  }
  writeSession(profile.id)
  return profile
}

export async function signUpMock(input: {
  fullName: string
  email: string
  phone: string
  password: string
}): Promise<Profile> {
  await delay(null, 500)
  if (db.profiles.some((p) => p.email.toLowerCase() === input.email.trim().toLowerCase())) {
    throw new Error('An account with this email already exists.')
  }
  const profile: Profile = {
    id: `user-${crypto.randomUUID()}`,
    role: 'customer',
    full_name: input.fullName,
    phone: input.phone,
    whatsapp: input.phone,
    address: null,
    email: input.email.trim().toLowerCase(),
    email_verified_at: null,
    permissions: [],
    created_at: new Date().toISOString(),
  }
  db.profiles.push(profile)
  db.passwords[profile.id] = input.password
  persist()
  writeSession(profile.id)
  return profile
}

export async function signOutMock(): Promise<void> {
  await delay(null, 150)
  writeSession(null)
}

/** Mock stand-in for sending a real verification email — just simulates the network delay. */
export async function sendVerificationEmailMock(): Promise<void> {
  await delay(null, 400)
}

export async function updatePasswordMock(userId: string, currentPassword: string, newPassword: string): Promise<void> {
  await delay(null, 400)
  if (db.passwords[userId] !== currentPassword) {
    throw new Error('Current password is incorrect.')
  }
  db.passwords[userId] = newPassword
  persist()
}

/**
 * Mock stand-in for sending a real reset-password email — no email actually goes out in mock mode
 * (mirrors sendVerificationEmailMock), so the "click the link" half of the flow isn't testable here.
 * Doesn't reveal whether the email exists, matching Supabase's own resetPasswordForEmail behavior.
 */
export async function requestPasswordResetMock(_email: string): Promise<void> {
  await delay(null, 400)
}

/**
 * Mock stand-in for confirming a password reset. Real Supabase proves identity via the recovery
 * session established by clicking the emailed link; mock mode has no such link, so this instead
 * reuses whatever mock session is currently signed in (works fine for local testing of the
 * "already logged in, land on /reset-password directly" path).
 */
export async function confirmPasswordResetMock(newPassword: string): Promise<void> {
  await delay(null, 400)
  const userId = readSessionUserId()
  if (!userId) throw new Error('No active session to reset the password for.')
  db.passwords[userId] = newPassword
  persist()
}

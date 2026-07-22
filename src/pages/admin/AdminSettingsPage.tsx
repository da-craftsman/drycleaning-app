import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Users, MapPin, Image as ImageIcon, ShieldCheck, Plus, Bell } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChangePasswordForm } from '@/features/account/ChangePasswordForm'
import { useAuth } from '@/hooks/useAuth'
import { useUpdateProfile } from '@/lib/queries/useProfile'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/utils'
import { business } from '@/lib/constants'
import { paths } from '@/routes/paths'
import type { AdminPermission } from '@/types/database'

// Desktop reaches these via the sidebar directly — this list exists so they're still one tap away
// from the mobile bottom nav's "Menu" destination, which is this page.
const quickLinks: { to: string; label: string; icon: typeof Users; permission?: AdminPermission; superAdminOnly?: boolean }[] = [
  { to: paths.adminWalkIn, label: 'Walk-in Order', icon: Plus, permission: 'walkin' },
  { to: paths.adminCustomers, label: 'Customers', icon: Users, permission: 'customers' },
  { to: paths.adminZones, label: 'Delivery Zones', icon: MapPin, permission: 'zones' },
  { to: paths.adminBanner, label: 'Banner', icon: ImageIcon, permission: 'banner' },
  { to: paths.adminAdmins, label: 'Admins', icon: ShieldCheck, superAdminOnly: true },
  { to: paths.adminNotifications, label: 'Manage Notifications', icon: Bell, superAdminOnly: true },
]

export default function AdminSettingsPage() {
  const { profile, signOut, hasPermission, isSuperAdmin } = useAuth()
  const navigate = useNavigate()
  const updateProfile = useUpdateProfile()
  const { toast } = useToast()
  const visibleQuickLinks = quickLinks.filter(
    (link) => (!link.permission || hasPermission(link.permission)) && (!link.superAdminOnly || isSuperAdmin),
  )

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')

  useEffect(() => {
    if (!profile) return
    setFullName(profile.full_name)
    setPhone(profile.phone)
    setWhatsapp(profile.whatsapp ?? '')
  }, [profile])

  const handleSignOut = async () => {
    await signOut()
    navigate(paths.home)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    try {
      await updateProfile.mutateAsync({
        userId: profile.id,
        patch: { full_name: fullName, phone, whatsapp: whatsapp || null },
      })
      toast({ title: 'Profile updated', variant: 'success' })
    } catch (err) {
      toast({ title: 'Failed to update profile', description: getErrorMessage(err, 'Please try again.'), variant: 'error' })
    }
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl px-margin-mobile py-stack-lg md:px-gutter">
      <h1 className="mb-stack-md text-headline-lg-mobile font-display text-laundry-blue-deep md:text-headline-lg">Settings</h1>

      <div className="flex flex-col gap-stack-lg">
        <section>
          <h2 className="mb-stack-sm text-headline-md font-display text-on-surface">Business Details</h2>
          <Card>
            <CardContent className="flex flex-col gap-1 pt-stack-md text-body-md text-on-surface-variant">
              <p>
                <span className="text-on-surface">{business.name}</span>
              </p>
              <p>{business.address}</p>
              <p>{business.phoneDisplay}</p>
              <p>{business.email}</p>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="mb-stack-sm text-headline-md font-display text-on-surface">My Profile</h2>
          <Card>
            <CardContent className="pt-stack-md">
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-stack-md">
                <div>
                  <Label htmlFor="settings-email">Email</Label>
                  <Input id="settings-email" className="mt-1" value={profile?.email ?? ''} disabled />
                </div>
                <div className="grid grid-cols-1 gap-stack-md sm:grid-cols-2">
                  <div>
                    <Label htmlFor="settings-name">Full Name</Label>
                    <Input id="settings-name" className="mt-1" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="settings-phone">Phone</Label>
                    <Input id="settings-phone" className="mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="settings-whatsapp">WhatsApp (optional)</Label>
                  <Input id="settings-whatsapp" className="mt-1" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
                </div>

                <Button type="submit" disabled={updateProfile.isPending} className="self-start">
                  {updateProfile.isPending ? 'Saving…' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        <section className="md:hidden">
          <h2 className="mb-stack-sm text-headline-md font-display text-on-surface">Manage</h2>
          <div className="grid grid-cols-3 gap-3">
            {visibleQuickLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}>
                <Card className="transition-shadow hover:shadow-soft-lift">
                  <CardContent className="flex flex-col items-center gap-2 py-stack-md text-center">
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="text-label-sm font-bold normal-case text-on-surface">{label}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-stack-sm text-headline-md font-display text-on-surface">Password</h2>
          <Card>
            <CardContent className="pt-stack-md">
              <ChangePasswordForm />
            </CardContent>
          </Card>
        </section>

        <section className="md:hidden">
          <Button variant="outline" onClick={handleSignOut} className="w-full justify-center">
            <LogOut className="h-4 w-4" /> Log Out
          </Button>
        </section>
      </div>
    </div>
  )
}

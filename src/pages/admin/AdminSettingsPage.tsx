import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Users, MapPin, Image as ImageIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChangePasswordForm } from '@/features/account/ChangePasswordForm'
import { useAuth } from '@/hooks/useAuth'
import { business } from '@/lib/constants'
import { paths } from '@/routes/paths'

// Desktop reaches these via the sidebar directly — this list exists so they're still one tap away
// from the mobile bottom nav's "Menu" destination, which is this page.
const quickLinks = [
  { to: paths.adminCustomers, label: 'Customers', icon: Users },
  { to: paths.adminZones, label: 'Delivery Zones', icon: MapPin },
  { to: paths.adminBanner, label: 'Banner', icon: ImageIcon },
]

export default function AdminSettingsPage() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate(paths.home)
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

        <section className="md:hidden">
          <h2 className="mb-stack-sm text-headline-md font-display text-on-surface">Manage</h2>
          <div className="grid grid-cols-3 gap-3">
            {quickLinks.map(({ to, label, icon: Icon }) => (
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

import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ZoneManager } from '@/features/admin/ZoneManager'
import { BannerManager } from '@/features/admin/BannerManager'
import { ChangePasswordForm } from '@/features/account/ChangePasswordForm'
import { useAuth } from '@/hooks/useAuth'
import { business } from '@/lib/constants'
import { paths } from '@/routes/paths'

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

        <section>
          <h2 className="mb-stack-sm text-headline-md font-display text-on-surface">Delivery Zones</h2>
          <p className="mb-stack-sm text-body-md text-on-surface-variant">
            Update names or fees, remove zones no longer served, or add new ones.
          </p>
          <ZoneManager />
        </section>

        <section>
          <h2 className="mb-stack-sm text-headline-md font-display text-on-surface">Manage Banner</h2>
          <p className="mb-stack-sm text-body-md text-on-surface-variant">
            Control the promotional banner shown on the home page: swap in an image or GIF, set where it links to, or turn it off.
          </p>
          <BannerManager />
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

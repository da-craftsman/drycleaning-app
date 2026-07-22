import { Bell, ShieldCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { useAdminUsers, useUpdateAdminUser } from '@/lib/queries/useAdmins'
import { getErrorMessage } from '@/lib/utils'
import type { Profile } from '@/types/database'

/** Superadmin-only: choose which admins receive new-order / new-support-ticket notifications. */
export default function AdminManageNotificationsPage() {
  const { data: admins, isLoading } = useAdminUsers()
  const updateAdminUser = useUpdateAdminUser()
  const { toast } = useToast()

  const handleToggle = async (admin: Profile, field: 'notifyNewOrders' | 'notifyNewTickets', value: boolean) => {
    try {
      await updateAdminUser.mutateAsync({ userId: admin.id, patch: { [field]: value } })
    } catch (err) {
      toast({ title: 'Failed to update notification setting', description: getErrorMessage(err, 'Please try again.'), variant: 'error' })
    }
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-shell px-margin-mobile py-stack-lg md:px-gutter">
      <div className="mb-stack-md">
        <h1 className="text-headline-lg-mobile font-display text-laundry-blue-deep md:text-headline-lg">Manage Notifications</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Choose which admins receive new-order and new-support-ticket alerts. Only assigned admins get notified; sub-admins
          can't change this for themselves.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {admins?.map((admin) => (
            <Card key={admin.id}>
              <CardContent className="flex flex-col gap-3 pt-stack-md sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {admin.role === 'superadmin' ? <ShieldCheck className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                  </span>
                  <div>
                    <p className="text-label-md font-bold normal-case text-on-surface">{admin.full_name}</p>
                    <p className="text-label-sm text-on-surface-variant">{admin.email}</p>
                  </div>
                  <Badge variant={admin.role === 'superadmin' ? 'primary' : 'neutral'}>
                    {admin.role === 'superadmin' ? 'Superadmin' : 'Sub-admin'}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={admin.notify_new_orders}
                      onCheckedChange={(v) => handleToggle(admin, 'notifyNewOrders', v === true)}
                    />
                    <span className="text-label-md normal-case text-on-surface">New orders</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={admin.notify_new_tickets}
                      onCheckedChange={(v) => handleToggle(admin, 'notifyNewTickets', v === true)}
                    />
                    <span className="text-label-md normal-case text-on-surface">New support tickets</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

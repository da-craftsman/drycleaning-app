import { useState } from 'react'
import { Plus, ShieldCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AdminUserForm } from '@/features/admin/AdminUserForm'
import { useAdminUsers } from '@/lib/queries/useAdmins'
import { ADMIN_PERMISSIONS } from '@/lib/constants'
import { useAuth } from '@/hooks/useAuth'
import type { Profile } from '@/types/database'

export default function AdminAdminsPage() {
  const { data: admins, isLoading } = useAdminUsers()
  const { profile: viewer } = useAuth()
  const [editing, setEditing] = useState<Profile | 'new' | null>(null)

  return (
    <div className="mx-auto w-full min-w-0 max-w-shell px-margin-mobile py-stack-lg md:px-gutter">
      <div className="mb-stack-md flex items-center justify-between gap-3">
        <h1 className="text-headline-lg-mobile font-display text-laundry-blue-deep md:text-headline-lg">Admins</h1>
        <Button onClick={() => setEditing('new')}>
          <Plus className="h-4 w-4" /> Add Admin
        </Button>
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
              <CardContent className="flex flex-col gap-2 pt-stack-md sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-label-md font-bold normal-case text-on-surface">
                      {admin.full_name}
                      {admin.id === viewer?.id && <span className="ml-2 text-label-sm text-on-surface-variant">(you)</span>}
                    </p>
                    <p className="text-label-sm text-on-surface-variant">{admin.email}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant={admin.role === 'superadmin' ? 'primary' : 'neutral'}>
                    {admin.role === 'superadmin' ? 'Superadmin' : 'Sub-admin'}
                  </Badge>
                  {admin.role === 'superadmin' ? (
                    <Badge variant="neutral">All features</Badge>
                  ) : admin.permissions.length === 0 ? (
                    <Badge variant="neutral">No features granted</Badge>
                  ) : (
                    admin.permissions.map((key) => (
                      <Badge key={key} variant="neutral">
                        {ADMIN_PERMISSIONS.find((p) => p.key === key)?.label ?? key}
                      </Badge>
                    ))
                  )}
                  <Button size="sm" variant="outline" onClick={() => setEditing(admin)}>
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing === 'new' ? 'Add Admin' : 'Edit Admin'}</DialogTitle>
            <DialogDescription>
              {editing === 'new'
                ? 'Create a staff account and choose what they can access.'
                : "Update this admin's role and feature access."}
            </DialogDescription>
          </DialogHeader>
          {editing !== null && (
            <AdminUserForm existing={editing === 'new' ? undefined : editing} onDone={() => setEditing(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

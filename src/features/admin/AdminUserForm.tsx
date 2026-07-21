import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { DialogFooter } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useCreateSubAdmin, useUpdateAdminUser } from '@/lib/queries/useAdmins'
import { ADMIN_PERMISSIONS } from '@/lib/constants'
import { getErrorMessage } from '@/lib/utils'
import type { AdminPermission, Profile } from '@/types/database'

function AdminUserForm({ existing, onDone }: { existing?: Profile; onDone: () => void }) {
  const isEdit = Boolean(existing)
  const createSubAdmin = useCreateSubAdmin()
  const updateAdminUser = useUpdateAdminUser()
  const { toast } = useToast()

  const [fullName, setFullName] = useState(existing?.full_name ?? '')
  const [email, setEmail] = useState(existing?.email ?? '')
  const [phone, setPhone] = useState(existing?.phone ?? '')
  const [whatsapp, setWhatsapp] = useState(existing?.whatsapp ?? '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'superadmin'>(existing?.role === 'superadmin' ? 'superadmin' : 'admin')
  const [permissions, setPermissions] = useState<AdminPermission[]>(existing?.permissions ?? [])

  const togglePermission = (key: AdminPermission) => {
    setPermissions((prev) => (prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]))
  }

  const isPending = createSubAdmin.isPending || updateAdminUser.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isEdit && existing) {
        await updateAdminUser.mutateAsync({
          userId: existing.id,
          patch: { role, permissions, fullName, phone, whatsapp: whatsapp || null },
        })
        toast({ title: 'Admin updated', variant: 'success' })
      } else {
        await createSubAdmin.mutateAsync({ fullName, email, phone, whatsapp: whatsapp || null, password, role, permissions })
        toast({ title: 'Admin account created', variant: 'success' })
      }
      onDone()
    } catch (err) {
      toast({ title: 'Failed to save admin', description: getErrorMessage(err, 'Please try again.'), variant: 'error' })
    }
  }

  const handleRemoveAccess = async () => {
    if (!existing) return
    try {
      await updateAdminUser.mutateAsync({ userId: existing.id, patch: { role: 'customer', permissions: [] } })
      toast({ title: 'Admin access removed', variant: 'success' })
      onDone()
    } catch (err) {
      toast({ title: 'Failed to remove access', description: getErrorMessage(err, 'Please try again.'), variant: 'error' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
      <div>
        <Label htmlFor="admin-name">Full Name</Label>
        <Input id="admin-name" className="mt-1" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
      </div>

      <div>
        <Label htmlFor="admin-email">Email</Label>
        <Input
          id="admin-email"
          type="email"
          className="mt-1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isEdit}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="admin-phone">Phone</Label>
          <Input id="admin-phone" className="mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="admin-whatsapp">WhatsApp (optional)</Label>
          <Input id="admin-whatsapp" className="mt-1" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        </div>
      </div>

      {!isEdit && (
        <div>
          <Label htmlFor="admin-password">Temporary Password</Label>
          <PasswordInput
            id="admin-password"
            className="mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
          <p className="mt-1 text-label-sm text-on-surface-variant">Share this with the new admin directly. At least 8 characters.</p>
        </div>
      )}

      <div>
        <Label>Role</Label>
        <RadioGroup value={role} onValueChange={(v) => setRole(v as 'admin' | 'superadmin')} className="mt-2">
          <label className="flex items-start gap-2">
            <RadioGroupItem value="admin" id="role-admin" className="mt-0.5" />
            <span>
              <span className="block text-label-md font-bold normal-case text-on-surface">Sub-admin</span>
              <span className="block text-label-sm text-on-surface-variant">Access limited to the features checked below.</span>
            </span>
          </label>
          <label className="flex items-start gap-2">
            <RadioGroupItem value="superadmin" id="role-superadmin" className="mt-0.5" />
            <span>
              <span className="block text-label-md font-bold normal-case text-on-surface">Superadmin</span>
              <span className="block text-label-sm text-on-surface-variant">Full access to every feature, including managing other admins.</span>
            </span>
          </label>
        </RadioGroup>
      </div>

      {role === 'admin' && (
        <div>
          <Label>Feature Access</Label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {ADMIN_PERMISSIONS.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2">
                <Checkbox checked={permissions.includes(key)} onCheckedChange={() => togglePermission(key)} />
                <span className="text-label-md normal-case text-on-surface">{label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <DialogFooter>
        {isEdit && (
          <Button type="button" variant="destructive" onClick={handleRemoveAccess} disabled={isPending} className="sm:mr-auto">
            Remove Admin Access
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Admin'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export { AdminUserForm }

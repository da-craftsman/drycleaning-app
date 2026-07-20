import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  useCreateDeliveryZone,
  useDeleteDeliveryZone,
  useDeliveryZones,
  useUpdateDeliveryZone,
} from '@/lib/queries/useDeliveryZones'
import { getErrorMessage } from '@/lib/utils'
import type { DeliveryZone } from '@/types/database'

function ZoneRow({ zone }: { zone: DeliveryZone }) {
  const [name, setName] = useState(zone.name)
  const [pickupFee, setPickupFee] = useState(String(zone.pickup_fee))
  const [deliveryFee, setDeliveryFee] = useState(String(zone.delivery_fee))
  const updateZone = useUpdateDeliveryZone()
  const deleteZone = useDeleteDeliveryZone()
  const { toast } = useToast()

  const dirty = name !== zone.name || pickupFee !== String(zone.pickup_fee) || deliveryFee !== String(zone.delivery_fee)

  const save = () => {
    updateZone.mutate(
      { zoneId: zone.id, patch: { name, pickup_fee: Number(pickupFee) || 0, delivery_fee: Number(deliveryFee) || 0 } },
      {
        onSuccess: () => toast({ title: 'Zone updated', variant: 'success' }),
        onError: (err) => toast({ title: 'Failed to update zone', description: getErrorMessage(err, 'Please try again.'), variant: 'error' }),
      },
    )
  }

  const remove = () => {
    if (!window.confirm(`Remove "${zone.name}" as a delivery zone?`)) return
    deleteZone.mutate(zone.id, {
      onSuccess: () => toast({ title: 'Zone removed', variant: 'success' }),
      onError: (err) => toast({ title: 'Failed to remove zone', description: getErrorMessage(err, 'Please try again.'), variant: 'error' }),
    })
  }

  return (
    <div className="flex flex-wrap items-end gap-2 border-b border-outline-variant/40 py-stack-sm last:border-0">
      <div className="min-w-32 flex-1">
        <Label className="text-label-sm text-on-surface-variant">Zone</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-9" />
      </div>
      <div className="w-24">
        <Label className="text-label-sm text-on-surface-variant">Pickup (₦)</Label>
        <Input value={pickupFee} onChange={(e) => setPickupFee(e.target.value)} className="mt-1 h-9" inputMode="numeric" />
      </div>
      <div className="w-24">
        <Label className="text-label-sm text-on-surface-variant">Delivery (₦)</Label>
        <Input value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} className="mt-1 h-9" inputMode="numeric" />
      </div>
      <Button size="sm" variant="outline" onClick={save} disabled={!dirty || updateZone.isPending}>
        Save
      </Button>
      <button
        type="button"
        onClick={remove}
        disabled={deleteZone.isPending}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-error-container hover:text-on-error-container"
        aria-label={`Remove ${zone.name}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}

function NewZoneForm() {
  const [name, setName] = useState('')
  const [pickupFee, setPickupFee] = useState('')
  const [deliveryFee, setDeliveryFee] = useState('')
  const createZone = useCreateDeliveryZone()
  const { toast } = useToast()

  const handleAdd = () => {
    if (!name.trim()) return
    createZone.mutate(
      { name: name.trim(), pickupFee: Number(pickupFee) || 0, deliveryFee: Number(deliveryFee) || 0 },
      {
        onSuccess: () => {
          toast({ title: 'Zone added', variant: 'success' })
          setName('')
          setPickupFee('')
          setDeliveryFee('')
        },
        onError: (err) => toast({ title: 'Failed to add zone', description: getErrorMessage(err, 'Please try again.'), variant: 'error' }),
      },
    )
  }

  return (
    <div className="flex flex-wrap items-end gap-2 pt-stack-sm">
      <div className="min-w-32 flex-1">
        <Label htmlFor="new-zone-name">New zone name</Label>
        <Input id="new-zone-name" className="mt-1 h-9" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ogui Road" />
      </div>
      <div className="w-24">
        <Label htmlFor="new-zone-pickup">Pickup (₦)</Label>
        <Input id="new-zone-pickup" className="mt-1 h-9" value={pickupFee} onChange={(e) => setPickupFee(e.target.value)} inputMode="numeric" placeholder="2500" />
      </div>
      <div className="w-24">
        <Label htmlFor="new-zone-delivery">Delivery (₦)</Label>
        <Input id="new-zone-delivery" className="mt-1 h-9" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} inputMode="numeric" placeholder="2500" />
      </div>
      <Button onClick={handleAdd} disabled={!name.trim() || createZone.isPending}>
        <Plus className="h-4 w-4" /> Add
      </Button>
    </div>
  )
}

function ZoneManager() {
  const { data: zones, isLoading } = useDeliveryZones()

  if (isLoading) {
    return <Skeleton className="h-40 w-full" />
  }

  return (
    <Card>
      <CardContent className="flex flex-col pt-stack-md">
        <p className="mb-stack-sm text-body-md text-on-surface-variant">
          Pickup-only and delivery-only orders are each charged their own fee below. Pickup &amp; delivery orders are charged
          the sum of both. Self drop-off &amp; pickup is always free.
        </p>
        {zones?.map((zone) => (
          <ZoneRow key={zone.id} zone={zone} />
        ))}
        {(!zones || zones.length === 0) && <p className="py-2 text-body-md text-on-surface-variant">No delivery zones yet.</p>}
        <NewZoneForm />
      </CardContent>
    </Card>
  )
}

export { ZoneManager }

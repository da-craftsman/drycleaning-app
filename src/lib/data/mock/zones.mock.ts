import { db, delay, persist } from '@/lib/data/mock/store'
import type { DeliveryZone } from '@/types/database'

export function getDeliveryZonesMock(): Promise<DeliveryZone[]> {
  return delay([...db.deliveryZones].sort((a, b) => a.name.localeCompare(b.name)))
}

export function createDeliveryZoneMock(name: string, pickupFee: number, deliveryFee: number): Promise<DeliveryZone> {
  const zone: DeliveryZone = { id: `zone-${crypto.randomUUID()}`, name, pickup_fee: pickupFee, delivery_fee: deliveryFee }
  db.deliveryZones.push(zone)
  persist()
  return delay(zone)
}

export function updateDeliveryZoneMock(
  zoneId: string,
  patch: Partial<Pick<DeliveryZone, 'name' | 'pickup_fee' | 'delivery_fee'>>,
): Promise<DeliveryZone> {
  const zone = db.deliveryZones.find((z) => z.id === zoneId)
  if (!zone) throw new Error(`Delivery zone ${zoneId} not found`)
  Object.assign(zone, patch)
  persist()
  return delay(zone)
}

export function deleteDeliveryZoneMock(zoneId: string): Promise<void> {
  db.deliveryZones = db.deliveryZones.filter((z) => z.id !== zoneId)
  persist()
  return delay(undefined)
}

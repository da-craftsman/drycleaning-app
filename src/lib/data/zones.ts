import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import {
  createDeliveryZoneMock,
  deleteDeliveryZoneMock,
  getDeliveryZonesMock,
  updateDeliveryZoneMock,
} from '@/lib/data/mock/zones.mock'
import type { DeliveryZone } from '@/types/database'

export async function getDeliveryZones(): Promise<DeliveryZone[]> {
  if (!isSupabaseConfigured) return getDeliveryZonesMock()
  const { data, error } = await supabase!.from('delivery_zones').select('*').order('name')
  if (error) throw error
  return data
}

export async function createDeliveryZone(name: string, pickupFee: number, deliveryFee: number): Promise<DeliveryZone> {
  if (!isSupabaseConfigured) return createDeliveryZoneMock(name, pickupFee, deliveryFee)
  const { data, error } = await supabase!
    .from('delivery_zones')
    .insert({ name, pickup_fee: pickupFee, delivery_fee: deliveryFee })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateDeliveryZone(
  zoneId: string,
  patch: Partial<Pick<DeliveryZone, 'name' | 'pickup_fee' | 'delivery_fee'>>,
): Promise<DeliveryZone> {
  if (!isSupabaseConfigured) return updateDeliveryZoneMock(zoneId, patch)
  const { data, error } = await supabase!.from('delivery_zones').update(patch).eq('id', zoneId).select().single()
  if (error) throw error
  return data
}

export async function deleteDeliveryZone(zoneId: string): Promise<void> {
  if (!isSupabaseConfigured) return deleteDeliveryZoneMock(zoneId)
  const { error } = await supabase!.from('delivery_zones').delete().eq('id', zoneId)
  if (error) {
    if (error.code === '23503') {
      throw new Error('This zone has past orders attached to it and can\'t be deleted.')
    }
    throw error
  }
}

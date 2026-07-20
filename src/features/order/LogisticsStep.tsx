import { Truck, Store, PackageCheck, PackagePlus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SelectionCard } from '@/components/ui/card';
import { useDeliveryZones } from '@/lib/queries/useDeliveryZones';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import { formatNaira } from '@/features/catalog/ItemCard';
import type { DeliveryZone, LogisticsType } from '@/types/database';

const logisticsOptions: {
  type: LogisticsType;
  label: string;
  icon: typeof Truck;
  needsZone: boolean;
}[] = [
  {
    type: 'self_dropoff',
    label: 'Self Drop-off & Pickup',
    icon: Store,
    needsZone: false,
  },
  {
    type: 'pickup_only',
    label: 'Pickup Only',
    icon: PackagePlus,
    needsZone: true,
  },
  {
    type: 'delivery_only',
    label: 'Delivery Only',
    icon: PackageCheck,
    needsZone: true,
  },
  {
    type: 'pickup_and_delivery',
    label: 'Pickup & Delivery',
    icon: Truck,
    needsZone: true,
  },
];

/** The fee a given logistics option would cost for `zone` — null when it needs a zone that isn't picked yet. */
function feeFor(type: LogisticsType, zone: DeliveryZone | undefined): number | null {
  if (type === 'self_dropoff') return 0;
  if (!zone) return null;
  if (type === 'pickup_only') return zone.pickup_fee;
  if (type === 'delivery_only') return zone.delivery_fee;
  return zone.pickup_fee + zone.delivery_fee; // pickup_and_delivery
}

function LogisticsStep() {
  const { data: zones, isLoading } = useDeliveryZones();
  const logisticsType = useCheckoutStore((s) => s.logisticsType);
  const zoneId = useCheckoutStore((s) => s.zoneId);
  const setLogistics = useCheckoutStore((s) => s.setLogistics);

  const selected = logisticsOptions.find((o) => o.type === logisticsType);
  const selectedZone = zones?.find((z) => z.id === zoneId);

  return (
    <div className='flex flex-col gap-stack-md'>
      <div>
        <h2 className='font-display text-headline-md text-on-surface'>
          Logistics
        </h2>
        <p className='text-body-md text-on-surface-variant'>
          As soon as possible, timing starts once we have your items.
        </p>
      </div>

      <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
        {logisticsOptions.map(({ type, label, icon: Icon, needsZone }) => {
          const fee = feeFor(type, selectedZone);
          return (
            <SelectionCard
              key={type}
              selected={logisticsType === type}
              onClick={() => setLogistics(type, needsZone ? zoneId : null)}
              className='flex flex-col items-center gap-2 text-center'
            >
              <Icon className='h-5 w-5 text-primary' />
              <span className='text-label-sm font-bold normal-case text-on-surface'>
                {label}
              </span>
              {fee === 0 ? (
                <Badge variant='success'>Free</Badge>
              ) : fee !== null ? (
                <Badge variant='primary'>{formatNaira(fee)}</Badge>
              ) : (
                <span className='text-label-sm normal-case text-on-surface-variant'>Select a zone</span>
              )}
            </SelectionCard>
          );
        })}
      </div>

      {selected?.needsZone && (
        <div className='max-w-sm'>
          <Label htmlFor='zone'>Delivery zone</Label>
          <Select
            value={zoneId ?? undefined}
            onValueChange={(v) => setLogistics(logisticsType!, v)}
            disabled={isLoading}
          >
            <SelectTrigger id='zone' className='mt-1 text-sm sm:text-body-md'>
              <SelectValue
                className='truncate'
                placeholder={isLoading ? 'Loading zones…' : 'Select a zone'}
              />
            </SelectTrigger>
            <SelectContent>
              {zones?.map((zone) => (
                <SelectItem key={zone.id} value={zone.id} className='text-sm sm:text-body-md'>
                  {zone.name} (Pickup {formatNaira(zone.pickup_fee)} · Delivery {formatNaira(zone.delivery_fee)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

export { LogisticsStep, logisticsOptions };

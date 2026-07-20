import { ZoneManager } from '@/features/admin/ZoneManager'

export default function AdminZonesPage() {
  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl px-margin-mobile py-stack-lg md:px-gutter">
      <h1 className="mb-stack-sm text-headline-lg-mobile font-display text-laundry-blue-deep md:text-headline-lg">Delivery Zones</h1>
      <p className="mb-stack-md text-body-md text-on-surface-variant">
        Update names or fees, remove zones no longer served, or add new ones.
      </p>
      <ZoneManager />
    </div>
  )
}

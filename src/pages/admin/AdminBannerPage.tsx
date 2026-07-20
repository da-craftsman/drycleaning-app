import { BannerManager } from '@/features/admin/BannerManager'

export default function AdminBannerPage() {
  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl px-margin-mobile py-stack-lg md:px-gutter">
      <h1 className="mb-stack-sm text-headline-lg-mobile font-display text-laundry-blue-deep md:text-headline-lg">Banner</h1>
      <p className="mb-stack-md text-body-md text-on-surface-variant">
        Control the promotional banner shown on the home page: swap in an image or GIF, set where it links to, or turn it off.
      </p>
      <BannerManager />
    </div>
  )
}

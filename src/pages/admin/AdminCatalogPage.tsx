import { CatalogManager } from '@/features/admin/CatalogManager'

export default function AdminCatalogPage() {
  return (
    <div className="mx-auto w-full min-w-0 max-w-shell px-margin-mobile py-stack-lg md:px-gutter">
      <h1 className="mb-stack-md text-headline-lg-mobile font-display text-laundry-blue-deep md:text-headline-lg">Catalog & Pricing</h1>
      <CatalogManager />
    </div>
  )
}

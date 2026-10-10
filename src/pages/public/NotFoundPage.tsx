import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { paths } from '@/routes/paths'
import { useNoIndex } from '@/hooks/useSeo'

export default function NotFoundPage() {
  const { pathname } = useLocation()
  useNoIndex('Page Not Found | Shalah Rex Laundry', pathname)

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-shell flex-col items-center gap-stack-md px-margin-mobile py-stack-lg text-center">
      <p className="text-display-lg font-display text-laundry-blue-deep">404</p>
      <p className="text-body-lg text-on-surface-variant">This page doesn't exist.</p>
      <Button asChild>
        <Link to={paths.home}>Back to Home</Link>
      </Button>
    </div>
  )
}

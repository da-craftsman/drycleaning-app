import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { paths } from '@/routes/paths'

export default function NotFoundPage() {
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

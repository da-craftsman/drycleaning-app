import { Suspense } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { paths } from '@/routes/paths'
import { Toaster } from '@/components/ui/toaster'
import { Skeleton } from '@/components/ui/skeleton'

/** Centered card layout for login/signup — minimal chrome, just the brand mark. */
function AuthLayout() {
  return (
    <div className="flex min-h-svh w-full min-w-0 flex-col items-center justify-center bg-surface-container-low px-margin-mobile py-stack-lg">
      <Link to={paths.home} className="mb-stack-lg">
        <Logo />
      </Link>
      <div className="w-full max-w-md rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-stack-lg shadow-soft-lift">
        <Suspense fallback={<Skeleton className="h-48 w-full" />}>
          <Outlet />
        </Suspense>
      </div>
      <Toaster />
    </div>
  )
}

export { AuthLayout }

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { paths } from '@/routes/paths'
import { Skeleton } from '@/components/ui/skeleton'

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-shell px-margin-mobile py-stack-lg">
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={paths.login} state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}

/** Nested inside ProtectedRoute — assumes `profile` is already loaded and non-null. */
function RequireVerifiedEmail() {
  const { profile } = useAuth()

  if (profile && !profile.email_verified_at) {
    return <Navigate to={paths.verifyEmail} replace />
  }

  return <Outlet />
}

function AdminRoute() {
  const { isAdmin, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-shell px-margin-mobile py-stack-lg">
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to={paths.login} replace />
  }

  return <Outlet />
}

export { ProtectedRoute, RequireVerifiedEmail, AdminRoute }

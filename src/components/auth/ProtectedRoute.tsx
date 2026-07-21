import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { paths } from '@/routes/paths'
import { Skeleton } from '@/components/ui/skeleton'
import type { AdminPermission } from '@/types/database'

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

/** Nested inside AdminRoute — redirects sub-admins lacking `feature` back to the admin dashboard. */
function RequirePermission({ feature }: { feature: AdminPermission }) {
  const { hasPermission, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-shell px-margin-mobile py-stack-lg">
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!hasPermission(feature)) {
    return <Navigate to={paths.admin} replace />
  }

  return <Outlet />
}

/** Nested inside AdminRoute — guards superadmin-only sections (e.g. managing other admins). */
function RequireSuperAdmin() {
  const { isSuperAdmin, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-shell px-margin-mobile py-stack-lg">
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!isSuperAdmin) {
    return <Navigate to={paths.admin} replace />
  }

  return <Outlet />
}

export { ProtectedRoute, RequireVerifiedEmail, AdminRoute, RequirePermission, RequireSuperAdmin }

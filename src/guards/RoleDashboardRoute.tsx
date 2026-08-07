import { Navigate, useParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { roleById, roleDashboardPath, roleIdFromSlug } from '@/roles/roles'
import { RolePlaceholderPage } from '@/pages/role-placeholder-page'
import { DashboardPage } from '@/pages/dashboard-page'

/**
 * Renders the dashboard for the role in the URL slug and enforces that the
 * slug matches the signed-in user's actual role (otherwise 403).
 * Student dashboards are fully built; staff dashboards show a placeholder.
 */
export function RoleDashboardRoute() {
  const { user, isAuthenticated } = useAuth()
  const { role: slug } = useParams()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!user) return <Navigate to="/login" replace />

  const expected = slug ? roleIdFromSlug(slug) : user.role === 'STUDENT' ? 'STUDENT' : undefined
  if (!expected || expected !== user.role) {
    return <Navigate to="/unauthorized" replace />
  }

  if (user.role === 'STUDENT') {
    return <DashboardPage />
  }

  return <RolePlaceholderPage role={roleById(user.role)} />
}

/** Redirects /dashboard to the signed-in user's role-specific dashboard. */
export function DashboardRoute() {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />
  return <Navigate to={roleDashboardPath(user.role)} replace />
}

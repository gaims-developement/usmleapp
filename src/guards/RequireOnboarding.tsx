import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { roleDashboardPath } from '@/roles/roles'

/**
 * Only students pending onboarding may pass. Staff roles skip onboarding
 * and are sent straight to their dashboard; onboarded students too.
 */
export function RequireOnboarding() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'STUDENT' || user.onboarded) {
    return <Navigate to={roleDashboardPath(user.role)} replace />
  }
  return <Outlet />
}

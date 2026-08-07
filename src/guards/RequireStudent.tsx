import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

/**
 * Student app guard: requires a STUDENT role that has completed onboarding.
 * Non-students get 403; students who haven't finished onboarding go there first.
 */
export function RequireStudent() {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!user || user.role !== 'STUDENT') return <Navigate to="/unauthorized" replace />
  if (!user.onboarded) return <Navigate to="/onboarding" replace />
  return <Outlet />
}

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

/** Redirects non-active hospitals to the overview (pending view). */
export function RequireActiveHospital() {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.hospital?.status !== 'active') {
    return <Navigate to="/dashboard/hospital" replace />
  }
  return <Outlet />
}

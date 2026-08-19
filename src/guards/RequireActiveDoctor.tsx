import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

/** Redirects non-active doctors to the overview (pending view). */
export function RequireActiveDoctor() {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.doctor?.status !== 'active') {
    return <Navigate to="/dashboard/doctor" replace />
  }
  return <Outlet />
}

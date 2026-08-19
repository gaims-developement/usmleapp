import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

/** Redirects non-active reviewers to the overview (pending view). */
export function RequireActiveReviewer() {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.reviewer?.status !== 'active') {
    return <Navigate to="/dashboard/reviewer" replace />
  }
  return <Outlet />
}

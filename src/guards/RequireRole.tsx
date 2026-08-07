import { Navigate, Outlet } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { RoleId } from '@/types/rbac'

interface RequireRoleProps {
  roles: RoleId[]
  children?: ReactNode
}

/**
 * Guards a route by role. Unauthenticated users go to /login,
 * authenticated users outside `roles` go to /unauthorized.
 */
export function RequireRole({ roles, children }: RequireRoleProps) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }
  return children ?? <Outlet />
}

import { Navigate, Outlet } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { hasRole } from '@/permissions/access'
import type { RoleId } from '@/types/rbac'

interface RequireRoleProps {
  roles: RoleId[]
  children?: ReactNode
}

/**
 * Guards a route by role (honoring the central role hierarchy). Unauthenticated
 * users go to /login, authenticated users outside `roles` go to /unauthorized.
 */
export function RequireRole({ roles, children }: RequireRoleProps) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  if (!user || !hasRole(user.role, ...roles)) {
    return <Navigate to="/unauthorized" replace />
  }
  return children ?? <Outlet />
}

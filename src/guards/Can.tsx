import type { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { Permission } from '@/types/rbac'

interface CanProps {
  permission: Permission
  fallback?: ReactNode
  children: ReactNode
}

/** Renders children only when the signed-in user holds the given permission. */
export function Can({ permission, fallback = null, children }: CanProps) {
  const { hasPermission } = useAuth()
  return hasPermission(permission) ? children : fallback
}

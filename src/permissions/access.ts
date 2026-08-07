import type { LoginCredentials, Permission, Role, RoleId } from '@/types/rbac'
import { roleById } from '@/roles/roles'

/**
 * Role-based access helpers. Pure functions so they are trivially testable and
 * reusable by route guards, UI components, and future server-side middleware.
 */

export function hasPermission(role: Role | RoleId, permission: Permission): boolean {
  const resolved = typeof role === 'string' ? roleById(role) : role
  return resolved.permissions.includes(permission)
}

export function hasAnyPermission(role: Role | RoleId, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p))
}

export function hasAllPermissions(role: Role | RoleId, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p))
}

export function canManageRole(actor: RoleId, target: RoleId): boolean {
  return roleById(actor).manageableRoles.includes(target)
}

export function canLogin(credentials: LoginCredentials): boolean {
  return Boolean(credentials.email && credentials.password)
}

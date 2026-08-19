import type { LoginCredentials, Permission, Role, RoleId } from '@/types/rbac'
import { ROLE_SUPERSEDES, roleById } from '@/roles/roles'

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

/**
 * Whether a role implicitly holds another role's access through the role
 * hierarchy (e.g. SUPER_ADMIN supersedes ADMIN). Transitive so chains stay
 * correct even if a new tier is added between existing roles later.
 */
export function canAccessRole(actor: RoleId, required: RoleId): boolean {
  if (actor === required) return true
  const visited = new Set<RoleId>([actor])
  const queue: RoleId[] = [...(ROLE_SUPERSEDES[actor] ?? [])]
  while (queue.length > 0) {
    const current = queue.shift()!
    if (current === required) return true
    if (visited.has(current)) continue
    visited.add(current)
    for (const superseded of ROLE_SUPERSEDES[current] ?? []) {
      if (!visited.has(superseded)) queue.push(superseded)
    }
  }
  return false
}

/** Whether the actor holds ANY of the required roles (honoring hierarchy). */
export function hasRole(actor: Role | RoleId | null | undefined, ...required: RoleId[]): boolean {
  if (!actor) return false
  const actorId = typeof actor === 'string' ? actor : actor.id
  return required.some(requiredRole => canAccessRole(actorId, requiredRole))
}

export function canManageRole(actor: RoleId, target: RoleId): boolean {
  return roleById(actor).manageableRoles.includes(target)
}

export function canLogin(credentials: LoginCredentials): boolean {
  return Boolean(credentials.email && credentials.password)
}

import { AppError } from '../utils/app-error.js'

/**
 * Central role hierarchy. A role implicitly grants access to every role it
 * supersedes (transitively). Mirrors `ROLE_SUPERSEDES` in the frontend
 * (`src/roles/roles.ts`) so both layers authorize consistently.
 */
const ROLE_SUPERSEDES = {
  SUPER_ADMIN: ['ADMIN'],
  ADMIN: [],
  REVIEWER: [],
  HOSPITAL: [],
  DOCTOR: [],
  STUDENT: [],
}

/** Whether `actorRole` counts as holding `requiredRole`, honoring the hierarchy. */
export function canAccessRole(actorRole, requiredRole) {
  if (actorRole === requiredRole) return true
  const visited = new Set([actorRole])
  const queue = [...(ROLE_SUPERSEDES[actorRole] ?? [])]
  while (queue.length > 0) {
    const current = queue.shift()
    if (current === requiredRole) return true
    if (visited.has(current)) continue
    visited.add(current)
    for (const superseded of ROLE_SUPERSEDES[current] ?? []) {
      if (!visited.has(superseded)) queue.push(superseded)
    }
  }
  return false
}

export function requireRoles(...roles) {
  return function roleMiddleware(req, _res, next) {
    const userRole = req.user?.role
    if (!userRole) {
      return next(new AppError('Authenticated user role is missing', 403, 'ROLE_MISSING'))
    }
    if (!roles.some(requiredRole => canAccessRole(userRole, requiredRole))) {
      return next(new AppError('You do not have permission to access this resource', 403, 'FORBIDDEN'))
    }
    return next()
  }
}

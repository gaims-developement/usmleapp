import { useAuth } from '@/hooks/useAuth'
import type { Role, RoleId } from '@/types/rbac'

/** Returns the current user's role id and resolved role definition. */
export function useRole(): { roleId: RoleId | null; role: Role | null } {
  const { user, role } = useAuth()
  return { roleId: user?.role ?? null, role }
}

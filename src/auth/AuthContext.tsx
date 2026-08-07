import { createContext, useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  AuthUser,
  LoginCredentials,
  LoginResult,
  Permission,
  Role,
  RoleId,
} from '@/types/rbac'
import { roleById } from '@/roles/roles'
import { authService, makeMockToken } from '@/services/authService'
import { sessionService } from '@/services/sessionService'
import { userService } from '@/services/userService'
import type { CreateUserInput } from '@/services/userService'

export interface AuthContextValue {
  user: AuthUser | null
  role: Role | null
  permissions: Permission[]
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<LoginResult>
  logout: () => Promise<void>
  signUp: (input: CreateUserInput) => Promise<AuthUser>
  completeOnboarding: (patch: Partial<AuthUser>) => void
  hasPermission: (permission: Permission) => boolean
  hasRole: (...roles: RoleId[]) => boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)

const NO_PERMISSIONS: Permission[] = []

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => sessionService.get()?.user ?? null)

  const login = useCallback(async (credentials: LoginCredentials) => {
    const result = await authService.login(credentials)
    setUser(result.user)
    return result
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const signUp = useCallback(async (input: CreateUserInput) => {
    const created = userService.create({ ...input, role: input.role ?? 'STUDENT' })
    const token = makeMockToken(created)
    sessionService.set({ user: created, token })
    setUser(created)
    return created
  }, [])

  const completeOnboarding = useCallback((patch: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return prev
      const next: AuthUser = { ...prev, onboarded: true, ...patch }
      userService.update(prev.id, next)
      sessionService.update(next)
      return next
    })
  }, [])

  const role = user ? roleById(user.role) : null
  const permissions = user ? roleById(user.role).permissions : NO_PERMISSIONS

  const hasPermission = useCallback(
    (permission: Permission) => permissions.includes(permission),
    [permissions],
  )

  const hasRole = useCallback((...roles: RoleId[]) => (user ? roles.includes(user.role) : false), [user])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role,
      permissions,
      isAuthenticated: Boolean(user),
      login,
      logout,
      signUp,
      completeOnboarding,
      hasPermission,
      hasRole,
    }),
    [user, role, permissions, login, logout, signUp, completeOnboarding, hasPermission, hasRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

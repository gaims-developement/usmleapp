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
import { authService } from '@/services/authService'
import { sessionService } from '@/services/sessionService'
import { userService } from '@/services/userService'
import { addStudentNotification } from '@/services/studentService'
import type { CreateUserInput } from '@/services/userService'

export interface AuthContextValue {
  user: AuthUser | null
  role: Role | null
  permissions: Permission[]
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<LoginResult>
  logout: () => Promise<void>
  signUp: (input: CreateUserInput) => Promise<AuthUser>
  completeOnboarding: (patch: Partial<AuthUser>) => Promise<void>
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
    const result = await authService.register({
      name: input.name,
      email: input.email,
      password: input.password ?? '',
      college: input.college,
      dob: input.dob,
      electives: input.electives,
      locations: input.locations,
    })
    setUser(result.user)
    addStudentNotification(
      'Welcome to the club! 🎉',
      `We're thrilled to have you, ${input.name.split(' ')[0]}. Finish your profile to start exploring U.S. clinical rotations.`,
    )
    return result.user
  }, [])

  const completeOnboarding = useCallback(async (patch: Partial<AuthUser>) => {
    if (!user) return
    const updated = await userService.update(user.id, patch)
    setUser(updated)
    sessionService.update(updated)
  }, [user])

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

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
import { hasRole as centralHasRole } from '@/permissions/access'
import { authService } from '@/services/authService'
import type {
  DoctorRegisterInput,
  HospitalRegisterInput,
  PendingRegistrationResult,
  ReviewerRegisterInput,
} from '@/services/authService'
import { sessionService } from '@/services/sessionService'
import { userService } from '@/services/userService'
import { addStudentNotification } from '@/services/studentService'
import type { CreateUserInput } from '@/services/userService'
import { adminStudents, type AdminStudent } from '@/mocks/admin/students'


export interface AuthContextValue {
  user: AuthUser | null
  role: Role | null
  permissions: Permission[]
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<LoginResult>
  logout: () => Promise<void>
  signUp: (input: CreateUserInput) => Promise<AuthUser>
  registerHospital: (input: HospitalRegisterInput) => Promise<PendingRegistrationResult>
  registerDoctor: (input: DoctorRegisterInput) => Promise<PendingRegistrationResult>
  registerReviewer: (input: ReviewerRegisterInput) => Promise<PendingRegistrationResult>
  completeOnboarding: (patch: Partial<AuthUser>) => Promise<void>
  updateUser: (patch: Partial<AuthUser>) => void
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

    try {
      const storedStudentsRaw = localStorage.getItem('usmle_admin_students')
      const currentStudents = storedStudentsRaw ? JSON.parse(storedStudentsRaw) : [...adminStudents]
      
      const exists = currentStudents.some((s: any) => s.email.toLowerCase() === input.email.toLowerCase())
      if (!exists) {
        const newAdminStudent: AdminStudent = {
          id: result.user.id,
          name: input.name,
          email: input.email,
          country: 'India',
          school: input.college ?? 'Medical School',
          step1: '—',
          step2: '—',
          applications: 0,
          docsComplete: 0,
          docsTotal: 6,
          profileComplete: false,
          flagged: false,
          status: 'active',
          joinedAt: new Date().toISOString().slice(0, 10),
        }
        currentStudents.unshift(newAdminStudent)
        localStorage.setItem('usmle_admin_students', JSON.stringify(currentStudents))
      }
    } catch (e) {
      console.error(e)
    }

    return result.user
  }, [])

  const registerHospital = useCallback(async (input: HospitalRegisterInput) => {
    const result = await authService.registerHospital(input)
    setUser(result.user)
    return result
  }, [])

  const registerDoctor = useCallback(async (input: DoctorRegisterInput) => {
    const result = await authService.registerDoctor(input)
    setUser(result.user)
    return result
  }, [])

  const registerReviewer = useCallback(async (input: ReviewerRegisterInput) => {
    const result = await authService.registerReviewer(input)
    setUser(result.user)
    return result
  }, [])

  const completeOnboarding = useCallback(async (patch: Partial<AuthUser>) => {
    if (!user) return
    const updated = await userService.update(user.id, patch)
    setUser(updated)
    sessionService.update(updated)

    try {
      const storedStudentsRaw = localStorage.getItem('usmle_admin_students')
      if (storedStudentsRaw) {
        const currentStudents = JSON.parse(storedStudentsRaw)
        const targetIdx = currentStudents.findIndex((s: any) => s.email.toLowerCase() === user.email.toLowerCase())
        if (targetIdx !== -1) {
          currentStudents[targetIdx].profileComplete = true
          localStorage.setItem('usmle_admin_students', JSON.stringify(currentStudents))
        }
      }
    } catch (e) {
      console.error(e)
    }
  }, [user])

  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setUser(current => {
      if (!current) return current
      const next = { ...current, ...patch }
      sessionService.update(patch)
      return next
    })
  }, [])

  const role = user ? roleById(user.role) : null
  const permissions = user ? roleById(user.role).permissions : NO_PERMISSIONS

  const hasPermission = useCallback(
    (permission: Permission) => permissions.includes(permission),
    [permissions],
  )

  const hasRole = useCallback(
    (...roles: RoleId[]) => centralHasRole(user?.role, ...roles),
    [user],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role,
      permissions,
      isAuthenticated: Boolean(user),
      login,
      logout,
      signUp,
      registerHospital,
      registerDoctor,
      registerReviewer,
      completeOnboarding,
      updateUser,
      hasPermission,
      hasRole,
    }),
    [
      user,
      role,
      permissions,
      login,
      logout,
      signUp,
      registerHospital,
      registerDoctor,
      registerReviewer,
      completeOnboarding,
      updateUser,
      hasPermission,
      hasRole,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

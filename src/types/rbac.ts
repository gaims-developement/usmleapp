export type RoleId = 'SUPER_ADMIN' | 'ADMIN' | 'REVIEWER' | 'HOSPITAL' | 'DOCTOR' | 'STUDENT'

export type Permission =
  | 'users.read'
  | 'users.create'
  | 'users.update'
  | 'users.delete'
  | 'roles.manage'
  | 'applications.review'
  | 'applications.manage'
  | 'applications.view'
  | 'documents.verify'
  | 'programs.manage'
  | 'hospitals.manage'
  | 'doctors.manage'
  | 'students.manage'
  | 'announcements.manage'
  | 'cms.manage'
  | 'analytics.view'
  | 'settings.manage'
  | 'payments.view'
  | 'payments.manage'

export interface Role {
  /** Stable unique id, intended to map to a `roles` table row in PostgreSQL. */
  id: RoleId
  /** Human-readable role name. */
  name: string
  description: string
  /** Explicit permission grants for this role. */
  permissions: Permission[]
  /** Roles this role is allowed to create/update/delete. */
  manageableRoles: RoleId[]
  /**
   * Roles whose access this role implicitly grants (role hierarchy).
   * E.g. SUPER_ADMIN supersedes ADMIN, so SUPER_ADMIN passes any
   * ADMIN gate without duplicating ADMIN checks.
   */
  supersedes: RoleId[]
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: RoleId
  onboarded: boolean
  /** True for seeded demo accounts; real accounts (incl. the real SUPER_ADMIN) are false. */
  isDemo: boolean
  avatarUrl?: string | null
  college?: string
  dob?: string
  electives?: string[]
  locations?: string[]
  graduationYear?: number
  visaStatus?: string
  goals?: string[]
  earliestStart?: string
  durationPreference?: number
  travelReady?: boolean
  createdAt: string
  hospital?: {
    id: string
    name: string | null
    city: string | null
    state: string | null
    country: string | null
    address?: string | null
    website?: string | null
    email: string | null
    phone: string | null
    description: string | null
    coordinatorName: string | null
    coordinatorEmail: string | null
    coordinatorPhone: string | null
    tier: string | null
    status: string | null
  }
  doctor?: {
    id: string
    specialty: string | null
    title?: string | null
    licenseNumber?: string | null
    email: string | null
    phone: string | null
    availability: string | null
    status: string | null
    hospitalId?: string | null
    hospitalName?: string | null
    departmentId?: string | null
    departmentName?: string | null
  }
  reviewer?: {
    id: string
    specialty: string | null
    department: string | null
    timezone: string | null
    title?: string | null
    institution?: string | null
    phone?: string | null
    yearsOfExperience?: number | null
    status?: string | null
    hospitalId?: string | null
    hospitalName?: string | null
  }
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
  refreshTokenExpiresAt: string
}

export interface LoginResult extends TokenPair {
  user: AuthUser
}

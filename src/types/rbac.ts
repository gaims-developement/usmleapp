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
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: RoleId
  onboarded: boolean
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
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResult {
  user: AuthUser
  /** Mock JWT-shaped token. Replace with a real signed JWT when the Express API is connected. */
  token: string
}

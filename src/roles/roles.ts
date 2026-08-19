import type { Permission, Role, RoleId } from '@/types/rbac'
import { ALL_PERMISSIONS, PERMISSION } from '@/permissions/permissions'

const ADMIN_PERMISSIONS: Permission[] = [
  PERMISSION.USERS_READ,
  PERMISSION.USERS_CREATE,
  PERMISSION.USERS_UPDATE,
  PERMISSION.USERS_DELETE,
  PERMISSION.HOSPITALS_MANAGE,
  PERMISSION.DOCTORS_MANAGE,
  PERMISSION.STUDENTS_MANAGE,
  PERMISSION.ANNOUNCEMENTS_MANAGE,
  PERMISSION.ANALYTICS_VIEW,
  PERMISSION.APPLICATIONS_MANAGE,
  PERMISSION.APPLICATIONS_VIEW,
]

const REVIEWER_PERMISSIONS: Permission[] = [
  PERMISSION.APPLICATIONS_VIEW,
  PERMISSION.APPLICATIONS_REVIEW,
  PERMISSION.APPLICATIONS_MANAGE,
  PERMISSION.DOCUMENTS_VERIFY,
]

const HOSPITAL_PERMISSIONS: Permission[] = [
  PERMISSION.HOSPITALS_MANAGE,
  PERMISSION.PROGRAMS_MANAGE,
  PERMISSION.APPLICATIONS_MANAGE,
  PERMISSION.APPLICATIONS_VIEW,
  PERMISSION.STUDENTS_MANAGE,
]

const DOCTOR_PERMISSIONS: Permission[] = [
  PERMISSION.STUDENTS_MANAGE,
  PERMISSION.DOCUMENTS_VERIFY,
  PERMISSION.APPLICATIONS_VIEW,
]

const STUDENT_PERMISSIONS: Permission[] = [
  PERMISSION.USERS_UPDATE,
  PERMISSION.APPLICATIONS_MANAGE,
  PERMISSION.APPLICATIONS_VIEW,
]

export const ROLES: Record<RoleId, Role> = {
  SUPER_ADMIN: {
    id: 'SUPER_ADMIN',
    name: 'Super Admin',
    description: 'Full platform control — users, roles, settings, payments, and content.',
    permissions: [...ALL_PERMISSIONS],
    manageableRoles: ['ADMIN', 'REVIEWER', 'HOSPITAL', 'DOCTOR', 'STUDENT'],
    supersedes: ['ADMIN'],
  },
  ADMIN: {
    id: 'ADMIN',
    name: 'Admin',
    description: 'Manages users, hospitals, doctors, reviewers, applications, and analytics.',
    permissions: ADMIN_PERMISSIONS,
    manageableRoles: ['REVIEWER', 'HOSPITAL', 'DOCTOR'],
    supersedes: [],
  },
  REVIEWER: {
    id: 'REVIEWER',
    name: 'Reviewer',
    description: 'Reviews assigned applications, verifies documents, and makes approval decisions.',
    permissions: REVIEWER_PERMISSIONS,
    manageableRoles: [],
    supersedes: [],
  },
  HOSPITAL: {
    id: 'HOSPITAL',
    name: 'Hospital',
    description: 'Manages its profile and elective programs, accepts applications, and views assigned students.',
    permissions: HOSPITAL_PERMISSIONS,
    manageableRoles: [],
    supersedes: [],
  },
  DOCTOR: {
    id: 'DOCTOR',
    name: 'Doctor / Mentor',
    description: 'Views assigned students, submits evaluations, issues certificates, and recommends LoRs.',
    permissions: DOCTOR_PERMISSIONS,
    manageableRoles: [],
    supersedes: [],
  },
  STUDENT: {
    id: 'STUDENT',
    name: 'Student',
    description: 'Browses electives, applies, uploads documents, and tracks applications.',
    permissions: STUDENT_PERMISSIONS,
    manageableRoles: [],
    supersedes: [],
  },
}

/**
 * Central role hierarchy. A role implicitly grants access to every role it
 * supersedes (transitively). Kept explicit so both the frontend guards and
 * backend middleware can share the same definition of "who outranks whom".
 */
export const ROLE_SUPERSEDES: Record<RoleId, RoleId[]> = {
  SUPER_ADMIN: ['ADMIN'],
  ADMIN: [],
  REVIEWER: [],
  HOSPITAL: [],
  DOCTOR: [],
  STUDENT: [],
}

export const ROLE_IDS: RoleId[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'REVIEWER',
  'HOSPITAL',
  'DOCTOR',
  'STUDENT',
]

export const roleById = (id: RoleId): Role => ROLES[id]

const ROLE_SLUGS: Record<RoleId, string> = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  REVIEWER: 'reviewer',
  HOSPITAL: 'hospital',
  DOCTOR: 'doctor',
  STUDENT: 'student',
}

export const roleSlug = (id: RoleId): string => ROLE_SLUGS[id]

export const roleIdFromSlug = (slug: string | undefined): RoleId | undefined => {
  if (!slug) return undefined
  const entry = (Object.entries(ROLE_SLUGS) as [RoleId, string][]).find(([, s]) => s === slug)
  return entry?.[0]
}

export const roleDashboardPath = (id: RoleId): string => `/dashboard/${ROLE_SLUGS[id]}`

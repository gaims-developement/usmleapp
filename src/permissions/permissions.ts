import type { Permission } from '@/types/rbac'

export const PERMISSION = {
  USERS_READ: 'users.read',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  ROLES_MANAGE: 'roles.manage',
  APPLICATIONS_REVIEW: 'applications.review',
  APPLICATIONS_MANAGE: 'applications.manage',
  APPLICATIONS_VIEW: 'applications.view',
  DOCUMENTS_VERIFY: 'documents.verify',
  PROGRAMS_MANAGE: 'programs.manage',
  HOSPITALS_MANAGE: 'hospitals.manage',
  DOCTORS_MANAGE: 'doctors.manage',
  STUDENTS_MANAGE: 'students.manage',
  ANNOUNCEMENTS_MANAGE: 'announcements.manage',
  CMS_MANAGE: 'cms.manage',
  ANALYTICS_VIEW: 'analytics.view',
  SETTINGS_MANAGE: 'settings.manage',
  PAYMENTS_VIEW: 'payments.view',
  PAYMENTS_MANAGE: 'payments.manage',
} as const satisfies Record<string, Permission>

export const ALL_PERMISSIONS: readonly Permission[] = Object.values(PERMISSION)

export const PERMISSION_REGISTRY: Record<Permission, { label: string; description: string }> = {
  [PERMISSION.USERS_READ]: { label: 'View users', description: 'List and view platform users.' },
  [PERMISSION.USERS_CREATE]: { label: 'Create users', description: 'Create user accounts.' },
  [PERMISSION.USERS_UPDATE]: { label: 'Update users', description: 'Edit user account details and roles.' },
  [PERMISSION.USERS_DELETE]: { label: 'Delete users', description: 'Remove user accounts.' },
  [PERMISSION.ROLES_MANAGE]: { label: 'Manage roles', description: 'Create and assign roles.' },
  [PERMISSION.APPLICATIONS_REVIEW]: { label: 'Review applications', description: 'Review and decide on elective applications.' },
  [PERMISSION.APPLICATIONS_MANAGE]: { label: 'Manage applications', description: 'Update, accept, or reject applications.' },
  [PERMISSION.APPLICATIONS_VIEW]: { label: 'View applications', description: 'Read application data.' },
  [PERMISSION.DOCUMENTS_VERIFY]: { label: 'Verify documents', description: 'Review and verify uploaded documents.' },
  [PERMISSION.PROGRAMS_MANAGE]: { label: 'Manage programs', description: 'Create and manage elective programs.' },
  [PERMISSION.HOSPITALS_MANAGE]: { label: 'Manage hospitals', description: 'Manage hospital profiles and records.' },
  [PERMISSION.DOCTORS_MANAGE]: { label: 'Manage doctors', description: 'Manage doctor/mentor profiles and assignments.' },
  [PERMISSION.STUDENTS_MANAGE]: { label: 'Manage students', description: 'Manage student profiles and assigned students.' },
  [PERMISSION.ANNOUNCEMENTS_MANAGE]: { label: 'Manage announcements', description: 'Publish and manage platform announcements.' },
  [PERMISSION.CMS_MANAGE]: { label: 'Manage content', description: 'Manage CMS content and landing pages.' },
  [PERMISSION.ANALYTICS_VIEW]: { label: 'View analytics', description: 'Access platform analytics and reports.' },
  [PERMISSION.SETTINGS_MANAGE]: { label: 'Manage settings', description: 'Change platform settings and configuration.' },
  [PERMISSION.PAYMENTS_VIEW]: { label: 'View payments', description: 'View payment and billing data.' },
  [PERMISSION.PAYMENTS_MANAGE]: { label: 'Manage payments', description: 'Manage payments, refunds, and invoices.' },
}

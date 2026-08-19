import type { LoginCredentials, RoleId } from '@/types/rbac'

/**
 * Demo accounts that may be logged into via the development-mode login page
 * (`/devmode`). These MUST correspond 1:1 to the demo accounts created by
 * `prisma/seed.ts` (isDemo = true accounts).
 *
 * SUPER_ADMIN is intentionally absent: the real Super Admin is a production
 * account (isDemo = false) seeded from environment variables and its
 * credentials are never placed in frontend code.
 */
export const DEMO_ROLE_IDS: Exclude<RoleId, 'SUPER_ADMIN'>[] = [
  'ADMIN',
  'REVIEWER',
  'HOSPITAL',
  'DOCTOR',
  'STUDENT',
]

export const DEMO_LOGIN_BY_ROLE: Record<Exclude<RoleId, 'SUPER_ADMIN'>, LoginCredentials> = {
  ADMIN: { email: 'admin@demo.com', password: 'DemoPass@2024!' },
  REVIEWER: { email: 'reviewer@demo.com', password: 'DemoPass@2024!' },
  HOSPITAL: { email: 'hospital@demo.com', password: 'DemoPass@2024!' },
  DOCTOR: { email: 'doctor@demo.com', password: 'DemoPass@2024!' },
  STUDENT: { email: 'student@demo.com', password: 'DemoPass@2024!' },
}

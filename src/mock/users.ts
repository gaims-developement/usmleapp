import type { AuthUser, LoginCredentials, RoleId } from '@/types/rbac'

export interface MockUserRecord extends AuthUser {
  /** Plaintext password for the mock store only. Never persist this in production. */
  password: string
}

export const SUPER_ADMIN_SEED = {
  name: 'Super Administrator',
  email: 'admin@imgprep.com',
  password: 'Admin@123',
  role: 'SUPER_ADMIN' as RoleId,
}

export const DEMO_LOGIN_BY_ROLE: Record<RoleId, LoginCredentials> = {
  SUPER_ADMIN: { email: 'admin@imgprep.com', password: 'Admin@123' },
  ADMIN: { email: 'ops@imgprep.com', password: 'Admin@123' },
  REVIEWER: { email: 'reviewer@imgprep.com', password: 'Admin@123' },
  HOSPITAL: { email: 'hospital@imgprep.com', password: 'Admin@123' },
  DOCTOR: { email: 'doctor@imgprep.com', password: 'Admin@123' },
  STUDENT: { email: 'student@imgprep.com', password: 'Admin@123' },
}

export const seedUsers: MockUserRecord[] = [
  {
    id: 'usr-super-admin',
    name: SUPER_ADMIN_SEED.name,
    email: SUPER_ADMIN_SEED.email,
    password: SUPER_ADMIN_SEED.password,
    role: 'SUPER_ADMIN',
    onboarded: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'usr-admin',
    name: 'Alex Admin',
    email: 'ops@imgprep.com',
    password: 'Admin@123',
    role: 'ADMIN',
    onboarded: true,
    createdAt: '2026-01-05',
  },
  {
    id: 'usr-reviewer',
    name: 'Rita Reviewer',
    email: 'reviewer@imgprep.com',
    password: 'Admin@123',
    role: 'REVIEWER',
    onboarded: true,
    createdAt: '2026-01-10',
  },
  {
    id: 'usr-hospital',
    name: 'St. Mary\u2019s Medical Center',
    email: 'hospital@imgprep.com',
    password: 'Admin@123',
    role: 'HOSPITAL',
    onboarded: true,
    createdAt: '2026-01-15',
  },
  {
    id: 'usr-doctor',
    name: 'Dr. Michael Mentor',
    email: 'doctor@imgprep.com',
    password: 'Admin@123',
    role: 'DOCTOR',
    onboarded: true,
    createdAt: '2026-01-20',
  },
  {
    id: 'usr-student',
    name: 'Student Demo',
    email: 'student@imgprep.com',
    password: 'Admin@123',
    role: 'STUDENT',
    onboarded: false,
    createdAt: '2026-07-01',
  },
]

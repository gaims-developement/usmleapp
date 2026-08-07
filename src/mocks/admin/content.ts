import type { RoleId } from '@/types/rbac'

export type AnnouncementStatus = 'published' | 'draft' | 'scheduled'

export interface Announcement {
  id: string
  title: string
  audience: string
  status: AnnouncementStatus
  author: string
  publishedAt: string
  views: number
}

export const adminAnnouncements: Announcement[] = [
  { id: 'ann-1', title: 'Winter rotation windows now open', audience: 'All students', status: 'published', author: 'Alex Admin', publishedAt: '2026-08-05', views: 1842 },
  { id: 'ann-2', title: 'New partnership with Mayo Clinic', audience: 'All students', status: 'published', author: 'Super Administrator', publishedAt: '2026-08-01', views: 3210 },
  { id: 'ann-3', title: 'Document verification holiday schedule', audience: 'Reviewers', status: 'published', author: 'Rita Reviewer', publishedAt: '2026-07-28', views: 410 },
  { id: 'ann-4', title: 'Updated fee structure effective Sep 1', audience: 'Hospitals & students', status: 'scheduled', author: 'Alex Admin', publishedAt: '2026-08-12', views: 0 },
  { id: 'ann-5', title: 'Platform maintenance window', audience: 'All users', status: 'scheduled', author: 'Super Administrator', publishedAt: '2026-08-15', views: 0 },
  { id: 'ann-6', title: 'Introducing the LoR referral program', audience: 'All students', status: 'draft', author: 'Jordan Lee', publishedAt: '—', views: 0 },
  { id: 'ann-7', title: 'Reviewer onboarding webinar', audience: 'Reviewers', status: 'published', author: 'Rita Reviewer', publishedAt: '2026-07-20', views: 288 },
  { id: 'ann-8', title: 'Step 2 CK preparation resources', audience: 'All students', status: 'draft', author: 'Alex Admin', publishedAt: '—', views: 0 },
]

export type CmsStatus = 'published' | 'draft'

export interface CmsPage {
  id: string
  title: string
  slug: string
  status: CmsStatus
  updatedAt: string
  author: string
}

export const cmsPages: CmsPage[] = [
  { id: 'cms-1', title: 'Home page', slug: '/', status: 'published', updatedAt: '2026-08-03', author: 'Alex Admin' },
  { id: 'cms-2', title: 'How it works', slug: '/how-it-works', status: 'published', updatedAt: '2026-07-28', author: 'Alex Admin' },
  { id: 'cms-3', title: 'Partner hospitals', slug: '/hospitals', status: 'published', updatedAt: '2026-07-25', author: 'Jordan Lee' },
  { id: 'cms-4', title: 'Pricing', slug: '/pricing', status: 'published', updatedAt: '2026-07-22', author: 'Alex Admin' },
  { id: 'cms-5', title: 'For medical students', slug: '/students', status: 'draft', updatedAt: '2026-08-02', author: 'Jordan Lee' },
  { id: 'cms-6', title: 'FAQ', slug: '/faq', status: 'published', updatedAt: '2026-07-18', author: 'Alex Admin' },
  { id: 'cms-7', title: 'Success stories', slug: '/stories', status: 'draft', updatedAt: '2026-08-04', author: 'Jordan Lee' },
  { id: 'cms-8', title: 'About us', slug: '/about', status: 'published', updatedAt: '2026-07-15', author: 'Alex Admin' },
]

export type AuditSeverity = 'info' | 'warn' | 'critical'

export interface AuditLog {
  id: string
  actor: string
  action: string
  resource: string
  severity: AuditSeverity
  ip: string
  time: string
}

export const auditLogs: AuditLog[] = [
  { id: 'aud-1', actor: 'Super Administrator', action: 'Created admin', resource: 'Jordan Lee', severity: 'warn', ip: '203.0.113.12', time: '2026-08-06 09:12' },
  { id: 'aud-2', actor: 'Rita Reviewer', action: 'Verified document', resource: 'USMLE Step 1 — Maya Iyer', severity: 'info', ip: '198.51.100.4', time: '2026-08-06 08:44' },
  { id: 'aud-3', actor: 'Alex Admin', action: 'Updated fee structure', resource: 'Program settings', severity: 'warn', ip: '192.0.2.90', time: '2026-08-06 08:02' },
  { id: 'aud-4', actor: 'System', action: 'Payment processed', resource: 'PAY-4409', severity: 'info', ip: '—', time: '2026-08-05 21:15' },
  { id: 'aud-5', actor: 'Super Administrator', action: 'Suspended account', resource: 'Ahmed Hassan', severity: 'critical', ip: '203.0.113.12', time: '2026-08-05 17:31' },
  { id: 'aud-6', actor: 'Dr. Alan Cross', action: 'Changed application status', resource: 'AP-1038 → additional_info', severity: 'info', ip: '198.51.100.23', time: '2026-08-05 16:20' },
  { id: 'aud-7', actor: 'Alex Admin', action: 'Published announcement', resource: 'Winter rotation windows', severity: 'info', ip: '192.0.2.90', time: '2026-08-05 14:05' },
  { id: 'aud-8', actor: 'System', action: 'Failed login attempts', resource: 'account: student@imgprep.com', severity: 'warn', ip: '203.0.113.77', time: '2026-08-05 12:48' },
  { id: 'aud-9', actor: 'Super Administrator', action: 'Updated role permissions', resource: 'REVIEWER', severity: 'critical', ip: '203.0.113.12', time: '2026-08-05 10:33' },
  { id: 'aud-10', actor: 'Dr. Maria Gomez', action: 'Committed review', resource: 'AP-1027', severity: 'info', ip: '198.51.100.41', time: '2026-08-05 09:56' },
  { id: 'aud-11', actor: 'Alex Admin', action: 'Invited hospital', resource: 'Northside Medical Center', severity: 'info', ip: '192.0.2.90', time: '2026-08-05 09:01' },
  { id: 'aud-12', actor: 'System', action: 'Backup completed', resource: 'PostgreSQL cluster', severity: 'info', ip: '—', time: '2026-08-05 02:00' },
  { id: 'aud-13', actor: 'Dr. Nia Johnson', action: 'Rejected document', resource: 'CV / Resume — Liam O’Connor', severity: 'warn', ip: '198.51.100.67', time: '2026-08-04 18:22' },
  { id: 'aud-14', actor: 'Super Administrator', action: 'Changed platform settings', resource: 'security.session_timeout', severity: 'warn', ip: '203.0.113.12', time: '2026-08-04 15:40' },
]

export type SupportPriority = 'low' | 'medium' | 'high' | 'urgent'
export type SupportStatus = 'open' | 'in-progress' | 'resolved'

export interface SupportTicket {
  id: string
  subject: string
  from: string
  role: RoleId
  priority: SupportPriority
  status: SupportStatus
  updatedAt: string
}

export const supportTickets: SupportTicket[] = [
  { id: 'TK-208', subject: 'Cannot upload transcript — file too large', from: 'Aarav Patel', role: 'STUDENT', priority: 'high', status: 'in-progress', updatedAt: '2026-08-06' },
  { id: 'TK-207', subject: 'Payment charged twice for AP-1036', from: 'Maya Iyer', role: 'STUDENT', priority: 'urgent', status: 'open', updatedAt: '2026-08-06' },
  { id: 'TK-206', subject: 'Hospital profile verification status', from: 'Northside Medical Center', role: 'HOSPITAL', priority: 'medium', status: 'open', updatedAt: '2026-08-05' },
  { id: 'TK-205', subject: 'Review queue assignment mismatch', from: 'Dr. Sarah Kim', role: 'REVIEWER', priority: 'high', status: 'in-progress', updatedAt: '2026-08-05' },
  { id: 'TK-204', subject: 'Certificate not issued after completion', from: 'Fatima Khan', role: 'STUDENT', priority: 'medium', status: 'in-progress', updatedAt: '2026-08-04' },
  { id: 'TK-203', subject: 'Requesting partner portal access', from: 'St. Mary’s Medical Center', role: 'HOSPITAL', priority: 'low', status: 'resolved', updatedAt: '2026-08-03' },
  { id: 'TK-202', subject: 'Evaluation form missing student', from: 'Dr. Priya Nair', role: 'DOCTOR', priority: 'high', status: 'resolved', updatedAt: '2026-08-02' },
  { id: 'TK-201', subject: 'Account locked after password reset', from: 'Diego Ramírez', role: 'STUDENT', priority: 'urgent', status: 'resolved', updatedAt: '2026-08-01' },
  { id: 'TK-200', subject: 'Program fee update request', from: 'UCLA Health', role: 'HOSPITAL', priority: 'medium', status: 'open', updatedAt: '2026-07-31' },
  { id: 'TK-199', subject: 'Application status not updating', from: 'Chiamaka Okafor', role: 'STUDENT', priority: 'low', status: 'resolved', updatedAt: '2026-07-30' },
]

export interface RoleSummary {
  id: RoleId
  name: string
  members: number
  description: string
  updatedAt: string
}

export const roleSummaries: RoleSummary[] = [
  { id: 'SUPER_ADMIN', name: 'Super Admin', members: 2, description: 'Full platform control — users, roles, settings, payments, and content.', updatedAt: '2026-08-01' },
  { id: 'ADMIN', name: 'Admin', members: 6, description: 'Manages users, hospitals, doctors, reviewers, applications, and analytics.', updatedAt: '2026-08-02' },
  { id: 'REVIEWER', name: 'Reviewer', members: 14, description: 'Reviews assigned applications, verifies documents, and makes approval decisions.', updatedAt: '2026-08-03' },
  { id: 'HOSPITAL', name: 'Hospital', members: 96, description: 'Manages its profile and elective programs, accepts applications, and views assigned students.', updatedAt: '2026-08-04' },
  { id: 'DOCTOR', name: 'Doctor / Mentor', members: 312, description: 'Views assigned students, submits evaluations, issues certificates, and recommends LoRs.', updatedAt: '2026-08-04' },
  { id: 'STUDENT', name: 'Student', members: 4286, description: 'Browses electives, applies, uploads documents, and tracks applications.', updatedAt: '2026-08-05' },
]

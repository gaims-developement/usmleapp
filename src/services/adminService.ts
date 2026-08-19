import { Activity } from 'lucide-react'
import type {
  AdminActivityItem,
  AdminAnalytics,
  AdminKpi,
  UptimeService,
} from '@/mocks/admin/dashboard'
import type {
  AdminUser,
  DoctorRecord,
  HospitalRecord,
  ReviewerRecord,
} from '@/mocks/admin/people'
import type {
  AdminApplication,
  DocRecord,
  DocVerificationStatus,
  PaymentRecord,
  ProgramRecord,
  ProgramStatus,
} from '@/mocks/admin/operations'
import type {
  Announcement,
  AnnouncementStatus,
  AuditLog,
  CmsPage,
  RoleSummary,
  SupportTicket,
  SupportStatus,
} from '@/mocks/admin/content'
import type {
  AdminNotification,
  NotificationTone,
  OpsKpi,
  ReportDefinition,
} from '@/mocks/admin/ops'
import { reportCatalog as mockReportCatalog } from '@/mocks/admin/ops'
import type { AdminStudent } from '@/mocks/admin/students'
import type { PlatformSettings } from '@/mocks/admin/settings'
import { apiGet, apiPatch, apiPost, apiDelete } from '@/lib/apiClient'

export async function fetchAdminKpis(): Promise<AdminKpi[]> {
  const res = await apiGet<AdminKpi[]>('/admin/kpis')
  return res
}

export async function fetchAdminAnalytics(): Promise<AdminAnalytics> {
  const res = await apiGet<AdminAnalytics>('/admin/analytics')
  return res
}

export async function fetchPlatformUptime(): Promise<UptimeService[]> {
  const res = await apiGet<UptimeService[]>('/admin/uptime')
  return res
}

export async function fetchRecentActivity(): Promise<AdminActivityItem[]> {
  const res = await apiGet<any[]>('/admin/activity')
  return res.map(item => ({
    id: item.id || `act-${Math.random()}`,
    icon: Activity,
    title: item.title || `${item.user || 'Candidate'} — ${item.action || 'Activity'}`,
    detail: item.detail || item.target || '',
    time: item.time || (item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently'),
    iconClassName: 'bg-brand-50 text-brand-600',
  }))
}

export async function fetchAdminApplications(): Promise<AdminApplication[]> {
  const res = await apiGet<AdminApplication[]>('/applications')
  return res
}

export async function fetchRecentApplications(): Promise<AdminApplication[]> {
  const all = await fetchAdminApplications()
  return all.slice(0, 6)
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const res = await apiGet<any[]>('/users/all')
  return res.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    org: 'Platform',
    country: 'United States',
    joinedAt: u.createdAt,
    applications: 0,
  }))
}

export async function fetchAdminHospitals(): Promise<HospitalRecord[]> {
  const res = await apiGet<any[]>('/users/hospitals')
  return res.map(h => ({
    id: h.id,
    name: h.organizationName || h.name,
    city: h.city || '',
    state: h.state || '',
    tier: 'standard',
    programs: h.programs ?? 0,
    doctors: h.doctors ?? 0,
    students: h.students ?? 0,
    rating: 4.5,
    status: h.status,
    joinedAt: '2026-08-01',
    email: h.email,
    phone: '+1 (555) 010-0000',
  }))
}

export async function fetchAdminDoctors(): Promise<DoctorRecord[]> {
  const res = await apiGet<DoctorRecord[]>('/users/doctors')
  return res
}

export async function fetchAdminReviewers(): Promise<ReviewerRecord[]> {
  const res = await apiGet<any[]>('/users/reviewers')
  return res.map(r => ({
    id: r.id,
    name: r.name,
    assigned: 0,
    completed: 0,
    pending: 0,
    completedToday: 0,
    avgReviewTime: '1.2 days',
    availability: 'High',
    accuracy: 98,
    status: 'active',
    joinedAt: '2026-08-01',
  }))
}

export async function fetchAdminPrograms(): Promise<ProgramRecord[]> {
  const res = await apiGet<any[]>('/programs')
  return res.map(p => ({
    id: p.id,
    title: p.title || `${p.specialty} Elective`,
    specialty: p.specialty,
    hospital: p.hospital,
    city: p.city,
    duration: Array.isArray(p.durationWeeks) ? `${p.durationWeeks.join(', ')} weeks` : '4 weeks',
    fee: p.fee,
    filled: p.filled ?? 0,
    capacity: p.spots ?? 10,
    status: p.status === 'ACTIVE' ? 'published' : 'draft',
    startDate: p.startDates?.[0] ?? '2026-09-01',
  }))
}

export interface StudentDocumentItem {
  id: string
  name: string
  category: string
  status: string
  fileName: string
  mimeType?: string | null
  fileSize?: number | null
  storageProvider?: string | null
  storagePath?: string | null
  uploadedAt: string
  note?: string
  version?: number
  rejectedAt?: string | null
}

export interface StudentDocumentGroup {
  studentId: string
  name: string
  email: string
  college: string
  graduationYear?: number | null
  applicationsCount: number
  totalDocs: number
  verifiedDocs: number
  pendingDocs: number
  rejectedDocs: number
  overallStatus: 'No Documents' | 'Pending Review' | 'Partially Verified' | 'Complete' | 'Action Required'
  lastUpload: string
  documents: StudentDocumentItem[]
}

export async function fetchAdminDocuments(): Promise<DocRecord[]> {
  const res = await apiGet<DocRecord[]>('/admin/documents')
  return res
}

export async function fetchStudentDocumentsGrouped(): Promise<StudentDocumentGroup[]> {
  const res = await apiGet<StudentDocumentGroup[]>('/admin/documents/students')
  return res
}

export async function fetchDocument(id: string): Promise<DocRecord | null> {
  const docs = await fetchAdminDocuments()
  return docs.find(d => d.id === id) ?? null
}

export async function setDocStatus(id: string, status: DocVerificationStatus, note?: string): Promise<DocRecord[]> {
  await apiPatch(`/admin/documents/${id}/status`, { status, note })
  return fetchAdminDocuments()
}

export async function fetchAdminPayments(): Promise<PaymentRecord[]> {
  const res = await apiGet<PaymentRecord[]>('/payments')
  return res
}

export async function fetchAnnouncements(): Promise<Announcement[]> {
  const res = await apiGet<Announcement[]>('/admin/announcements')
  return res
}

export async function fetchCmsPages(): Promise<CmsPage[]> {
  return [
    { id: 'home', title: 'Home Page', slug: '/', status: 'published', updatedAt: '2026-08-01', author: 'System' },
    { id: 'about', title: 'About Us', slug: '/about', status: 'published', updatedAt: '2026-08-01', author: 'System' },
  ]
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const res = await apiGet<AuditLog[]>('/admin/audit-logs')
  return res
}

export async function fetchSupportTickets(): Promise<SupportTicket[]> {
  const res = await apiGet<SupportTicket[]>('/admin/support-tickets')
  return res
}

export async function fetchRoleSummaries(): Promise<RoleSummary[]> {
  return [
    { id: 'SUPER_ADMIN', name: 'Super Admin', members: 1, description: 'Full system access and management', updatedAt: '2026-08-01' },
    { id: 'ADMIN', name: 'Admin', members: 1, description: 'Administrative ops access', updatedAt: '2026-08-01' },
    { id: 'STUDENT', name: 'Student', members: 0, description: 'Elective applicants', updatedAt: '2026-08-01' },
    { id: 'HOSPITAL', name: 'Hospital', members: 0, description: 'Partner hospital accounts', updatedAt: '2026-08-01' },
    { id: 'DOCTOR', name: 'Doctor', members: 0, description: 'Attending physicians', updatedAt: '2026-08-01' },
    { id: 'REVIEWER', name: 'Reviewer', members: 0, description: 'Application reviewers', updatedAt: '2026-08-01' },
  ]
}

export async function fetchPlatformSettings(): Promise<PlatformSettings> {
  const res = await apiGet<PlatformSettings>('/admin/settings')
  return res
}

export async function fetchAdminStudents(): Promise<AdminStudent[]> {
  const res = await apiGet<AdminStudent[]>('/users/students')
  return res
}

export async function fetchOpsKpis(): Promise<OpsKpi[]> {
  const res = await apiGet<OpsKpi[]>('/admin/ops-kpis')
  return res
}

export async function fetchNotifications(): Promise<AdminNotification[]> {
  const res = await apiGet<AdminNotification[]>('/notifications')
  return res
}

export async function fetchReportCatalog(): Promise<ReportDefinition[]> {
  return mockReportCatalog.map(r => ({ ...r }))
}

export interface AssignReviewerInput {
  applicationId: string
  reviewer: string
}

export async function assignReviewer(input: AssignReviewerInput): Promise<AdminApplication> {
  const res = await apiPatch<AdminApplication>(`/applications/${input.applicationId}/assign-reviewer`, {
    reviewer: input.reviewer,
  })
  return res
}

export interface ForwardApplicationInput {
  applicationId: string
  reviewer: string
  note: string
}

export async function forwardApplication(input: ForwardApplicationInput): Promise<AdminApplication> {
  const res = await apiPatch<AdminApplication>(`/applications/${input.applicationId}/forward`, input)
  return res
}

export async function toggleFlagApplication(applicationId: string): Promise<AdminApplication> {
  const res = await apiPatch<AdminApplication>(`/applications/${applicationId}/flag`, {})
  return res
}

export interface NewHospitalInput {
  name: string
  city: string
  state: string
}

export async function createHospital(input: NewHospitalInput): Promise<HospitalRecord> {
  const res = await apiPost<HospitalRecord>('/hospitals', input)
  return res
}

export async function setHospitalStatus(
  hospitalId: string,
  status: HospitalRecord['status'],
): Promise<HospitalRecord> {
  const res = await apiPatch<HospitalRecord>(`/hospitals/${hospitalId}/status`, { status })
  return res
}

export async function removeHospital(hospitalId: string): Promise<{ removed: boolean }> {
  await apiDelete(`/hospitals/${hospitalId}`)
  return { removed: true }
}

export interface NewProgramInput {
  title: string
  specialty: string
  hospital: string
  city: string
  duration: string
  fee: number
  capacity: number
  startDate: string
}

export async function createProgram(input: NewProgramInput): Promise<ProgramRecord> {
  const res = await apiPost<ProgramRecord>('/programs', input)
  return res
}

export async function setProgramStatus(
  programId: string,
  status: ProgramStatus,
): Promise<ProgramRecord> {
  const res = await apiPatch<ProgramRecord>(`/programs/${programId}/status`, { status })
  return res
}

export interface NewAnnouncementInput {
  title: string
  body: string
  audience: string
  status: AnnouncementStatus
  publishedAt: string
}

export interface SendAnnouncementInput {
  type: 'announcement' | 'notification'
  title: string
  body: string
  audience: string[] | 'ALL'
  priority: 'normal' | 'important' | 'urgent'
}

export interface SendAnnouncementResult {
  id: string | null
  title: string
  body: string
  audience: string
  status: AnnouncementStatus
  author: string
  publishedAt: string | null
  views: number
  notificationsCreated: number
}

export async function sendAnnouncement(input: SendAnnouncementInput): Promise<SendAnnouncementResult> {
  const res = await apiPost<SendAnnouncementResult>('/admin/announcements', input)
  return res
}

export async function createAnnouncement(input: NewAnnouncementInput): Promise<Announcement> {
  const res = await apiPost<Announcement>('/admin/announcements', input)
  return res
}

export async function updateAnnouncement(
  announcementId: string,
  input: Partial<NewAnnouncementInput>,
): Promise<Announcement> {
  const res = await apiPatch<Announcement>(`/admin/announcements/${announcementId}`, input)
  return res
}

export async function deleteAnnouncement(announcementId: string): Promise<void> {
  await apiDelete(`/admin/announcements/${announcementId}`)
}

export async function setTicketStatus(ticketId: string, status: SupportStatus): Promise<SupportTicket> {
  const res = await apiPatch<SupportTicket>(`/admin/support-tickets/${ticketId}`, { status })
  return res
}

export interface NewTicketInput {
  subject: string
  from: string
  role: SupportTicket['role']
  priority: SupportTicket['priority']
}

export async function createTicket(input: NewTicketInput): Promise<SupportTicket> {
  const res = await apiPost<SupportTicket>('/admin/support-tickets', input)
  return res
}

export async function markAllNotificationsRead(): Promise<AdminNotification[]> {
  const res = await apiPatch<AdminNotification[]>('/notifications/read-all', {})
  return res
}

export interface NewDoctorInput {
  name: string
  specialty: string
  hospital: string
}

export async function createDoctor(input: NewDoctorInput): Promise<DoctorRecord> {
  const res = await apiPost<DoctorRecord>('/users/doctors', input)
  return res
}

export type { NotificationTone }

import {
  adminAnalytics,
  adminKpis,
  platformUptime,
  recentActivity,
  type AdminActivityItem,
  type AdminAnalytics,
  type AdminKpi,
  type UptimeService,
} from '@/mocks/admin/dashboard'
import {
  adminDoctors,
  adminHospitals,
  adminReviewers,
  adminUsers,
  type AdminUser,
  type DoctorRecord,
  type HospitalRecord,
  type ReviewerRecord,
} from '@/mocks/admin/people'
import {
  adminApplications,
  adminDocuments,
  adminPayments,
  adminPrograms,
  type AdminApplication,
  type DocRecord,
  type PaymentRecord,
  type ProgramRecord,
  type ProgramStatus,
} from '@/mocks/admin/operations'
import {
  adminAnnouncements,
  auditLogs,
  cmsPages,
  roleSummaries,
  supportTickets,
  type Announcement,
  type AnnouncementStatus,
  type AuditLog,
  type CmsPage,
  type RoleSummary,
  type SupportTicket,
  type SupportStatus,
} from '@/mocks/admin/content'
import {
  adminNotifications,
  adminOpsKpis,
  reportCatalog,
  type AdminNotification,
  type NotificationTone,
  type OpsKpi,
  type ReportDefinition,
} from '@/mocks/admin/ops'
import { adminStudents, type AdminStudent } from '@/mocks/admin/students'
import { platformSettings, type PlatformSettings } from '@/mocks/admin/settings'

const latency = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

let applications: AdminApplication[] = [...adminApplications]
let announcements: Announcement[] = [...adminAnnouncements]
let tickets: SupportTicket[] = [...supportTickets]
let hospitals: HospitalRecord[] = [...adminHospitals]
let programs: ProgramRecord[] = [...adminPrograms]
let notifications: AdminNotification[] = [...adminNotifications]

const today = () => new Date().toISOString().slice(0, 10)

export async function fetchAdminKpis(): Promise<AdminKpi[]> {
  await latency(200)
  return [...adminKpis]
}

export async function fetchAdminAnalytics(): Promise<AdminAnalytics> {
  await latency(350)
  return adminAnalytics
}

export async function fetchPlatformUptime(): Promise<UptimeService[]> {
  await latency(200)
  return [...platformUptime]
}

export async function fetchRecentActivity(): Promise<AdminActivityItem[]> {
  await latency(250)
  return recentActivity.map(item => ({ ...item }))
}

export async function fetchAdminApplications(): Promise<AdminApplication[]> {
  await latency(300)
  return [...applications].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
}

export async function fetchRecentApplications(): Promise<AdminApplication[]> {
  const all = await fetchAdminApplications()
  return all.slice(0, 6)
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  await latency(300)
  return [...adminUsers]
}

export async function fetchAdminHospitals(): Promise<HospitalRecord[]> {
  await latency(300)
  return [...hospitals]
}

export async function fetchAdminDoctors(): Promise<DoctorRecord[]> {
  await latency(300)
  return [...adminDoctors]
}

export async function fetchAdminReviewers(): Promise<ReviewerRecord[]> {
  await latency(300)
  return [...adminReviewers]
}

export async function fetchAdminPrograms(): Promise<ProgramRecord[]> {
  await latency(300)
  return [...programs]
}

export async function fetchAdminDocuments(): Promise<DocRecord[]> {
  await latency(300)
  return [...adminDocuments]
}

export async function fetchAdminPayments(): Promise<PaymentRecord[]> {
  await latency(300)
  return [...adminPayments]
}

export async function fetchAnnouncements(): Promise<Announcement[]> {
  await latency(300)
  return [...announcements]
}

export async function fetchCmsPages(): Promise<CmsPage[]> {
  await latency(300)
  return [...cmsPages]
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  await latency(300)
  return [...auditLogs]
}

export async function fetchSupportTickets(): Promise<SupportTicket[]> {
  await latency(300)
  return [...tickets]
}

export async function fetchRoleSummaries(): Promise<RoleSummary[]> {
  await latency(300)
  return [...roleSummaries]
}

export async function fetchPlatformSettings(): Promise<PlatformSettings> {
  await latency(300)
  return platformSettings
}

export async function fetchAdminStudents(): Promise<AdminStudent[]> {
  await latency(300)
  return [...adminStudents]
}

export async function fetchOpsKpis(): Promise<OpsKpi[]> {
  await latency(250)
  return adminOpsKpis.map(kpi => ({ ...kpi }))
}

export async function fetchNotifications(): Promise<AdminNotification[]> {
  await latency(200)
  return notifications.map(n => ({ ...n }))
}

export async function fetchReportCatalog(): Promise<ReportDefinition[]> {
  await latency(200)
  return reportCatalog.map(r => ({ ...r }))
}

export interface AssignReviewerInput {
  applicationId: string
  reviewer: string
}

export async function assignReviewer(input: AssignReviewerInput): Promise<AdminApplication> {
  await latency(350)
  const app = applications.find(a => a.id === input.applicationId)
  if (!app) throw new Error(`Application ${input.applicationId} not found`)
  app.reviewer = input.reviewer
  if (app.status === 'submitted') app.status = 'under_review'
  notifications.unshift({
    id: `ntf-${Date.now()}`,
    tone: 'info',
    title: 'Reviewer assigned',
    body: `${input.applicationId} assigned to ${input.reviewer}.`,
    time: 'just now',
    read: false,
  })
  return { ...app }
}

export interface ForwardApplicationInput {
  applicationId: string
  reviewer: string
  note: string
}

export async function forwardApplication(input: ForwardApplicationInput): Promise<AdminApplication> {
  await latency(400)
  const app = applications.find(a => a.id === input.applicationId)
  if (!app) throw new Error(`Application ${input.applicationId} not found`)
  app.reviewer = input.reviewer
  notifications.unshift({
    id: `ntf-${Date.now()}`,
    tone: 'info',
    title: 'Application forwarded',
    body: `${input.applicationId} forwarded to ${input.reviewer}.`,
    time: 'just now',
    read: false,
  })
  return { ...app }
}

export async function toggleFlagApplication(applicationId: string): Promise<AdminApplication> {
  await latency(250)
  const app = applications.find(a => a.id === applicationId)
  if (!app) throw new Error(`Application ${applicationId} not found`)
  app.flagged = !app.flagged
  return { ...app }
}

export interface NewHospitalInput {
  name: string
  city: string
  state: string
}

export async function createHospital(input: NewHospitalInput): Promise<HospitalRecord> {
  await latency(400)
  const record: HospitalRecord = {
    id: `h-${Date.now()}`,
    name: input.name,
    city: input.city,
    state: input.state,
    tier: 'standard',
    programs: 0,
    doctors: 0,
    students: 0,
    rating: 0,
    status: 'onboarding',
    joinedAt: today(),
    email: `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, '')}@hospital.org`,
    phone: '+1 (555) 010-0000',
  }
  hospitals.unshift(record)
  return { ...record }
}

export async function setHospitalStatus(
  hospitalId: string,
  status: HospitalRecord['status'],
): Promise<HospitalRecord> {
  await latency(300)
  const hospital = hospitals.find(h => h.id === hospitalId)
  if (!hospital) throw new Error(`Hospital ${hospitalId} not found`)
  hospital.status = status
  return { ...hospital }
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
  await latency(400)
  const record: ProgramRecord = {
    id: `prg-${Date.now()}`,
    title: input.title,
    specialty: input.specialty,
    hospital: input.hospital,
    city: input.city,
    duration: input.duration,
    fee: input.fee,
    filled: 0,
    capacity: input.capacity,
    status: 'draft',
    startDate: input.startDate,
  }
  programs.unshift(record)
  return { ...record }
}

export async function setProgramStatus(
  programId: string,
  status: ProgramStatus,
): Promise<ProgramRecord> {
  await latency(300)
  const program = programs.find(p => p.id === programId)
  if (!program) throw new Error(`Program ${programId} not found`)
  program.status = status
  return { ...program }
}

export interface NewAnnouncementInput {
  title: string
  audience: string
  status: AnnouncementStatus
  publishedAt: string
}

export async function createAnnouncement(input: NewAnnouncementInput): Promise<Announcement> {
  await latency(400)
  const record: Announcement = {
    id: `ann-${Date.now()}`,
    title: input.title,
    audience: input.audience,
    status: input.status,
    author: 'Alex Admin',
    publishedAt: input.publishedAt,
    views: 0,
  }
  announcements.unshift(record)
  return { ...record }
}

export async function updateAnnouncement(
  announcementId: string,
  input: Partial<NewAnnouncementInput>,
): Promise<Announcement> {
  await latency(350)
  const item = announcements.find(a => a.id === announcementId)
  if (!item) throw new Error(`Announcement ${announcementId} not found`)
  if (input.title !== undefined) item.title = input.title
  if (input.audience !== undefined) item.audience = input.audience
  if (input.status !== undefined) item.status = input.status
  if (input.publishedAt !== undefined) item.publishedAt = input.publishedAt
  return { ...item }
}

export async function deleteAnnouncement(announcementId: string): Promise<void> {
  await latency(300)
  announcements = announcements.filter(a => a.id !== announcementId)
}

export async function setTicketStatus(ticketId: string, status: SupportStatus): Promise<SupportTicket> {
  await latency(300)
  const ticket = tickets.find(t => t.id === ticketId)
  if (!ticket) throw new Error(`Ticket ${ticketId} not found`)
  ticket.status = status
  ticket.updatedAt = today()
  return { ...ticket }
}

export interface NewTicketInput {
  subject: string
  from: string
  role: SupportTicket['role']
  priority: SupportTicket['priority']
}

export async function createTicket(input: NewTicketInput): Promise<SupportTicket> {
  await latency(400)
  const record: SupportTicket = {
    id: `TK-${Math.floor(200 + Math.random() * 400)}`,
    subject: input.subject,
    from: input.from,
    role: input.role,
    priority: input.priority,
    status: 'open',
    updatedAt: today(),
  }
  tickets.unshift(record)
  return { ...record }
}

export async function markAllNotificationsRead(): Promise<AdminNotification[]> {
  await latency(200)
  notifications = notifications.map(n => ({ ...n, read: true }))
  return notifications.map(n => ({ ...n }))
}

export interface NewDoctorInput {
  name: string
  specialty: string
  hospital: string
}

export async function createDoctor(input: NewDoctorInput): Promise<DoctorRecord> {
  await latency(400)
  const record: DoctorRecord = {
    id: `d-${Date.now()}`,
    name: input.name,
    specialty: input.specialty,
    hospital: input.hospital,
    students: 0,
    evaluations: 0,
    rating: 0,
    status: 'active',
    joinedAt: today(),
  }
  adminDoctors.unshift(record)
  return { ...record }
}

export type { NotificationTone }

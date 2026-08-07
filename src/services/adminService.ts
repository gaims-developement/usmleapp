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
  adminUsers,
  type AdminUser,
  type DoctorRecord,
  type HospitalRecord,
  type ReviewerRecord,
} from '@/mocks/admin/people'
import {
  adminApplications,
  adminDocuments,
  adminPrograms,
  type AdminApplication,
  type DocRecord,
  type DocVerificationStatus,
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
import { type AdminStudent } from '@/mocks/admin/students'
import { platformSettings, type PlatformSettings } from '@/mocks/admin/settings'
import { addStudentNotification } from '@/services/studentService'
import { apiGet, apiPatch } from '@/lib/apiClient'

const latency = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

const today = () => new Date().toISOString().slice(0, 10)

// Helper to access localStorage statefully
function getStoredState<T>(key: string, fallback: T): T {
  const data = localStorage.getItem(key)
  if (!data) {
    localStorage.setItem(key, JSON.stringify(fallback))
    return fallback
  }
  return JSON.parse(data)
}

function setStoredState<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

const getApplications = () => getStoredState('usmle_admin_applications', adminApplications)
const setApplications = (val: AdminApplication[]) => setStoredState('usmle_admin_applications', val)

const getAnnouncements = () => getStoredState('usmle_admin_announcements', adminAnnouncements)
const setAnnouncements = (val: Announcement[]) => setStoredState('usmle_admin_announcements', val)

const getTickets = () => getStoredState('usmle_admin_tickets', supportTickets)
const setTickets = (val: SupportTicket[]) => setStoredState('usmle_admin_tickets', val)

const getHospitals = () => getStoredState('usmle_admin_hospitals', adminHospitals)
const setHospitals = (val: HospitalRecord[]) => setStoredState('usmle_admin_hospitals', val)

const getPrograms = () => getStoredState('usmle_admin_programs', adminPrograms)
const setPrograms = (val: ProgramRecord[]) => setStoredState('usmle_admin_programs', val)

const getNotifications = () => getStoredState('usmle_admin_notifications', adminNotifications)
const setNotifications = (val: AdminNotification[]) => setStoredState('usmle_admin_notifications', val)

const getDocuments = () => getStoredState('usmle_admin_documents', adminDocuments)
const setDocuments = (val: DocRecord[]) => setStoredState('usmle_admin_documents', val)

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
  const res = await apiGet<AdminApplication[]>('/applications')
  return res
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
  const res = await apiGet<any[]>('/users/hospitals')
  return res.map(h => ({
    id: h.id,
    name: h.organizationName,
    city: h.city,
    state: h.state,
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
  await latency(300)
  return [...adminDoctors]
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
  await latency(300)
  return [...getPrograms()]
}

export async function fetchAdminDocuments(): Promise<DocRecord[]> {
  await latency(300)
  return [...getDocuments()]
}

export async function fetchDocument(id: string): Promise<DocRecord | null> {
  await latency(250)
  return getDocuments().find(d => d.id === id) ?? null
}

export async function setDocStatus(id: string, status: DocVerificationStatus): Promise<DocRecord[]> {
  await latency(400)
  const docs = getDocuments()
  const target = docs.find(d => d.id === id)
  if (!target) return [...docs]
  const updatedDocs = docs.map(d => (d.id === id ? { ...d, status } : d))
  setDocuments(updatedDocs)

  const firstName = target.owner.split(' ')[0]
  if (status === 'verified') {
    addStudentNotification(
      'Document approved ✅',
      `Hey ${firstName}, your ${target.document.toLowerCase()} has been verified. You're all set!`,
    )
  } else if (status === 'rejected') {
    addStudentNotification(
      'Document needs attention ⚠️',
      `Hi ${firstName}, your ${target.document.toLowerCase()} couldn't be verified. Please re-upload a clearer copy.`,
    )
  }
  return updatedDocs
}

export async function fetchAdminPayments(): Promise<PaymentRecord[]> {
  const res = await apiGet<PaymentRecord[]>('/payments')
  return res
}

export async function fetchAnnouncements(): Promise<Announcement[]> {
  await latency(300)
  return [...getAnnouncements()]
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
  return [...getTickets()]
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
  const res = await apiGet<AdminStudent[]>('/users/students')
  return res
}

export async function fetchOpsKpis(): Promise<OpsKpi[]> {
  await latency(250)
  return adminOpsKpis.map(kpi => ({ ...kpi }))
}

export async function fetchNotifications(): Promise<AdminNotification[]> {
  await latency(200)
  return getNotifications().map(n => ({ ...n }))
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
  await latency(400)
  const apps = getApplications()
  const app = apps.find(a => a.id === input.applicationId)
  if (!app) throw new Error(`Application ${input.applicationId} not found`)
  app.reviewer = input.reviewer
  
  setApplications(apps.map(a => a.id === input.applicationId ? app : a))

  const notifs = getNotifications()
  notifs.unshift({
    id: `ntf-${Date.now()}`,
    tone: 'info',
    title: 'Application forwarded',
    body: `${input.applicationId} forwarded to ${input.reviewer}.`,
    time: 'just now',
    read: false,
  })
  setNotifications(notifs)

  return { ...app }
}

export async function toggleFlagApplication(applicationId: string): Promise<AdminApplication> {
  await latency(250)
  const apps = getApplications()
  const app = apps.find(a => a.id === applicationId)
  if (!app) throw new Error(`Application ${applicationId} not found`)
  app.flagged = !app.flagged
  
  setApplications(apps.map(a => a.id === applicationId ? app : a))
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
  
  const hList = getHospitals()
  hList.unshift(record)
  setHospitals(hList)

  return { ...record }
}

export async function setHospitalStatus(
  hospitalId: string,
  status: HospitalRecord['status'],
): Promise<HospitalRecord> {
  await latency(300)
  const hList = getHospitals()
  const hospital = hList.find(h => h.id === hospitalId)
  if (!hospital) throw new Error(`Hospital ${hospitalId} not found`)
  hospital.status = status
  setHospitals(hList)
  return { ...hospital }
}

export async function removeHospital(hospitalId: string): Promise<{ removed: boolean }> {
  await latency(300)
  const hList = getHospitals()
  const index = hList.findIndex(h => h.id === hospitalId)
  if (index === -1) throw new Error(`Hospital ${hospitalId} not found`)
  hList.splice(index, 1)
  setHospitals(hList)
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
  const pList = getPrograms()
  pList.unshift(record)
  setPrograms(pList)
  return { ...record }
}

export async function setProgramStatus(
  programId: string,
  status: ProgramStatus,
): Promise<ProgramRecord> {
  await latency(300)
  const pList = getPrograms()
  const program = pList.find(p => p.id === programId)
  if (!program) throw new Error(`Program ${programId} not found`)
  program.status = status
  setPrograms(pList)
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
  const aList = getAnnouncements()
  aList.unshift(record)
  setAnnouncements(aList)
  return { ...record }
}

export async function updateAnnouncement(
  announcementId: string,
  input: Partial<NewAnnouncementInput>,
): Promise<Announcement> {
  await latency(350)
  const aList = getAnnouncements()
  const item = aList.find(a => a.id === announcementId)
  if (!item) throw new Error(`Announcement ${announcementId} not found`)
  if (input.title !== undefined) item.title = input.title
  if (input.audience !== undefined) item.audience = input.audience
  if (input.status !== undefined) item.status = input.status
  if (input.publishedAt !== undefined) item.publishedAt = input.publishedAt
  setAnnouncements(aList)
  return { ...item }
}

export async function deleteAnnouncement(announcementId: string): Promise<void> {
  await latency(300)
  const filtered = getAnnouncements().filter(a => a.id !== announcementId)
  setAnnouncements(filtered)
}

export async function setTicketStatus(ticketId: string, status: SupportStatus): Promise<SupportTicket> {
  await latency(300)
  const tList = getTickets()
  const ticket = tList.find(t => t.id === ticketId)
  if (!ticket) throw new Error(`Ticket ${ticketId} not found`)
  ticket.status = status
  ticket.updatedAt = today()
  setTickets(tList)
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
  const tList = getTickets()
  tList.unshift(record)
  setTickets(tList)
  return { ...record }
}

export async function markAllNotificationsRead(): Promise<AdminNotification[]> {
  await latency(200)
  const updated = getNotifications().map(n => ({ ...n, read: true }))
  setNotifications(updated)
  return updated
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

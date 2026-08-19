import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/apiClient'
import type { HospitalDoctor } from '@/mocks/hospital/doctors'
import type { HospitalProgram } from '@/mocks/hospital/programs'
import type { HospitalStudent } from '@/mocks/hospital/students'
import type { HospitalProfile } from '@/mocks/hospital/profile'
import type { HospitalNotification } from '@/mocks/hospital/notifications'
import type { HospitalAnnouncement } from '@/mocks/hospital/announcements'
import type { HospitalCalendarEvent } from '@/mocks/hospital/calendar'

export type HospitalDecision = 'awaiting_decision' | 'accepted' | 'rejected' | 'waitlisted' | 'scheduled' | 'completed'

export interface HospitalDoctorInput {
  name: string
  specialty: string
  department?: string
  email?: string
  phone?: string
  availability?: any
}

export interface HospitalProgramInput {
  name: string
  specialty: string
  department: string
  duration: string
  fee: number
  status: any
  seats?: number
  deadline?: string
  description?: string
  eligibility?: string
}

export interface HospitalAnnouncementInput {
  title: string
  body: string
  status: any
  audience?: any
}

export interface HospitalApplicationCore {
  id: string
  studentId: string
  programId: string
  status: HospitalDecision
  appliedAt: string
  reviewedBy?: string
  usmleProgress?: string
  clinicalExperience?: string
  researchExperience?: string
  languages?: string[]
  doctorId?: string
  rotationStart?: string
  rotationEnd?: string
  decisionNote?: string
  internalNotes?: string
}

export interface HospitalApplicationJoined extends HospitalApplicationCore {
  student: HospitalStudent
  program: {
    id: string
    name: string
    department: string
    specialty: string
    duration: string
    fee: number
  }
  doctor?: HospitalDoctor
  reviewedBy: string
  usmleProgress: string
  clinicalExperience: string
  researchExperience: string
  languages: string[]
  rotationStart?: string
  rotationEnd?: string
}

export interface HospitalRegistrationCodeRecord {
  code: string
  isActive: boolean
  usedCount: number
  expiresAt: string | null
  createdAt: string
}

export interface OrganizationDepartment {
  id: string
  name: string
  doctorCount: number
  createdAt: string
}

export interface HospitalOrganization {
  profile: {
    id: string
    name: string | null
    city: string | null
    state: string | null
    country: string | null
    address: string | null
    website: string | null
    email: string | null
    phone: string | null
    description: string | null
    coordinatorName: string | null
    coordinatorEmail: string | null
    coordinatorPhone: string | null
    tier: string | null
    status: string | null
  }
  activeCode: HospitalRegistrationCodeRecord | null
  departments: OrganizationDepartment[]
  doctors: {
    id: string
    userId: string
    name: string
    email: string
    specialty: string | null
    title: string | null
    departmentId: string | null
    departmentName: string | null
    status: string | null
  }[]
}

const STATUS_RANK: Record<string, number> = {
  awaiting_decision: 0,
  accepted: 1,
  waitlisted: 2,
  scheduled: 3,
  completed: 4,
  rejected: 5,
}

export async function fetchHospitalApplications(): Promise<HospitalApplicationJoined[]> {
  const res = await apiGet<HospitalApplicationJoined[]>('/hospitals/me/applications')
  return res.sort((a, b) => {
    const rA = STATUS_RANK[a.status] ?? 0
    const rB = STATUS_RANK[b.status] ?? 0
    if (rA !== rB) return rA - rB
    return b.appliedAt.localeCompare(a.appliedAt)
  })
}

export async function fetchHospitalApplication(applicationId: string): Promise<HospitalApplicationJoined> {
  return apiGet<HospitalApplicationJoined>(`/hospitals/me/applications/${applicationId}`)
}

export async function fetchHospitalPrograms(): Promise<HospitalProgram[]> {
  return apiGet<HospitalProgram[]>('/hospitals/me/programs')
}

export async function fetchHospitalProgram(programId: string): Promise<HospitalProgram> {
  if (!programId) throw new Error('Program id is required')
  const program = await apiGet<HospitalProgram>(`/hospitals/me/programs/${programId}`)
  if (Array.isArray(program)) {
    throw new Error('Expected a single program, received a list')
  }
  return program
}

export async function decideApplication(
  applicationId: string,
  decision: string,
  decisionNote?: string,
): Promise<HospitalApplicationJoined> {
  return apiPatch<HospitalApplicationJoined>(`/hospitals/me/applications/${applicationId}/decide`, {
    decision,
    decisionNote,
  })
}

export async function assignDoctor(applicationId: string, doctorId: string): Promise<HospitalApplicationJoined> {
  return apiPatch<HospitalApplicationJoined>(`/hospitals/me/applications/${applicationId}/schedule`, {
    doctorId,
  })
}

export async function fetchHospitalProfile(): Promise<HospitalProfile> {
  return apiGet<HospitalProfile>('/hospitals/me')
}

export async function fetchHospitalOrganization(): Promise<HospitalOrganization> {
  return apiGet<HospitalOrganization>('/hospitals/me/organization')
}

export async function createHospitalDepartment(name: string): Promise<OrganizationDepartment> {
  return apiPost<OrganizationDepartment>('/hospitals/me/departments', { name })
}

export async function deleteHospitalDepartment(
  id: string,
): Promise<{ deleted: boolean; id: string }> {
  return apiDelete<{ deleted: boolean; id: string }>(`/hospitals/me/departments/${id}`)
}

export async function regenerateHospitalCode(): Promise<HospitalRegistrationCodeRecord> {
  return apiPost<HospitalRegistrationCodeRecord>('/hospitals/me/code/regenerate')
}

export async function fetchHospitalNotifications(): Promise<HospitalNotification[]> {
  const data = await apiGet<BackendNotification[]>('/notifications')
  return data.map(mapNotification)
}

export async function fetchHospitalAnnouncements(): Promise<HospitalAnnouncement[]> {
  return apiGet<HospitalAnnouncement[]>('/hospitals/me/announcements')
}

export async function fetchHospitalCalendarEvents(): Promise<HospitalCalendarEvent[]> {
  return apiGet<HospitalCalendarEvent[]>('/hospitals/me/calendar-events')
}

export async function fetchHospitalStudents(): Promise<HospitalStudent[]> {
  return apiGet<HospitalStudent[]>('/hospitals/me/students')
}

export async function fetchHospitalDoctors(): Promise<HospitalDoctor[]> {
  return apiGet<HospitalDoctor[]>('/hospitals/me/doctors')
}

export async function createHospitalDoctor(input: HospitalDoctorInput): Promise<HospitalDoctor> {
  return apiPost<HospitalDoctor>('/hospitals/me/doctors', input)
}

export async function createHospitalProgram(input: HospitalProgramInput): Promise<HospitalProgram> {
  return apiPost<HospitalProgram>('/hospitals/me/programs', input)
}

export async function updateHospitalProgram(
  programId: string,
  patch: Partial<HospitalProgramInput>,
): Promise<HospitalProgram> {
  return apiPatch<HospitalProgram>(`/hospitals/me/programs/${programId}`, patch)
}

export async function setProgramStatus(programId: string, status: any): Promise<HospitalProgram> {
  return apiPatch<HospitalProgram>(`/hospitals/me/programs/${programId}/status`, { status })
}

export async function scheduleApplication(
  applicationId: string,
  doctorId: string,
  start: string,
  end: string,
): Promise<HospitalApplicationJoined> {
  return apiPatch<HospitalApplicationJoined>(`/hospitals/me/applications/${applicationId}/schedule`, {
    doctorId,
    start,
    end,
  })
}

export async function updateInternalNotes(
  applicationId: string,
  notes: string,
): Promise<HospitalApplicationJoined> {
  return apiPatch<HospitalApplicationJoined>(`/hospitals/me/applications/${applicationId}/notes`, {
    notes,
  })
}

export async function createHospitalAnnouncement(
  input: HospitalAnnouncementInput,
): Promise<HospitalAnnouncement> {
  return apiPost<HospitalAnnouncement>('/hospitals/me/announcements', input)
}

export async function updateHospitalAnnouncement(
  announcementId: string,
  patch: Partial<HospitalAnnouncementInput>,
): Promise<HospitalAnnouncement> {
  return apiPatch<HospitalAnnouncement>(`/hospitals/me/announcements/${announcementId}`, patch)
}

export async function deleteHospitalAnnouncement(announcementId: string): Promise<void> {
  await apiDelete<void>(`/hospitals/me/announcements/${announcementId}`)
}

export async function markAllHospitalNotificationsRead(): Promise<HospitalNotification[]> {
  await apiPost<void>('/notifications/read-all')
  return fetchHospitalNotifications()
}

export interface HospitalPendingMember {
  id: string
  userId: string
  name: string
  email: string
  specialty?: string | null
  registeredAt: string
  status: string
}

export async function fetchPendingDoctors(): Promise<HospitalPendingMember[]> {
  return apiGet<HospitalPendingMember[]>('/hospitals/me/pending-doctors')
}

export async function fetchPendingReviewers(): Promise<HospitalPendingMember[]> {
  return apiGet<HospitalPendingMember[]>('/hospitals/me/pending-reviewers')
}

export async function approveMember(memberId: string, role: 'DOCTOR' | 'REVIEWER'): Promise<void> {
  const slug = role === 'DOCTOR' ? 'doctors' : 'reviewers'
  await apiPatch(`/hospitals/me/${slug}/${memberId}/approve`)
}

export async function rejectMember(memberId: string, role: 'DOCTOR' | 'REVIEWER', reason?: string): Promise<void> {
  const slug = role === 'DOCTOR' ? 'doctors' : 'reviewers'
  await apiPatch(`/hospitals/me/${slug}/${memberId}/reject`, { reason })
}

interface BackendNotification {
  id: string
  tone: string
  title: string
  body: string
  read: boolean
  applicationId?: string | null
  time: string
  createdAt?: string | null
}

function mapNotification(n: BackendNotification): HospitalNotification {
  const type = n.applicationId
    ? 'application'
    : n.tone === 'success'
      ? 'scheduled'
      : n.tone === 'warning'
        ? 'program'
        : n.tone === 'info'
          ? 'announcement'
          : 'system'
  return {
    id: n.id,
    type: type as HospitalNotification['type'],
    title: n.title,
    message: n.body,
    time: n.time,
    read: n.read,
    createdAt: n.createdAt ?? null,
  }
}

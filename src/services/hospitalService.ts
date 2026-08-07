import { apiGet, apiPatch } from '@/lib/apiClient'
import { hospitalDoctors, type HospitalDoctor } from '@/mocks/hospital/doctors'
import { hospitalPrograms, type HospitalProgram } from '@/mocks/hospital/programs'
import { hospitalStudents, type HospitalStudent } from '@/mocks/hospital/students'
import { hospitalProfile, type HospitalProfile } from '@/mocks/hospital/profile'
import { hospitalNotifications, type HospitalNotification } from '@/mocks/hospital/notifications'
import { hospitalAnnouncements, type HospitalAnnouncement } from '@/mocks/hospital/announcements'
import { hospitalCalendarEvents, type HospitalCalendarEvent } from '@/mocks/hospital/calendar'

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

let programs: HospitalProgram[] = [...hospitalPrograms]
let announcements: HospitalAnnouncement[] = [...hospitalAnnouncements]
let notifications: HospitalNotification[] = [...hospitalNotifications]
let doctors: HospitalDoctor[] = [...hospitalDoctors]

const studentOf = (id: string): HospitalStudent => {
  const match = hospitalStudents.find(s => s.id === id)
  if (match) return match
  return {
    id,
    name: 'Student',
    country: 'United States',
    medicalSchool: 'Medical University',
    graduationYear: 2027,
  }
}

const programOf = (id: string) => programs.find(p => p.id === id)
const doctorOf = (id?: string) => (id ? doctors.find(d => d.id === id) : undefined)

function joined(a: HospitalApplicationCore): HospitalApplicationJoined {
  return {
    ...a,
    reviewedBy: a.reviewedBy ?? 'Dr. Nia Johnson',
    usmleProgress: a.usmleProgress ?? 'Step 1 passed (252)',
    clinicalExperience: a.clinicalExperience ?? '6 weeks — Internal Medicine clerkship',
    researchExperience: a.researchExperience ?? 'Case report',
    languages: a.languages ?? ['English', 'Hindi'],
    rotationStart: a.rotationStart,
    rotationEnd: a.rotationEnd,
    student: studentOf(a.studentId),
    program: (() => {
      const p = programOf(a.programId)
      return p
        ? { id: p.id, name: p.name, department: p.department, specialty: p.specialty, duration: p.duration, fee: p.fee }
        : { id: a.programId, name: 'Rotation Program', department: 'Medicine', specialty: 'General', duration: '4 weeks', fee: 1000 }
    })(),
    doctor: doctorOf(a.doctorId),
  }
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
  const res = await apiGet<HospitalApplicationCore[]>('/applications')
  return res.map(joined).sort((a, b) => {
    const rA = STATUS_RANK[a.status] ?? 0
    const rB = STATUS_RANK[b.status] ?? 0
    if (rA !== rB) return rA - rB
    return b.appliedAt.localeCompare(a.appliedAt)
  })
}

export async function fetchHospitalApplication(applicationId: string): Promise<HospitalApplicationJoined> {
  const res = await apiGet<HospitalApplicationCore[]>('/applications')
  const app = res.find(a => a.id === applicationId)
  if (!app) throw new Error(`Application ${applicationId} not found`)
  return joined(app)
}

export async function fetchHospitalPrograms(): Promise<HospitalProgram[]> {
  return programs
}

export async function fetchHospitalProgram(programId: string): Promise<HospitalProgram> {
  const p = programs.find(pr => pr.id === programId)
  if (!p) throw new Error(`Program ${programId} not found`)
  return p
}

export async function decideApplication(
  applicationId: string,
  decision: string,
  decisionNote?: string,
): Promise<HospitalApplicationJoined> {
  const res = await apiPatch<HospitalApplicationCore>(`/applications/${applicationId}/decide`, {
    decision,
    decisionNote,
  })
  return joined(res)
}

export async function assignDoctor(applicationId: string, doctorId: string): Promise<HospitalApplicationJoined> {
  const res = await apiPatch<HospitalApplicationCore>(`/applications/${applicationId}/decide`, {
    doctorId,
  })
  return joined(res)
}

export async function fetchHospitalProfile(): Promise<HospitalProfile> {
  return hospitalProfile
}

export async function fetchHospitalNotifications(): Promise<HospitalNotification[]> {
  return notifications
}

export async function fetchHospitalAnnouncements(): Promise<HospitalAnnouncement[]> {
  return announcements
}

export async function fetchHospitalCalendarEvents(): Promise<HospitalCalendarEvent[]> {
  return hospitalCalendarEvents
}

export async function fetchHospitalStudents(): Promise<HospitalStudent[]> {
  return hospitalStudents
}

export async function fetchHospitalDoctors(): Promise<HospitalDoctor[]> {
  return doctors
}

export async function createHospitalDoctor(input: HospitalDoctorInput): Promise<HospitalDoctor> {
  const record: HospitalDoctor = {
    id: `doc-${Date.now()}`,
    name: input.name,
    specialty: input.specialty,
    department: input.department ?? 'Internal Medicine',
    email: input.email ?? 'doctor@stmarys.org',
    phone: input.phone ?? '+1 (415) 668-1000',
    availability: input.availability ?? 'High',
    status: 'active',
    studentsAssigned: 0,
    currentRotations: 0,
    joinedAt: new Date().toISOString().slice(0, 10),
  }
  doctors.push(record)
  return record
}

export async function createHospitalProgram(input: HospitalProgramInput): Promise<HospitalProgram> {
  const record: HospitalProgram = {
    id: `PRG-${Date.now()}`,
    name: input.name,
    specialty: input.specialty,
    department: input.department,
    duration: input.duration,
    fee: input.fee,
    status: input.status,
    seats: input.seats ?? 5,
    filled: 0,
    deadline: input.deadline ?? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    description: input.description ?? '',
    eligibility: input.eligibility ?? '',
    requiredDocuments: [],
    availableDates: [],
    faculty: [],
    createdAt: new Date().toISOString().slice(0, 10),
  }
  programs.push(record)
  return record
}

export async function updateHospitalProgram(
  programId: string,
  patch: Partial<HospitalProgramInput>,
): Promise<HospitalProgram> {
  const idx = programs.findIndex(p => p.id === programId)
  if (idx !== -1) {
    programs[idx] = { ...programs[idx], ...patch } as HospitalProgram
    return programs[idx]
  }
  throw new Error('Program not found')
}

export async function setProgramStatus(programId: string, status: any): Promise<HospitalProgram> {
  const idx = programs.findIndex(p => p.id === programId)
  if (idx !== -1) {
    programs[idx].status = status
    return programs[idx]
  }
  throw new Error('Program not found')
}

export async function scheduleApplication(
  applicationId: string,
  doctorId: string,
  start: string,
  end: string,
): Promise<HospitalApplicationJoined> {
  const res = await apiPatch<HospitalApplicationCore>(`/applications/${applicationId}/decide`, {
    decision: 'scheduled',
    doctorId,
    rotationStart: start,
    rotationEnd: end,
  })
  return joined(res)
}

export async function updateInternalNotes(
  applicationId: string,
  notes: string,
): Promise<HospitalApplicationJoined> {
  const res = await apiPatch<HospitalApplicationCore>(`/applications/${applicationId}/decide`, {
    internalNotes: notes,
  })
  return joined(res)
}

export async function createHospitalAnnouncement(
  input: HospitalAnnouncementInput,
): Promise<HospitalAnnouncement> {
  const record: HospitalAnnouncement = {
    id: `ann-${Date.now()}`,
    title: input.title,
    body: input.body,
    status: input.status,
    audience: input.audience ?? 'All Students',
    author: 'Alex Admin',
    publishedAt: new Date().toISOString().slice(0, 10),
  }
  announcements.push(record)
  return record
}

export async function updateHospitalAnnouncement(
  announcementId: string,
  patch: Partial<HospitalAnnouncementInput>,
): Promise<HospitalAnnouncement> {
  const idx = announcements.findIndex(a => a.id === announcementId)
  if (idx !== -1) {
    announcements[idx] = { ...announcements[idx], ...patch } as HospitalAnnouncement
    return announcements[idx]
  }
  throw new Error('Announcement not found')
}

export async function deleteHospitalAnnouncement(announcementId: string): Promise<void> {
  announcements = announcements.filter(a => a.id !== announcementId)
}

export async function markAllHospitalNotificationsRead(): Promise<HospitalNotification[]> {
  notifications = notifications.map(n => ({ ...n, read: true }))
  return notifications
}

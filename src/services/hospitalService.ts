import { hospitalApplications, type HospitalApplicationCore, type HospitalAppStatus } from '@/mocks/hospital/applications'
import { hospitalDoctors, type HospitalDoctor } from '@/mocks/hospital/doctors'
import { hospitalPrograms, type HospitalProgram, type ProgramStatus } from '@/mocks/hospital/programs'
import { hospitalStudents, type HospitalStudent } from '@/mocks/hospital/students'
import { hospitalProfile, type HospitalProfile } from '@/mocks/hospital/profile'
import { hospitalNotifications, type HospitalNotification } from '@/mocks/hospital/notifications'
import { hospitalAnnouncements, type HospitalAnnouncement, type AnnouncementStatus } from '@/mocks/hospital/announcements'
import { hospitalCalendarEvents, type HospitalCalendarEvent } from '@/mocks/hospital/calendar'

const latency = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

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
}

let apps: HospitalApplicationCore[] = hospitalApplications.map(a => ({ ...a, languages: [...a.languages] }))
let programs: HospitalProgram[] = hospitalPrograms.map(p => ({ ...p, requiredDocuments: [...p.requiredDocuments], availableDates: [...p.availableDates], faculty: [...p.faculty] }))
let announcements: HospitalAnnouncement[] = hospitalAnnouncements.map(a => ({ ...a }))
let notifications: HospitalNotification[] = hospitalNotifications.map(n => ({ ...n }))
let doctors: HospitalDoctor[] = hospitalDoctors.map(d => ({ ...d }))

const today = () => new Date().toISOString().slice(0, 10)

const studentOf = (id: string) => hospitalStudents.find(s => s.id === id)
const programOf = (id: string) => programs.find(p => p.id === id)
const doctorOf = (id?: string) => (id ? doctors.find(d => d.id === id) : undefined)

function joined(a: HospitalApplicationCore): HospitalApplicationJoined {
  return {
    ...a,
    languages: [...a.languages],
    student: studentOf(a.studentId)!,
    program: (() => {
      const p = programOf(a.programId)
      return p
        ? { id: p.id, name: p.name, department: p.department, specialty: p.specialty, duration: p.duration, fee: p.fee }
        : { id: a.programId, name: a.programId, department: '—', specialty: '—', duration: '—', fee: 0 }
    })(),
    doctor: doctorOf(a.doctorId),
  }
}

const STATUS_RANK: Record<HospitalAppStatus, number> = {
  awaiting_decision: 0,
  accepted: 1,
  waitlisted: 2,
  scheduled: 3,
  completed: 4,
  rejected: 5,
}

export async function fetchHospitalApplications(): Promise<HospitalApplicationJoined[]> {
  await latency(300)
  return apps.map(joined).sort((a, b) => {
    if (STATUS_RANK[a.status] !== STATUS_RANK[b.status]) return STATUS_RANK[a.status] - STATUS_RANK[b.status]
    return b.appliedAt.localeCompare(a.appliedAt)
  })
}

export async function fetchHospitalApplication(applicationId: string): Promise<HospitalApplicationJoined> {
  await latency(250)
  const app = apps.find(a => a.id === applicationId)
  if (!app) throw new Error(`Application ${applicationId} not found`)
  return joined(app)
}

export async function fetchHospitalPrograms(): Promise<HospitalProgram[]> {
  await latency(300)
  return programs.map(p => ({ ...p }))
}

export async function fetchHospitalProgram(programId: string): Promise<HospitalProgram> {
  await latency(250)
  const p = programs.find(pr => pr.id === programId)
  if (!p) throw new Error(`Program ${programId} not found`)
  return { ...p }
}

export async function fetchHospitalDoctors(): Promise<HospitalDoctor[]> {
  await latency(250)
  return doctors.map(d => ({ ...d }))
}

export interface HospitalDoctorInput {
  name: string
  department: string
  specialty: string
  email: string
  phone: string
  availability: HospitalDoctor['availability']
}

export async function createHospitalDoctor(input: HospitalDoctorInput): Promise<HospitalDoctor> {
  await latency(400)
  const nextId = `doc-${doctors.length + 1}`
  const doctor: HospitalDoctor = {
    id: nextId,
    ...input,
    status: 'active',
    studentsAssigned: 0,
    currentRotations: 0,
    joinedAt: today(),
  }
  doctors.unshift(doctor)
  return { ...doctor }
}

export async function fetchHospitalStudents(): Promise<HospitalStudent[]> {
  await latency(250)
  return hospitalStudents.map(s => ({ ...s }))
}

export async function fetchHospitalProfile(): Promise<HospitalProfile> {
  await latency(200)
  return { ...hospitalProfile, accreditation: [...hospitalProfile.accreditation] }
}

export async function fetchHospitalNotifications(): Promise<HospitalNotification[]> {
  await latency(200)
  return notifications.map(n => ({ ...n }))
}

export async function markAllHospitalNotificationsRead(): Promise<HospitalNotification[]> {
  await latency(200)
  notifications = notifications.map(n => ({ ...n, read: true }))
  return notifications.map(n => ({ ...n }))
}

export async function fetchHospitalAnnouncements(): Promise<HospitalAnnouncement[]> {
  await latency(250)
  return announcements.map(a => ({ ...a }))
}

export async function fetchHospitalCalendarEvents(): Promise<HospitalCalendarEvent[]> {
  await latency(250)
  return hospitalCalendarEvents.map(e => ({ ...e }))
}

export type HospitalDecision = 'accepted' | 'rejected' | 'waitlisted'

export async function decideApplication(
  applicationId: string,
  decision: HospitalDecision,
  decisionNote: string,
): Promise<HospitalApplicationJoined> {
  await latency(450)
  const app = apps.find(a => a.id === applicationId)
  if (!app) throw new Error(`Application ${applicationId} not found`)
  app.status = decision
  app.decisionNote = decisionNote || undefined
  return joined(app)
}

export async function scheduleApplication(
  applicationId: string,
  doctorId: string,
  rotationStart: string,
  rotationEnd: string,
): Promise<HospitalApplicationJoined> {
  await latency(450)
  const app = apps.find(a => a.id === applicationId)
  if (!app) throw new Error(`Application ${applicationId} not found`)
  app.status = 'scheduled'
  app.doctorId = doctorId
  app.rotationStart = rotationStart
  app.rotationEnd = rotationEnd
  return joined(app)
}

export async function updateInternalNotes(applicationId: string, notes: string): Promise<HospitalApplicationJoined> {
  await latency(300)
  const app = apps.find(a => a.id === applicationId)
  if (!app) throw new Error(`Application ${applicationId} not found`)
  app.internalNotes = notes
  return joined(app)
}

export interface HospitalProgramInput {
  name: string
  department: string
  specialty: string
  duration: string
  fee: number
  seats: number
  deadline: string
  description: string
  eligibility: string
  status: ProgramStatus
}

export async function createHospitalProgram(input: HospitalProgramInput): Promise<HospitalProgram> {
  await latency(450)
  const nextId = `PRG-${213 + programs.length}`
  const program: HospitalProgram = {
    id: nextId,
    ...input,
    filled: 0,
    requiredDocuments: ['Passport', 'Curriculum Vitae', 'Transcript'],
    availableDates: [],
    faculty: [],
    createdAt: today(),
  }
  programs.unshift(program)
  return { ...program }
}

export async function updateHospitalProgram(programId: string, patch: Partial<HospitalProgramInput>): Promise<HospitalProgram> {
  await latency(350)
  const p = programs.find(pr => pr.id === programId)
  if (!p) throw new Error(`Program ${programId} not found`)
  Object.assign(p, patch)
  return { ...p }
}

export async function setProgramStatus(programId: string, status: ProgramStatus): Promise<HospitalProgram> {
  await latency(300)
  const p = programs.find(pr => pr.id === programId)
  if (!p) throw new Error(`Program ${programId} not found`)
  p.status = status
  return { ...p }
}

export interface HospitalAnnouncementInput {
  title: string
  body: string
  audience: HospitalAnnouncement['audience']
  status: AnnouncementStatus
}

export async function createHospitalAnnouncement(input: HospitalAnnouncementInput): Promise<HospitalAnnouncement> {
  await latency(400)
  const announcement: HospitalAnnouncement = {
    id: `HANN-${announcements.length + 6}`,
    ...input,
    author: hospitalProfile.coordinator.name,
    publishedAt: input.status === 'published' ? today() : '',
  }
  announcements.unshift(announcement)
  return { ...announcement }
}

export async function updateHospitalAnnouncement(
  announcementId: string,
  patch: Partial<HospitalAnnouncementInput>,
): Promise<HospitalAnnouncement> {
  await latency(350)
  const ann = announcements.find(a => a.id === announcementId)
  if (!ann) throw new Error(`Announcement ${announcementId} not found`)
  Object.assign(ann, patch)
  return { ...ann }
}

export async function deleteHospitalAnnouncement(announcementId: string): Promise<void> {
  await latency(300)
  announcements = announcements.filter(a => a.id !== announcementId)
}

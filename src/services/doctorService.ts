import { apiGet, apiPatch, apiPost } from '@/lib/apiClient'
import { sessionService } from '@/services/sessionService'
import {
  attendancePercentage,
  buildAttendance,
  buildProgress,
  doctorStudentById,
  doctorStudents,
  type AttendanceRecord,
  type DoctorStudent,
  type ProgressItem,
} from '@/mocks/doctor/students'
import { logbookEntries, type LogbookEntry, type LogbookStatus } from '@/mocks/doctor/logbook'
import {
  doctorEvaluations,
  type Evaluation,
  type EvaluationScores,
  type FinalRecommendation,
} from '@/mocks/doctor/evaluations'
import {
  doctorCertificates,
  type Certificate,
  type CertificateStatus,
} from '@/mocks/doctor/certificates'
import {
  doctorLetters,
  type LetterOfRecommendation,
  type LorStatus,
} from '@/mocks/doctor/letters'
import {
  todaySchedule,
  upcomingRotationStarts,
  type ScheduleItem,
} from '@/mocks/doctor/schedule'
import {
  doctorConversations,
  doctorMessageTemplates,
  type DoctorConversation,
  type DoctorMessage,
} from '@/mocks/doctor/messages'
import { doctorProfile, type DoctorProfile } from '@/mocks/doctor/profile'
import { doctorNotifications, type DoctorNotification } from '@/mocks/doctor/notifications'

const latency = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Demo accounts keep the mock experience; real (isDemo=false) doctors read
 * their own live data from the backend.
 */
function isDemoUser(): boolean {
  return sessionService.get()?.user?.isDemo === true
}

export interface DoctorStudentDetail extends DoctorStudent {
  attendance: AttendanceRecord[]
  attendancePercentage: number
  progress: ProgressItem[]
}

export interface LogbookEntryJoined extends LogbookEntry {
  student: { id: string; name: string; country: string }
}

export interface EvaluationJoined extends Evaluation {
  student: { id: string; name: string; country: string }
}

export interface CertificateJoined extends Certificate {
  student: { id: string; name: string; country: string }
}

export interface LetterJoined extends LetterOfRecommendation {
  student: { id: string; name: string; country: string }
}

export interface UpcomingRotationStart {
  student: DoctorStudent
  date: string
}

// ---------------------------------------------------------------------------
// Demo path (mock data)
// ---------------------------------------------------------------------------

let logbook: LogbookEntry[] = logbookEntries.map(e => ({ ...e }))
let evaluations: Evaluation[] = doctorEvaluations.map(e => ({ ...e, scores: { ...e.scores } }))
let certificates: Certificate[] = doctorCertificates.map(c => ({ ...c }))
let letters: LetterOfRecommendation[] = doctorLetters.map(l => ({ ...l }))
let conversations: DoctorConversation[] = doctorConversations.map(c => ({
  ...c,
  messages: c.messages.map(m => ({ ...m })),
}))
let notifications: DoctorNotification[] = doctorNotifications.map(n => ({ ...n }))

const studentOf = (id: string): DoctorStudent | undefined => {
  let s = doctorStudents.find(s => s.id === id)
  if (!s) {
    const storedStdsRaw = localStorage.getItem('usmle_admin_students')
    const stds = storedStdsRaw ? JSON.parse(storedStdsRaw) : []
    const match = stds.find((st: any) => st.id === id)
    if (match) {
      s = {
        id: match.id,
        name: match.name,
        country: match.country,
        medicalSchool: match.school,
        graduationYear: 2027,
        usmleProgress: match.step1 !== '—' ? `Step 1 passed (${match.step1})` : 'Not taken',
        researchExperience: 'None',
        clinicalExperience: 'None',
        department: 'Internal Medicine',
        rotationStart: '2026-10-05',
        rotationEnd: '2026-11-27',
        progressCount: 0,
      }
    }
  }
  return s
}

function joinedStudent(id: string) {
  const s = studentOf(id)
  return { id, name: s?.name ?? 'Unknown', country: s?.country ?? '—' }
}

async function mockFetchDoctorStudents(): Promise<DoctorStudent[]> {
  await latency(300)
  const storedStdsRaw = localStorage.getItem('usmle_admin_students')
  const extraStds: DoctorStudent[] = []
  if (storedStdsRaw) {
    const stds = JSON.parse(storedStdsRaw)
    for (const match of stds) {
      if (!doctorStudents.some(s => s.id === match.id) && !doctorStudents.some(s => s.name === match.name)) {
        extraStds.push({
          id: match.id,
          name: match.name,
          country: match.country,
          medicalSchool: match.school,
          graduationYear: 2027,
          usmleProgress: match.step1 !== '—' ? `Step 1 passed (${match.step1})` : 'Not taken',
          researchExperience: 'None',
          clinicalExperience: 'None',
          department: 'Internal Medicine',
          rotationStart: '2026-10-05',
          rotationEnd: '2026-11-27',
          progressCount: 0,
        })
      }
    }
  }
  return [...doctorStudents, ...extraStds]
}

async function mockFetchDoctorStudentDetail(studentId: string): Promise<DoctorStudentDetail> {
  await latency(250)
  const student = studentOf(studentId)
  if (!student) throw new Error(`Student ${studentId} not found`)
  const index = Math.max(0, doctorStudents.findIndex(s => s.id === studentId))
  const attendance = buildAttendance(index, 8)
  return {
    ...student,
    attendance,
    attendancePercentage: attendancePercentage(attendance),
    progress: buildProgress(student.progressCount),
  }
}

async function mockFetchDoctorProfile(): Promise<DoctorProfile> {
  await latency(200)
  return { ...doctorProfile }
}

async function mockFetchTodaySchedule(): Promise<ScheduleItem[]> {
  await latency(200)
  return todaySchedule.map(s => ({ ...s, studentIds: s.studentIds ? [...s.studentIds] : undefined }))
}

async function mockFetchUpcomingRotationStarts(): Promise<UpcomingRotationStart[]> {
  await latency(200)
  return upcomingRotationStarts
    .map(u => ({ student: studentOf(u.studentId)!, date: u.date }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

async function mockFetchLogbookEntries(): Promise<LogbookEntryJoined[]> {
  await latency(300)
  return logbook
    .map(entry => ({ ...entry, student: joinedStudent(entry.studentId) }))
    .sort((a, b) => b.date.localeCompare(a.date))
}

async function mockSetLogbookStatus(entryId: string, status: LogbookStatus, comments?: string): Promise<LogbookEntryJoined> {
  await latency(300)
  const entry = logbook.find(e => e.id === entryId)
  if (!entry) throw new Error(`Entry ${entryId} not found`)
  entry.status = status
  entry.comments = comments ?? ''
  return { ...entry, student: joinedStudent(entry.studentId) }
}

async function mockFetchEvaluations(): Promise<EvaluationJoined[]> {
  await latency(300)
  return evaluations
    .map(e => ({ ...e, scores: { ...e.scores }, student: joinedStudent(e.studentId) }))
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'draft' ? -1 : 1
      return (a.submittedAt ?? '').localeCompare(b.submittedAt ?? '')
    })
}

async function mockSaveEvaluation(evaluationId: string, draft: EvaluationDraft): Promise<EvaluationJoined> {
  await latency(350)
  const evalItem = evaluations.find(e => e.id === evaluationId)
  if (!evalItem) throw new Error(`Evaluation ${evaluationId} not found`)
  Object.assign(evalItem, draft)
  return { ...evalItem, scores: { ...evalItem.scores }, student: joinedStudent(evalItem.studentId) }
}

async function mockSubmitEvaluation(evaluationId: string, draft: EvaluationDraft): Promise<EvaluationJoined> {
  await latency(450)
  const evalItem = evaluations.find(e => e.id === evaluationId)
  if (!evalItem) throw new Error(`Evaluation ${evaluationId} not found`)
  Object.assign(evalItem, draft)
  evalItem.status = 'completed'
  evalItem.submittedAt = new Date().toISOString().slice(0, 10)
  return { ...evalItem, scores: { ...evalItem.scores }, student: joinedStudent(evalItem.studentId) }
}

async function mockFetchCertificates(): Promise<CertificateJoined[]> {
  await latency(300)
  return certificates.map(c => ({ ...c, student: joinedStudent(c.studentId) }))
}

async function mockSetCertificateStatus(certificateId: string, status: CertificateStatus): Promise<CertificateJoined> {
  await latency(300)
  const cert = certificates.find(c => c.id === certificateId)
  if (!cert) throw new Error(`Certificate ${certificateId} not found`)
  cert.certificateStatus = status
  if (status === 'issued' && !cert.issuedAt) cert.issuedAt = new Date().toISOString().slice(0, 10)
  return { ...cert, student: joinedStudent(cert.studentId) }
}

async function mockFetchLetters(): Promise<LetterJoined[]> {
  await latency(300)
  const rank: Record<LorStatus, number> = { draft: 0, pending_review: 1, signed: 2, delivered: 3 }
  return letters
    .map(l => ({ ...l, student: joinedStudent(l.studentId) }))
    .sort((a, b) => rank[a.status] - rank[b.status] || b.updatedAt.localeCompare(a.updatedAt))
}

async function mockSaveLetter(letterId: string, draft: LetterDraft): Promise<LetterJoined> {
  await latency(350)
  const letter = letters.find(l => l.id === letterId)
  if (!letter) throw new Error(`Letter ${letterId} not found`)
  Object.assign(letter, draft, { updatedAt: new Date().toISOString().slice(0, 10) })
  return { ...letter, student: joinedStudent(letter.studentId) }
}

async function mockSetLetterStatus(letterId: string, status: LorStatus): Promise<LetterJoined> {
  await latency(300)
  const letter = letters.find(l => l.id === letterId)
  if (!letter) throw new Error(`Letter ${letterId} not found`)
  letter.status = status
  letter.updatedAt = new Date().toISOString().slice(0, 10)
  return { ...letter, student: joinedStudent(letter.studentId) }
}

async function mockFetchDoctorConversations(): Promise<DoctorConversation[]> {
  await latency(300)
  return conversations.map(c => ({ ...c, messages: c.messages.map(m => ({ ...m })) }))
}

async function mockSendDoctorMessage(
  conversationId: string,
  text: string,
  attachment?: { name: string; size: string },
): Promise<DoctorConversation> {
  await latency(300)
  const conversation = conversations.find(c => c.id === conversationId)
  if (!conversation) throw new Error(`Conversation ${conversationId} not found`)
  conversation.messages.push({ id: `m-${Date.now()}`, from: 'doctor', text, time: 'now', attachment })
  conversation.lastMessage = text
  conversation.lastTime = 'now'
  conversation.unread = 0
  return { ...conversation, messages: conversation.messages.map(m => ({ ...m })) }
}

async function mockSendDoctorMessageToStudent(
  studentId: string,
  text: string,
): Promise<DoctorConversation> {
  await latency(350)
  const student = doctorStudentById(studentId)
  if (!student) throw new Error(`Student ${studentId} not found`)
  let conversation = conversations.find(c => c.counterpartId === studentId)
  const message: DoctorMessage = { id: `m-${Date.now()}`, from: 'doctor', text, time: 'now' }
  if (conversation) {
    conversation.messages.push(message)
    conversation.lastMessage = text
    conversation.lastTime = 'now'
    conversation.unread = 0
    return { ...conversation }
  }
  conversation = {
    id: `dcon-${Date.now()}`,
    counterpartId: studentId,
    counterpartName: student.name,
    counterpartRole: 'student',
    lastMessage: text,
    lastTime: 'now',
    unread: 0,
    messages: [message],
  }
  conversations.unshift(conversation)
  return { ...conversation }
}

async function mockMarkDoctorConversationRead(conversationId: string): Promise<DoctorConversation> {
  await latency(150)
  const conversation = conversations.find(c => c.id === conversationId)
  if (!conversation) throw new Error(`Conversation ${conversationId} not found`)
  conversation.unread = 0
  return { ...conversation }
}

async function mockFetchDoctorNotifications(): Promise<DoctorNotification[]> {
  await latency(200)
  return notifications.map(n => ({ ...n }))
}

async function mockMarkAllDoctorNotificationsRead(): Promise<DoctorNotification[]> {
  await latency(200)
  notifications = notifications.map(n => ({ ...n, read: true }))
  return notifications.map(n => ({ ...n }))
}

// ---------------------------------------------------------------------------
// Real path (live backend data)
// ---------------------------------------------------------------------------

interface BackendNotification {
  id: string
  tone: 'info' | 'success' | 'warning' | 'critical'
  title: string
  body: string
  read: boolean
  time?: string
  createdAt?: string | null
}

const toneToType: Record<BackendNotification['tone'], DoctorNotification['type']> = {
  info: 'system',
  success: 'certificate',
  warning: 'logbook',
  critical: 'evaluation',
}

function mapBackendNotification(n: BackendNotification): DoctorNotification {
  return {
    id: n.id,
    type: toneToType[n.tone] ?? 'system',
    title: n.title,
    message: n.body,
    time: n.time ?? '',
    read: n.read,
    createdAt: n.createdAt ?? null,
  }
}

async function realFetchDoctorStudentDetail(studentId: string): Promise<DoctorStudentDetail> {
  const student = await apiGet<DoctorStudent>(`/doctor/students/${studentId}`)
  return {
    ...student,
    attendance: [],
    attendancePercentage: 0,
    progress: buildProgress(student.progressCount),
  }
}

async function realFetchDoctorNotifications(): Promise<DoctorNotification[]> {
  const raw = await apiGet<BackendNotification[]>('/notifications')
  return raw.map(mapBackendNotification)
}

// ---------------------------------------------------------------------------
// Exported service
// ---------------------------------------------------------------------------

export async function fetchDoctorStudents(): Promise<DoctorStudent[]> {
  if (!isDemoUser()) return apiGet<DoctorStudent[]>('/doctor/students')
  return mockFetchDoctorStudents()
}

export async function fetchDoctorStudentDetail(studentId: string): Promise<DoctorStudentDetail> {
  if (!isDemoUser()) return realFetchDoctorStudentDetail(studentId)
  return mockFetchDoctorStudentDetail(studentId)
}

export async function fetchDoctorProfile(): Promise<DoctorProfile> {
  if (!isDemoUser()) return apiGet<DoctorProfile>('/doctor/profile')
  return mockFetchDoctorProfile()
}

export async function fetchTodaySchedule(): Promise<ScheduleItem[]> {
  if (!isDemoUser()) return apiGet<ScheduleItem[]>('/doctor/schedule')
  return mockFetchTodaySchedule()
}

export async function fetchUpcomingRotationStarts(): Promise<UpcomingRotationStart[]> {
  if (!isDemoUser()) return apiGet<UpcomingRotationStart[]>('/doctor/upcoming-rotations')
  return mockFetchUpcomingRotationStarts()
}

export async function fetchLogbookEntries(): Promise<LogbookEntryJoined[]> {
  if (!isDemoUser()) return apiGet<LogbookEntryJoined[]>('/doctor/logbook')
  return mockFetchLogbookEntries()
}

export async function setLogbookStatus(entryId: string, status: LogbookStatus, comments?: string): Promise<LogbookEntryJoined> {
  if (!isDemoUser()) {
    return apiPatch<LogbookEntryJoined>(`/doctor/logbook/${entryId}`, { status, comments })
  }
  return mockSetLogbookStatus(entryId, status, comments)
}

export async function fetchEvaluations(): Promise<EvaluationJoined[]> {
  if (!isDemoUser()) return apiGet<EvaluationJoined[]>('/doctor/evaluations')
  return mockFetchEvaluations()
}

export interface EvaluationDraft {
  scores: EvaluationScores
  overallPerformance: number
  strengths: string
  areasForImprovement: string
  overallComments: string
  finalRecommendation: FinalRecommendation
}

export async function saveEvaluation(evaluationId: string, draft: EvaluationDraft): Promise<EvaluationJoined> {
  if (!isDemoUser()) {
    return apiPatch<EvaluationJoined>(`/doctor/evaluations/${evaluationId}`, { ...draft, submit: false })
  }
  return mockSaveEvaluation(evaluationId, draft)
}

export async function submitEvaluation(evaluationId: string, draft: EvaluationDraft): Promise<EvaluationJoined> {
  if (!isDemoUser()) {
    return apiPatch<EvaluationJoined>(`/doctor/evaluations/${evaluationId}`, { ...draft, submit: true })
  }
  return mockSubmitEvaluation(evaluationId, draft)
}

export async function fetchCertificates(): Promise<CertificateJoined[]> {
  if (!isDemoUser()) return apiGet<CertificateJoined[]>('/doctor/certificates')
  return mockFetchCertificates()
}

export async function setCertificateStatus(certificateId: string, status: CertificateStatus): Promise<CertificateJoined> {
  if (!isDemoUser()) {
    return apiPatch<CertificateJoined>(`/doctor/certificates/${certificateId}`, { status })
  }
  return mockSetCertificateStatus(certificateId, status)
}

export async function fetchLetters(): Promise<LetterJoined[]> {
  if (!isDemoUser()) return apiGet<LetterJoined[]>('/doctor/letters')
  return mockFetchLetters()
}

export interface LetterDraft {
  summary: string
  strengths: string
  body: string
}

export async function saveLetter(letterId: string, draft: LetterDraft): Promise<LetterJoined> {
  if (!isDemoUser()) {
    return apiPatch<LetterJoined>(`/doctor/letters/${letterId}`, draft)
  }
  return mockSaveLetter(letterId, draft)
}

export async function setLetterStatus(letterId: string, status: LorStatus): Promise<LetterJoined> {
  if (!isDemoUser()) {
    return apiPatch<LetterJoined>(`/doctor/letters/${letterId}`, { status })
  }
  return mockSetLetterStatus(letterId, status)
}

export async function fetchDoctorConversations(): Promise<DoctorConversation[]> {
  if (!isDemoUser()) return apiGet<DoctorConversation[]>('/doctor/conversations')
  return mockFetchDoctorConversations()
}

export async function fetchDoctorMessageTemplates(): Promise<{ id: string; label: string; text: string }[]> {
  return doctorMessageTemplates.map(t => ({ ...t }))
}

export async function sendDoctorMessage(
  conversationId: string,
  text: string,
  attachment?: { name: string; size: string },
): Promise<DoctorConversation> {
  if (!isDemoUser()) {
    return apiPost<DoctorConversation>('/doctor/conversations', { conversationId, text, attachment })
  }
  return mockSendDoctorMessage(conversationId, text, attachment)
}

export async function sendDoctorMessageToStudent(
  studentId: string,
  text: string,
): Promise<DoctorConversation> {
  if (!isDemoUser()) {
    return apiPost<DoctorConversation>('/doctor/conversations', { studentId, text })
  }
  return mockSendDoctorMessageToStudent(studentId, text)
}

export async function markDoctorConversationRead(conversationId: string): Promise<DoctorConversation> {
  if (!isDemoUser()) {
    return apiPatch<DoctorConversation>(`/doctor/conversations/${conversationId}/read`)
  }
  return mockMarkDoctorConversationRead(conversationId)
}

export async function fetchDoctorNotifications(): Promise<DoctorNotification[]> {
  if (!isDemoUser()) return realFetchDoctorNotifications()
  return mockFetchDoctorNotifications()
}

export async function markAllDoctorNotificationsRead(): Promise<DoctorNotification[]> {
  if (!isDemoUser()) {
    await apiPost<void>('/notifications/read-all')
    return realFetchDoctorNotifications()
  }
  return mockMarkAllDoctorNotificationsRead()
}

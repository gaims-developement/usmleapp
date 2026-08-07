import { electives, type Elective } from '@/mocks/electives'
import { applications } from '@/mocks/applications'
import { documents, type UserDocument } from '@/mocks/documents'
import type { Application, PaymentMethod } from './types'
import { sessionService } from '@/services/sessionService'
import { adminApplications, type AdminApplication } from '@/mocks/admin/operations'
import { adminStudents } from '@/mocks/admin/students'

export interface ElectiveFilters {
  search?: string
  specialty?: string
  city?: string
  duration?: number
  sort?: 'rating' | 'fee' | 'soonest'
}

export interface ApplicationInput {
  electiveId: string
  startDate: string
  durationWeeks: number
  documentsIncluded: string[]
  paymentMethod: PaymentMethod
  transactionId: string
}

export interface OnboardingData {
  graduationYear?: number
  visaStatus: string
  goals: string[]
  earliestStart: string
  durationPreference: number
  travelReady: boolean
  onboarded?: boolean
}

const latency = (ms = 350) => new Promise(resolve => setTimeout(resolve, ms))

export async function fetchElectives(filters: ElectiveFilters = {}): Promise<Elective[]> {
  await latency()
  
  // Initialize stored electives
  let stored = localStorage.getItem('usmle_electives')
  if (!stored) {
    localStorage.setItem('usmle_electives', JSON.stringify(electives))
    stored = JSON.stringify(electives)
  }
  
  let result = JSON.parse(stored)

  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (e: Elective) =>
        e.specialty.toLowerCase().includes(q) ||
        e.hospital.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q) ||
        e.state.toLowerCase().includes(q),
    )
  }
  if (filters.specialty) {
    result = result.filter((e: Elective) => e.specialty === filters.specialty)
  }
  if (filters.city) {
    result = result.filter((e: Elective) => `${e.city}, ${e.state}` === filters.city)
  }
  if (filters.duration) {
    result = result.filter((e: Elective) => e.durationWeeks.includes(filters.duration!))
  }

  switch (filters.sort) {
    case 'fee':
      result.sort((a: Elective, b: Elective) => a.fee - b.fee)
      break
    case 'soonest':
      result.sort((a: Elective, b: Elective) => a.startDates[0].localeCompare(b.startDates[0]))
      break
    case 'rating':
    default:
      result.sort((a: Elective, b: Elective) => b.rating - a.rating)
      break
  }

  return result
}

export async function fetchElectiveById(id: string): Promise<Elective | null> {
  await latency()
  const stored = localStorage.getItem('usmle_electives')
  const list = stored ? JSON.parse(stored) : electives
  return list.find((e: Elective) => e.id === id) ?? null
}

export async function fetchApplications(): Promise<Application[]> {
  await latency()
  const stored = localStorage.getItem('usmle_applications')
  if (!stored) {
    localStorage.setItem('usmle_applications', JSON.stringify(applications))
    return [...applications].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)) as unknown as Application[]
  }
  const list: Application[] = JSON.parse(stored)
  return list.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
}

export async function fetchDocuments(): Promise<UserDocument[]> {
  await latency()
  const stored = localStorage.getItem('usmle_documents')
  if (!stored) {
    localStorage.setItem('usmle_documents', JSON.stringify(documents))
    return documents.map(d => ({ ...d }))
  }
  return JSON.parse(stored)
}

export async function completeOnboarding(data: OnboardingData): Promise<{ onboarded: true }> {
  await latency(600)
  void data
  return { onboarded: true }
}

export async function mockSubmitApplication(input: ApplicationInput): Promise<Application> {
  await latency(500)
  const user = sessionService.get()?.user
  const studentName = user?.name ?? 'New Student'
  const studentEmail = user?.email ?? 'newstudent@example.com'

  const storedElectivesRaw = localStorage.getItem('usmle_electives')
  const electivesList = storedElectivesRaw ? JSON.parse(storedElectivesRaw) : electives
  const elective = electivesList.find((e: Elective) => e.id === input.electiveId)

  const newAppId = 'AP-' + Math.floor(1000 + Math.random() * 9000)
  const todayStr = new Date().toISOString().slice(0, 10)

  const newStudentApp: Application = {
    id: newAppId,
    electiveId: input.electiveId,
    specialty: elective?.specialty ?? 'Unknown Specialty',
    hospital: elective?.hospital ?? 'Unknown Hospital',
    city: elective?.city ?? 'Unknown City',
    state: elective?.state ?? 'XX',
    status: 'SUBMITTED', // matches the schema ApplicationStatus
    startDate: input.startDate,
    durationWeeks: input.durationWeeks,
    submittedAt: todayStr,
    documentsIncluded: input.documentsIncluded,
    paymentMethod: input.paymentMethod,
    timeline: [
      { label: 'Application submitted', date: todayStr, done: true },
      { label: 'Documents reviewed', date: todayStr, done: false },
      { label: 'Program review', date: todayStr, done: false },
      { label: 'Offer decision', date: todayStr, done: false },
    ],
  }

  // Save to usmle_applications
  const storedAppsRaw = localStorage.getItem('usmle_applications')
  const apps = storedAppsRaw ? JSON.parse(storedAppsRaw) : [...applications]
  apps.unshift(newStudentApp)
  localStorage.setItem('usmle_applications', JSON.stringify(apps))

  // Save to usmle_admin_applications
  const newAdminApp: AdminApplication = {
    id: newAppId,
    student: studentName,
    hospital: elective?.hospital ?? 'Unknown Hospital',
    specialty: elective?.specialty ?? 'Unknown Specialty',
    status: 'submitted',
    reviewer: 'Unassigned',
    amount: elective?.fee ?? 1000,
    submittedAt: todayStr,
    priority: 'normal',
    flagged: false,
    documentsComplete: input.documentsIncluded.length,
    documentsTotal: 6,
  }

  const storedAdminAppsRaw = localStorage.getItem('usmle_admin_applications')
  const adminApps = storedAdminAppsRaw ? JSON.parse(storedAdminAppsRaw) : [...adminApplications]
  adminApps.unshift(newAdminApp)
  localStorage.setItem('usmle_admin_applications', JSON.stringify(adminApps))

  // Also increase the application count for this student in the admin's students list!
  const storedAdminStudentsRaw = localStorage.getItem('usmle_admin_students')
  const adminStds = storedAdminStudentsRaw ? JSON.parse(storedAdminStudentsRaw) : [...adminStudents]
  const targetStdIndex = adminStds.findIndex((s: any) => s.email.toLowerCase() === studentEmail.toLowerCase())
  if (targetStdIndex !== -1) {
    adminStds[targetStdIndex].applications += 1
    localStorage.setItem('usmle_admin_students', JSON.stringify(adminStds))
  }

  return newStudentApp
}

export async function mockWithdrawApplication(id: string): Promise<Application | null> {
  await latency(300)
  const storedAppsRaw = localStorage.getItem('usmle_applications')
  const apps: Application[] = (storedAppsRaw ? JSON.parse(storedAppsRaw) : [...applications]) as any
  const target = apps.find(a => a.id === id)
  if (!target) return null
  target.status = 'withdrawn'
  localStorage.setItem('usmle_applications', JSON.stringify(apps))

  // Also update in usmle_admin_applications!
  const storedAdminAppsRaw = localStorage.getItem('usmle_admin_applications')
  if (storedAdminAppsRaw) {
    const adminApps: AdminApplication[] = JSON.parse(storedAdminAppsRaw)
    const adminTargetIdx = adminApps.findIndex(a => a.id === id)
    if (adminTargetIdx !== -1) {
      adminApps[adminTargetIdx].status = 'withdrawn'
      localStorage.setItem('usmle_admin_applications', JSON.stringify(adminApps))
    }
  }

  return target
}

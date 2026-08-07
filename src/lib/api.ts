import { electives, type Elective } from '@/mocks/electives'
import { applications, type Application, type ApplicationStatus } from '@/mocks/applications'
import { documents, type UserDocument } from '@/mocks/documents'

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
}

export interface OnboardingData {
  role: string
  graduationYear: number
  visaStatus: string
  goals: string[]
  electives: string[]
  locations: string[]
  earliestStart: string
  durationPreference: number
  travelReady: boolean
}

const latency = (ms = 350) => new Promise(resolve => setTimeout(resolve, ms))

function addDays(iso: string, days: number) {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function nextApplicationId() {
  const max = applications.reduce((m, a) => Math.max(m, Number(a.id.replace('app-', ''))), 1000)
  return `app-${max + 1}`
}

export async function fetchElectives(filters: ElectiveFilters = {}): Promise<Elective[]> {
  await latency()
  let result = [...electives]

  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      e =>
        e.specialty.toLowerCase().includes(q) ||
        e.hospital.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q) ||
        e.state.toLowerCase().includes(q),
    )
  }
  if (filters.specialty) {
    result = result.filter(e => e.specialty === filters.specialty)
  }
  if (filters.city) {
    result = result.filter(e => `${e.city}, ${e.state}` === filters.city)
  }
  if (filters.duration) {
    result = result.filter(e => e.durationWeeks.includes(filters.duration!))
  }

  switch (filters.sort) {
    case 'fee':
      result.sort((a, b) => a.fee - b.fee)
      break
    case 'soonest':
      result.sort((a, b) => a.startDates[0].localeCompare(b.startDates[0]))
      break
    case 'rating':
    default:
      result.sort((a, b) => b.rating - a.rating)
      break
  }

  return result
}

export async function fetchElectiveById(id: string): Promise<Elective | null> {
  await latency()
  return electives.find(e => e.id === id) ?? null
}

export async function fetchApplications(): Promise<Application[]> {
  await latency()
  return [...applications].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
}

export async function submitApplication(input: ApplicationInput): Promise<Application> {
  await latency(600)
  const elective = electives.find(e => e.id === input.electiveId)
  if (!elective) throw new Error('Elective not found')

  const id = nextApplicationId()
  const submittedAt = new Date().toISOString().slice(0, 10)
  const app: Application = {
    id,
    electiveId: elective.id,
    specialty: elective.specialty,
    hospital: elective.hospital,
    city: elective.city,
    state: elective.state,
    status: 'submitted',
    startDate: input.startDate,
    durationWeeks: input.durationWeeks,
    submittedAt,
    documentsIncluded: input.documentsIncluded,
    timeline: [
      { label: 'Application submitted', date: submittedAt, done: true },
      { label: 'Documents reviewed', date: addDays(submittedAt, 5), done: false },
      { label: 'Program review', date: addDays(submittedAt, 12), done: false },
      { label: 'Offer decision', date: addDays(input.startDate, -21), done: false },
    ],
  }
  applications.unshift(app)
  return app
}

export async function withdrawApplication(id: string): Promise<Application> {
  await latency(400)
  const app = applications.find(a => a.id === id)
  if (!app) throw new Error('Application not found')
  app.status = 'withdrawn' as ApplicationStatus
  return { ...app }
}

export async function fetchDocuments(): Promise<UserDocument[]> {
  await latency()
  return documents.map(d => ({ ...d }))
}

export async function uploadDocument(id: string, file: File): Promise<UserDocument> {
  await latency(900)
  const doc = documents.find(d => d.id === id)
  if (!doc) throw new Error('Document not found')
  doc.status = 'uploaded'
  doc.fileName = file.name
  doc.uploadedAt = new Date().toISOString().slice(0, 10)
  return { ...doc }
}

export async function removeDocument(id: string): Promise<UserDocument> {
  await latency(300)
  const doc = documents.find(d => d.id === id)
  if (!doc) throw new Error('Document not found')
  doc.status = 'missing'
  doc.fileName = undefined
  doc.uploadedAt = undefined
  return { ...doc }
}

export async function completeOnboarding(data: OnboardingData): Promise<{ onboarded: true }> {
  await latency(600)
  void data
  return { onboarded: true }
}

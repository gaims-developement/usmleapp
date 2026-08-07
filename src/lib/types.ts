// These types are simplified and based on frontend usage and Prisma schema.
// They will need to be fully aligned with actual backend API responses.

// From prisma/schema.prisma
export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'FORWARDED'
  | 'AWAITING_DECISION'
  | 'ACCEPTED'
  | 'WAITLISTED'
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'submitted'
  | 'under_review'
  | 'changes_requested'
  | 'additional_info'
  | 'offered'
  | 'confirmed'
  | 'withdrawn'
  | 'rejected'
  | 'forwarded'

export type PaymentMethod = 'razorpay' | 'stripe' | 'card' | 'bank_transfer' | 'upi' | 'paypal'

export type Application = {
  id: string
  status: ApplicationStatus
  submittedAt: string // ISO date string
  electiveId: string // Corresponds to Program.id
  specialty: string // From Program
  hospital: string // From HospitalProfile via Program
  city: string // From HospitalProfile
  state: string // From HospitalProfile
  startDate: string // ISO date string
  durationWeeks: number
  paymentMethod?: PaymentMethod
  documentsIncluded: string[] // Names of documents
  // timeline is a frontend construct, not directly from backend Application model
  timeline: { label: string; date: string; done: boolean }[]
}

export type Elective = {
  id: string
  specialty: string
  hospital: string
  city: string
  state: string
  rating: number // Mocked for now
  spots: number // Mocked for now
  teachingType: 'Inpatient' | 'Outpatient' | 'Mixed' // Mocked for now
  fee: number
  description: string
  highlights: string[] // Mocked for now
  requirements: string[]
  eligibility: string
  startDates: string[] // ISO date strings
  durationWeeks: number[]
  applicationDeadline: string // ISO date string
}

export type DocumentStatus = 'missing' | 'uploaded' | 'expiring' | 'verified' | 'rejected'

export interface UserDocument {
  id: string
  name: string
  category: string
  required: boolean
  status: DocumentStatus
  fileName?: string
  uploadedAt?: string
  expiresAt?: string
}
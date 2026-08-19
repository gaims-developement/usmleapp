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
  | 'approved'
  | 'offered'
  | 'confirmed'
  | 'withdrawn'
  | 'rejected'
  | 'forwarded'
  | 'waitlisted'
  | 'completed'

export type PaymentMethod = 'razorpay' | 'stripe' | 'card' | 'bank_transfer' | 'upi' | 'paypal'

export type Payment = {
  id: string
  applicationId: string
  receiptNumber: string
  studentName: string
  studentEmail: string
  specialty: string
  hospital: string
  amount: number
  currency: string
  submittedAt: string
  paidAt: string
  status: string
  paymentMethod: string
  transactionId: string
}

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
  reviewedAt?: string // ISO date string
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
  rating?: number // Not yet tracked in DB; backend returns null until ratings exist
  spots: number
  teachingType?: 'Inpatient' | 'Outpatient' | 'Mixed' // Optional; not yet tracked in DB
  fee: number
  description: string
  highlights?: string[] // Optional; not yet tracked in DB
  requirements: string[]
  eligibility: string
  startDates: string[] // ISO date strings; empty when no dates are published yet
  durationWeeks: number[]
  applicationDeadline: string // ISO date string
}

export type DocumentStatus = 'missing' | 'uploaded' | 'expiring' | 'verified' | 'rejected'

export interface UserDocument {
  id: string
  dbId?: string
  name: string
  category: string
  required: boolean
  status: DocumentStatus
  fileName?: string
  uploadedAt?: string
  expiresAt?: string
  note?: string
  rejectedAt?: string
  version?: number
}

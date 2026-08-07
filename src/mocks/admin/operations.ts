import type { ApplicationStatus } from '@/mocks/applications'

export type ApplicationPriority = 'high' | 'normal' | 'low'

export interface AdminApplication {
  id: string
  student: string
  hospital: string
  specialty: string
  status: ApplicationStatus
  reviewer: string
  amount: number
  submittedAt: string
  priority: ApplicationPriority
  flagged: boolean
  documentsComplete: number
  documentsTotal: number
}

export const adminApplications: AdminApplication[] = [
  { id: 'AP-1042', student: 'Maya Iyer', hospital: 'Mount Sinai Beth Israel', specialty: 'Internal Medicine', status: 'offered', reviewer: 'Rita Reviewer', amount: 1200, submittedAt: '2026-08-05', priority: 'normal', flagged: false, documentsComplete: 6, documentsTotal: 6 },
  { id: 'AP-1041', student: 'Aarav Patel', hospital: 'Cleveland Clinic', specialty: 'Cardiology', status: 'under_review', reviewer: 'Dr. Sarah Kim', amount: 1400, submittedAt: '2026-08-04', priority: 'high', flagged: false, documentsComplete: 5, documentsTotal: 6 },
  { id: 'AP-1040', student: 'Chiamaka Okafor', hospital: 'Massachusetts General Hospital', specialty: 'Internal Medicine', status: 'submitted', reviewer: 'Unassigned', amount: 1200, submittedAt: '2026-08-04', priority: 'normal', flagged: false, documentsComplete: 6, documentsTotal: 6 },
  { id: 'AP-1039', student: 'Fatima Khan', hospital: 'Lurie Children’s Hospital', specialty: 'Pediatrics', status: 'under_review', reviewer: 'Dr. Alan Cross', amount: 1100, submittedAt: '2026-08-03', priority: 'normal', flagged: true, documentsComplete: 5, documentsTotal: 6 },
  { id: 'AP-1038', student: 'Diego Ramírez', hospital: 'UCLA Health', specialty: 'Emergency Medicine', status: 'additional_info', reviewer: 'Dr. Maria Gomez', amount: 1300, submittedAt: '2026-08-02', priority: 'high', flagged: true, documentsComplete: 4, documentsTotal: 6 },
  { id: 'AP-1037', student: 'Maya Iyer', hospital: 'Cleveland Clinic', specialty: 'Internal Medicine', status: 'confirmed', reviewer: 'Rita Reviewer', amount: 1400, submittedAt: '2026-08-01', priority: 'normal', flagged: false, documentsComplete: 6, documentsTotal: 6 },
  { id: 'AP-1036', student: 'Aarav Patel', hospital: 'Mount Sinai Beth Israel', specialty: 'Internal Medicine', status: 'under_review', reviewer: 'Dr. Ben Carter', amount: 1200, submittedAt: '2026-07-30', priority: 'low', flagged: false, documentsComplete: 6, documentsTotal: 6 },
  { id: 'AP-1035', student: 'Grace Abara', hospital: 'Johns Hopkins Hospital', specialty: 'Pediatrics', status: 'submitted', reviewer: 'Unassigned', amount: 1250, submittedAt: '2026-07-29', priority: 'normal', flagged: false, documentsComplete: 5, documentsTotal: 6 },
  { id: 'AP-1034', student: 'Fatima Khan', hospital: 'Cleveland Clinic', specialty: 'Family Medicine', status: 'offered', reviewer: 'Dr. Nia Johnson', amount: 1350, submittedAt: '2026-07-28', priority: 'normal', flagged: false, documentsComplete: 6, documentsTotal: 6 },
  { id: 'AP-1033', student: 'Liam O’Connor', hospital: 'Mayo Clinic', specialty: 'Neurology', status: 'additional_info', reviewer: 'Dr. Alan Cross', amount: 1500, submittedAt: '2026-07-27', priority: 'high', flagged: true, documentsComplete: 3, documentsTotal: 6 },
  { id: 'AP-1032', student: 'Maya Iyer', hospital: 'Johns Hopkins Hospital', specialty: 'Internal Medicine', status: 'rejected', reviewer: 'Dr. Sarah Kim', amount: 1250, submittedAt: '2026-07-25', priority: 'low', flagged: false, documentsComplete: 6, documentsTotal: 6 },
  { id: 'AP-1031', student: 'Diego Ramírez', hospital: 'Massachusetts General Hospital', specialty: 'Surgery', status: 'withdrawn', reviewer: 'Rita Reviewer', amount: 1450, submittedAt: '2026-07-24', priority: 'low', flagged: false, documentsComplete: 6, documentsTotal: 6 },
  { id: 'AP-1030', student: 'Aarav Patel', hospital: 'Lurie Children’s Hospital', specialty: 'Pediatrics', status: 'confirmed', reviewer: 'Dr. Maria Gomez', amount: 1100, submittedAt: '2026-07-22', priority: 'normal', flagged: false, documentsComplete: 6, documentsTotal: 6 },
  { id: 'AP-1029', student: 'Chiamaka Okafor', hospital: 'St. Mary’s Medical Center', specialty: 'Family Medicine', status: 'under_review', reviewer: 'Dr. Ben Carter', amount: 1000, submittedAt: '2026-07-21', priority: 'low', flagged: false, documentsComplete: 5, documentsTotal: 6 },
  { id: 'AP-1028', student: 'Fatima Khan', hospital: 'Mount Sinai Beth Israel', specialty: 'Internal Medicine', status: 'offered', reviewer: 'Dr. Nia Johnson', amount: 1200, submittedAt: '2026-07-19', priority: 'normal', flagged: false, documentsComplete: 6, documentsTotal: 6 },
  { id: 'AP-1027', student: 'Maya Iyer', hospital: 'Mayo Clinic', specialty: 'Radiology', status: 'submitted', reviewer: 'Unassigned', amount: 1500, submittedAt: '2026-07-18', priority: 'normal', flagged: false, documentsComplete: 5, documentsTotal: 6 },
]

export type ProgramStatus = 'published' | 'draft' | 'closed'

export interface ProgramRecord {
  id: string
  title: string
  specialty: string
  hospital: string
  city: string
  duration: string
  fee: number
  filled: number
  capacity: number
  status: ProgramStatus
  startDate: string
}

export const adminPrograms: ProgramRecord[] = [
  { id: 'prg-1', title: 'IM Core Clerkship', specialty: 'Internal Medicine', hospital: 'Cleveland Clinic', city: 'Cleveland, OH', duration: '8 weeks', fee: 1400, filled: 44, capacity: 50, status: 'published', startDate: '2027-01-04' },
  { id: 'prg-2', title: 'Cardiology Rotation', specialty: 'Cardiology', hospital: 'Cleveland Clinic', city: 'Cleveland, OH', duration: '4 weeks', fee: 1500, filled: 21, capacity: 30, status: 'published', startDate: '2026-10-05' },
  { id: 'prg-3', title: 'Peds Inpatient Experience', specialty: 'Pediatrics', hospital: 'Lurie Children’s Hospital', city: 'Chicago, IL', duration: '8 weeks', fee: 1100, filled: 38, capacity: 40, status: 'published', startDate: '2026-11-02' },
  { id: 'prg-4', title: 'General Surgery Rotation', specialty: 'Surgery', hospital: 'Johns Hopkins Hospital', city: 'Baltimore, MD', duration: '12 weeks', fee: 1600, filled: 12, capacity: 30, status: 'published', startDate: '2027-01-11' },
  { id: 'prg-5', title: 'ED Observership', specialty: 'Emergency Medicine', hospital: 'Massachusetts General Hospital', city: 'Boston, MA', duration: '4 weeks', fee: 1350, filled: 19, capacity: 25, status: 'published', startDate: '2026-12-07' },
  { id: 'prg-6', title: 'Family Medicine Elective', specialty: 'Family Medicine', hospital: 'St. Mary’s Medical Center', city: 'San Francisco, CA', duration: '6 weeks', fee: 1000, filled: 24, capacity: 28, status: 'published', startDate: '2026-10-12' },
  { id: 'prg-7', title: 'Psychiatry Clerkship', specialty: 'Psychiatry', hospital: 'UCLA Health', city: 'Los Angeles, CA', duration: '8 weeks', fee: 1200, filled: 8, capacity: 30, status: 'published', startDate: '2027-01-18' },
  { id: 'prg-8', title: 'Radiology Shadowing', specialty: 'Radiology', hospital: 'Mayo Clinic', city: 'Rochester, MN', duration: '4 weeks', fee: 1500, filled: 0, capacity: 20, status: 'draft', startDate: '2027-02-01' },
  { id: 'prg-9', title: 'Neuro Rotation', specialty: 'Neurology', hospital: 'Mayo Clinic', city: 'Rochester, MN', duration: '8 weeks', fee: 1550, filled: 17, capacity: 24, status: 'published', startDate: '2026-11-16' },
  { id: 'prg-10', title: 'IM Sub-Internship', specialty: 'Internal Medicine', hospital: 'Mount Sinai Beth Israel', city: 'New York, NY', duration: '12 weeks', fee: 1200, filled: 40, capacity: 40, status: 'closed', startDate: '2026-09-07' },
  { id: 'prg-11', title: 'Peds ED Elective', specialty: 'Pediatrics', hospital: 'Mount Sinai Beth Israel', city: 'New York, NY', duration: '4 weeks', fee: 1150, filled: 11, capacity: 15, status: 'published', startDate: '2027-03-01' },
  { id: 'prg-12', title: 'Cardio Observership', specialty: 'Cardiology', hospital: 'Johns Hopkins Hospital', city: 'Baltimore, MD', duration: '6 weeks', fee: 1450, filled: 6, capacity: 20, status: 'published', startDate: '2027-02-15' },
]

export type DocVerificationStatus = 'pending' | 'verified' | 'rejected' | 'expiring'

export interface DocRecord {
  id: string
  owner: string
  document: string
  category: string
  status: DocVerificationStatus
  uploadedAt: string
}

export const adminDocuments: DocRecord[] = [
  { id: 'doc-1', owner: 'Maya Iyer', document: 'USMLE Step 1 score report', category: 'Exam', status: 'verified', uploadedAt: '2026-08-03' },
  { id: 'doc-2', owner: 'Aarav Patel', document: 'Passport', category: 'Identity', status: 'pending', uploadedAt: '2026-08-02' },
  { id: 'doc-3', owner: 'Fatima Khan', document: 'Medical school transcript', category: 'Academic', status: 'pending', uploadedAt: '2026-08-02' },
  { id: 'doc-4', owner: 'Chiamaka Okafor', document: 'ECFMG certificate', category: 'Credential', status: 'pending', uploadedAt: '2026-08-01' },
  { id: 'doc-5', owner: 'Diego Ramírez', document: 'Immunization record', category: 'Health', status: 'verified', uploadedAt: '2026-07-29' },
  { id: 'doc-6', owner: 'Maya Iyer', document: 'Letter of recommendation', category: 'Academic', status: 'verified', uploadedAt: '2026-07-28' },
  { id: 'doc-7', owner: 'Aarav Patel', document: 'Passport', category: 'Identity', status: 'expiring', uploadedAt: '2026-07-26' },
  { id: 'doc-8', owner: 'Grace Abara', document: 'USMLE Step 2 CK score report', category: 'Exam', status: 'pending', uploadedAt: '2026-07-24' },
  { id: 'doc-9', owner: 'Liam O’Connor', document: 'CV / Resume', category: 'Professional', status: 'rejected', uploadedAt: '2026-07-22' },
  { id: 'doc-10', owner: 'Fatima Khan', document: 'Medical school transcript', category: 'Academic', status: 'verified', uploadedAt: '2026-07-20' },
  { id: 'doc-11', owner: 'Chiamaka Okafor', document: 'Passport', category: 'Identity', status: 'expiring', uploadedAt: '2026-07-18' },
  { id: 'doc-12', owner: 'Diego Ramírez', document: 'Medical school transcript', category: 'Academic', status: 'verified', uploadedAt: '2026-07-15' },
]

export type PaymentStatus = 'paid' | 'refunded' | 'pending' | 'failed'

export interface PaymentRecord {
  id: string
  user: string
  plan: string
  method: string
  amount: number
  status: PaymentStatus
  date: string
}

export const adminPayments: PaymentRecord[] = [
  { id: 'PAY-4410', user: 'Maya Iyer', plan: 'Application Fee', method: 'Visa •• 4242', amount: 1400, status: 'paid', date: '2026-08-05' },
  { id: 'PAY-4409', user: 'Aarav Patel', plan: 'Pro Plan', method: 'Mastercard •• 5512', amount: 2400, status: 'paid', date: '2026-08-04' },
  { id: 'PAY-4408', user: 'Fatima Khan', plan: 'Application Fee', method: 'Visa •• 1034', amount: 1100, status: 'pending', date: '2026-08-04' },
  { id: 'PAY-4407', user: 'Chiamaka Okafor', plan: 'Pro Plan', method: 'Amex •• 2100', amount: 2400, status: 'paid', date: '2026-08-02' },
  { id: 'PAY-4406', user: 'Diego Ramírez', plan: 'Application Fee', method: 'Visa •• 8847', amount: 1300, status: 'paid', date: '2026-08-01' },
  { id: 'PAY-4405', user: 'Maya Iyer', plan: 'Application Fee', method: 'Visa •• 4242', amount: 1250, status: 'paid', date: '2026-07-30' },
  { id: 'PAY-4404', user: 'Liam O’Connor', plan: 'Application Fee', method: 'Mastercard •• 6671', amount: 1500, status: 'failed', date: '2026-07-28' },
  { id: 'PAY-4403', user: 'Aarav Patel', plan: 'Application Fee', method: 'Mastercard •• 5512', amount: 1100, status: 'refunded', date: '2026-07-26' },
  { id: 'PAY-4402', user: 'Grace Abara', plan: 'Pro Plan', method: 'Visa •• 3099', amount: 2400, status: 'pending', date: '2026-07-25' },
  { id: 'PAY-4401', user: 'Fatima Khan', plan: 'Application Fee', method: 'Visa •• 1034', amount: 1200, status: 'paid', date: '2026-07-24' },
  { id: 'PAY-4400', user: 'Diego Ramírez', plan: 'Application Fee', method: 'Visa •• 8847', amount: 1450, status: 'paid', date: '2026-07-22' },
  { id: 'PAY-4399', user: 'Maya Iyer', plan: 'Pro Plan', method: 'Visa •• 4242', amount: 2400, status: 'paid', date: '2026-07-20' },
  { id: 'PAY-4398', user: 'Chiamaka Okafor', plan: 'Application Fee', method: 'Amex •• 2100', amount: 1000, status: 'paid', date: '2026-07-18' },
  { id: 'PAY-4397', user: 'Aarav Patel', plan: 'Application Fee', method: 'Mastercard •• 5512', amount: 1200, status: 'paid', date: '2026-07-16' },
]

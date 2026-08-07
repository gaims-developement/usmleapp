export type DocumentStatus = 'missing' | 'uploaded' | 'expiring'

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

export const documents: UserDocument[] = [
  {
    id: 'doc-passport',
    name: 'Passport',
    category: 'Identity',
    required: true,
    status: 'uploaded',
    fileName: 'passport_scanned.pdf',
    uploadedAt: '2026-07-12',
  },
  {
    id: 'doc-visa',
    name: 'Visa / I-20 Documents',
    category: 'Legal',
    required: true,
    status: 'missing',
  },
  {
    id: 'doc-cv',
    name: 'CV / Resume',
    category: 'Education',
    required: true,
    status: 'missing',
  },
  {
    id: 'doc-transcript',
    name: 'Medical School Transcript',
    category: 'Education',
    required: true,
    status: 'missing',
  },
  {
    id: 'doc-step1',
    name: 'USMLE Step 1 Score Report',
    category: 'Exams',
    required: true,
    status: 'missing',
  },
  {
    id: 'doc-step2',
    name: 'USMLE Step 2 CK Score Report',
    category: 'Exams',
    required: false,
    status: 'missing',
  },
  {
    id: 'doc-english',
    name: 'English Proficiency (IELTS / TOEFL)',
    category: 'Exams',
    required: false,
    status: 'missing',
  },
  {
    id: 'doc-immunizations',
    name: 'Immunization Record',
    category: 'Medical',
    required: true,
    status: 'expiring',
    fileName: 'immunizations.pdf',
    uploadedAt: '2026-06-18',
    expiresAt: '2026-11-01',
  },
  {
    id: 'doc-tb',
    name: 'TB Screening / PPD',
    category: 'Medical',
    required: true,
    status: 'uploaded',
    fileName: 'tb_screening.pdf',
    uploadedAt: '2026-07-05',
  },
  {
    id: 'doc-lor',
    name: 'Letter of Recommendation',
    category: 'Evaluation',
    required: true,
    status: 'missing',
  },
  {
    id: 'doc-personal-statement',
    name: 'Personal Statement',
    category: 'Evaluation',
    required: true,
    status: 'missing',
  },
]

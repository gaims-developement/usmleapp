export type ApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'additional_info'
  | 'offered'
  | 'confirmed'
  | 'withdrawn'
  | 'rejected'

export interface ApplicationTimelineStep {
  label: string
  date: string
  done: boolean
}

export interface Application {
  id: string
  electiveId: string
  specialty: string
  hospital: string
  city: string
  state: string
  status: ApplicationStatus
  startDate: string
  durationWeeks: number
  submittedAt: string
  documentsIncluded: string[]
  timeline: ApplicationTimelineStep[]
}

export const applications: Application[] = [
  {
    id: 'app-1001',
    electiveId: 'im-beth-israel',
    specialty: 'Internal Medicine',
    hospital: 'Mount Sinai Beth Israel',
    city: 'New York',
    state: 'NY',
    status: 'under_review',
    startDate: '2027-01-04',
    durationWeeks: 8,
    submittedAt: '2026-08-02',
    documentsIncluded: ['Passport', 'CV / Resume', 'Medical school transcript'],
    timeline: [
      { label: 'Application submitted', date: '2026-08-02', done: true },
      { label: 'Documents reviewed', date: '2026-08-07', done: true },
      { label: 'Program review', date: '2026-08-14', done: true },
      { label: 'Offer decision', date: '2026-12-14', done: false },
    ],
  },
  {
    id: 'app-1002',
    electiveId: 'peds-lurie',
    specialty: 'Pediatrics',
    hospital: 'Lurie Children\u2019s Hospital',
    city: 'Chicago',
    state: 'IL',
    status: 'offered',
    startDate: '2026-11-02',
    durationWeeks: 4,
    submittedAt: '2026-07-21',
    documentsIncluded: ['Passport', 'CV / Resume', 'Medical school transcript', 'Immunization record'],
    timeline: [
      { label: 'Application submitted', date: '2026-07-21', done: true },
      { label: 'Documents reviewed', date: '2026-07-26', done: true },
      { label: 'Program review', date: '2026-08-01', done: true },
      { label: 'Offer decision', date: '2026-08-12', done: true },
    ],
  },
  {
    id: 'app-1003',
    electiveId: 'cardio-cleveland',
    specialty: 'Internal Medicine – Cardiology',
    hospital: 'Cleveland Clinic',
    city: 'Cleveland',
    state: 'OH',
    status: 'rejected',
    startDate: '2026-11-02',
    durationWeeks: 4,
    submittedAt: '2026-07-10',
    documentsIncluded: ['Passport', 'CV / Resume', 'Medical school transcript', 'USMLE Step 1 score report'],
    timeline: [
      { label: 'Application submitted', date: '2026-07-10', done: true },
      { label: 'Documents reviewed', date: '2026-07-15', done: true },
      { label: 'Program review', date: '2026-07-22', done: true },
      { label: 'Offer decision', date: '2026-07-28', done: true },
    ],
  },
]

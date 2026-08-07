export type ProgramStatus = 'published' | 'paused' | 'archived' | 'draft'

export interface HospitalProgram {
  id: string
  name: string
  department: string
  specialty: string
  duration: string
  fee: number
  seats: number
  filled: number
  deadline: string
  status: ProgramStatus
  description: string
  eligibility: string
  requiredDocuments: string[]
  availableDates: string[]
  faculty: string[]
  createdAt: string
}

export const hospitalDepartments = [
  'Internal Medicine',
  'Pediatrics',
  'General Surgery',
  'Cardiology',
  'Neurology',
  'Dermatology',
  'Obstetrics & Gynecology',
  'Anesthesiology',
]

const DOCS = [
  'Passport',
  'Curriculum Vitae',
  'Transcript',
  'Medical Degree',
  'Vaccination Records',
  'USMLE Score Report',
  'English Proficiency',
  'Letters of Recommendation',
]

export const hospitalPrograms: HospitalProgram[] = [
  {
    id: 'PRG-201', name: 'IM Core Clerkship', department: 'Internal Medicine', specialty: 'General Internal Medicine',
    duration: '8 weeks', fee: 2600, seats: 8, filled: 6, deadline: '2026-09-15', status: 'published',
    description: 'A comprehensive inpatient clerkship covering general medicine wards with daily teaching rounds and case conferences.',
    eligibility: 'Final year medical students; USMLE Step 1 preferred; English proficiency required.',
    requiredDocuments: DOCS,
    availableDates: ['2026-10-05', '2026-11-02', '2026-12-07'],
    faculty: ['Dr. Alan Cross', 'Dr. Maria Gomez'],
    createdAt: '2026-01-10',
  },
  {
    id: 'PRG-202', name: 'Advanced IM Sub-internship', department: 'Internal Medicine', specialty: 'Hospital Medicine',
    duration: '8 weeks', fee: 3200, seats: 4, filled: 3, deadline: '2026-09-30', status: 'published',
    description: 'Acting intern experience with independent patient panel, procedures, and overnight call under supervision.',
    eligibility: 'Final year or recent graduates; USMLE Step 1 required; strong letters of recommendation.',
    requiredDocuments: DOCS,
    availableDates: ['2026-11-16', '2026-12-14'],
    faculty: ['Dr. Maria Gomez', 'Dr. Alan Cross'],
    createdAt: '2026-02-04',
  },
  {
    id: 'PRG-203', name: 'General Pediatrics Rotation', department: 'Pediatrics', specialty: 'General Pediatrics',
    duration: '6 weeks', fee: 2400, seats: 6, filled: 4, deadline: '2026-09-20', status: 'published',
    description: 'Ward and clinic pediatrics with newborn nursery exposure and growth/development teaching.',
    eligibility: 'Clinical year students; USMLE not required for this rotation.',
    requiredDocuments: DOCS,
    availableDates: ['2026-10-12', '2026-11-09'],
    faculty: ['Dr. Emily Chen', 'Dr. Michael Brown'],
    createdAt: '2026-01-22',
  },
  {
    id: 'PRG-204', name: 'Pediatric Elective', department: 'Pediatrics', specialty: 'Pediatric Critical Care',
    duration: '4 weeks', fee: 2100, seats: 4, filled: 1, deadline: '2026-10-05', status: 'published',
    description: 'Focused elective in the PICU with exposure to ventilated patients and acute management.',
    eligibility: 'Final year students with completed core clerkships; USMLE Step 1 recommended.',
    requiredDocuments: DOCS,
    availableDates: ['2026-12-07'],
    faculty: ['Dr. Michael Brown'],
    createdAt: '2026-03-11',
  },
  {
    id: 'PRG-205', name: 'General Surgery Clerkship', department: 'General Surgery', specialty: 'General & Trauma Surgery',
    duration: '8 weeks', fee: 2800, seats: 6, filled: 5, deadline: '2026-09-10', status: 'published',
    description: 'Surgical clerkship with OR time, inpatient consults, and trauma call experience.',
    eligibility: 'Clinical year students; completion of core internal medicine clerkship.',
    requiredDocuments: DOCS,
    availableDates: ['2026-10-19', '2026-11-16'],
    faculty: ['Dr. Robert King'],
    createdAt: '2026-01-05',
  },
  {
    id: 'PRG-206', name: 'Cardiology Elective', department: 'Cardiology', specialty: 'Interventional Cardiology',
    duration: '6 weeks', fee: 3000, seats: 5, filled: 3, deadline: '2026-09-25', status: 'published',
    description: 'Cardiology rotation with cath lab observation, EKG conference, and echo teaching.',
    eligibility: 'Final year students; USMLE Step 1 required; Step 2 CK preferred.',
    requiredDocuments: DOCS,
    availableDates: ['2026-10-26', '2026-11-23'],
    faculty: ['Dr. Nia Johnson'],
    createdAt: '2026-02-17',
  },
  {
    id: 'PRG-207', name: 'Stroke & Neuro ICU Rotation', department: 'Neurology', specialty: 'Stroke Neurology',
    duration: '6 weeks', fee: 2700, seats: 5, filled: 2, deadline: '2026-10-10', status: 'published',
    description: 'Neurology rotation with stroke unit and neuro ICU exposure, NIHSS training included.',
    eligibility: 'Clinical year students; USMLE Step 1 recommended.',
    requiredDocuments: DOCS,
    availableDates: ['2026-10-12', '2026-11-09', '2026-12-07'],
    faculty: ['Dr. David Lee'],
    createdAt: '2026-03-02',
  },
  {
    id: 'PRG-208', name: 'Clinical Dermatology', department: 'Dermatology', specialty: 'Medical Dermatology',
    duration: '4 weeks', fee: 2300, seats: 4, filled: 3, deadline: '2026-09-28', status: 'published',
    description: 'Outpatient dermatology rotation with dermoscopy teaching and procedure observation.',
    eligibility: 'Final year students; USMLE Step 1 required for this elective.',
    requiredDocuments: DOCS,
    availableDates: ['2026-11-02', '2026-11-30'],
    faculty: ['Dr. Sarah Patel'],
    createdAt: '2026-02-25',
  },
  {
    id: 'PRG-209', name: 'OB/GYN Clerkship', department: 'Obstetrics & Gynecology', specialty: 'General OB/GYN',
    duration: '8 weeks', fee: 2600, seats: 8, filled: 6, deadline: '2026-09-18', status: 'published',
    description: 'Comprehensive OB/GYN clerkship with labor floor, clinics, and surgical exposure.',
    eligibility: 'Clinical year students; USMLE not required.',
    requiredDocuments: DOCS,
    availableDates: ['2026-10-05', '2026-11-02', '2026-12-07'],
    faculty: ['Dr. James Wilson'],
    createdAt: '2026-01-15',
  },
  {
    id: 'PRG-210', name: 'Labor & Delivery Elective', department: 'Obstetrics & Gynecology', specialty: 'Maternal-Fetal Medicine',
    duration: '6 weeks', fee: 2900, seats: 4, filled: 2, deadline: '2026-10-08', status: 'published',
    description: 'Advanced L&D elective with delivery room skills and high-risk pregnancy exposure.',
    eligibility: 'Final year students; USMLE Step 1 preferred; prior OB/GYN clerkship.',
    requiredDocuments: DOCS,
    availableDates: ['2026-11-16'],
    faculty: ['Dr. James Wilson'],
    createdAt: '2026-03-19',
  },
  {
    id: 'PRG-211', name: 'Anesthesiology Observership', department: 'Anesthesiology', specialty: 'Regional Anesthesia',
    duration: '4 weeks', fee: 2200, seats: 5, filled: 5, deadline: '2026-09-22', status: 'paused',
    description: 'Introductory anesthesia observership with airway workshops and OR observation.',
    eligibility: 'Final year students; English proficiency required; USMLE not required.',
    requiredDocuments: DOCS,
    availableDates: ['2026-12-07'],
    faculty: ['Dr. Angela Thomas'],
    createdAt: '2026-04-02',
  },
  {
    id: 'PRG-212', name: 'Acute Care & Anesthesia', department: 'Anesthesiology', specialty: 'General Anesthesia',
    duration: '6 weeks', fee: 2500, seats: 4, filled: 0, deadline: '2026-09-30', status: 'draft',
    description: 'Draft program — acute care anesthesia with sim-lab component. Pending department approval.',
    eligibility: 'Final year students; USMLE Step 1 required.',
    requiredDocuments: DOCS,
    availableDates: ['2026-12-14'],
    faculty: ['Dr. Angela Thomas'],
    createdAt: '2026-08-01',
  },
]

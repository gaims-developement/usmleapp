export type StudentStatus = 'active' | 'invited' | 'suspended'

export interface AdminStudent {
  id: string
  name: string
  email: string
  country: string
  school: string
  step1: string
  step2: string
  applications: number
  docsComplete: number
  docsTotal: number
  profileComplete: boolean
  flagged: boolean
  status: StudentStatus
  joinedAt: string
}

export const adminStudents: AdminStudent[] = [
  { id: 'st-1', name: 'Aarav Patel', email: 'aarav.patel@med.edu.in', country: 'India', school: 'All India Institute of Medical Sciences', step1: '246', step2: '—', applications: 3, docsComplete: 5, docsTotal: 6, profileComplete: true, flagged: false, status: 'active', joinedAt: '2026-08-06' },
  { id: 'st-2', name: 'Maya Iyer', email: 'maya.iyer@gmail.com', country: 'India', school: 'Christian Medical College, Vellore', step1: '251', step2: '258', applications: 5, docsComplete: 6, docsTotal: 6, profileComplete: true, flagged: false, status: 'active', joinedAt: '2026-08-05' },
  { id: 'st-3', name: 'Fatima Khan', email: 'fatima.khan@duhs.edu.pk', country: 'Pakistan', school: 'Dow Medical College', step1: '238', step2: '—', applications: 2, docsComplete: 5, docsTotal: 6, profileComplete: true, flagged: true, status: 'active', joinedAt: '2026-08-03' },
  { id: 'st-4', name: 'Chiamaka Okafor', email: 'chiamaka@luth.gov.ng', country: 'Nigeria', school: 'Lagos University Teaching Hospital', step1: '—', step2: '—', applications: 0, docsComplete: 3, docsTotal: 6, profileComplete: false, flagged: false, status: 'invited', joinedAt: '2026-08-02' },
  { id: 'st-5', name: 'Diego Ramírez', email: 'diego.ramirez@unam.mx', country: 'Mexico', school: 'UNAM Faculty of Medicine', step1: '240', step2: '249', applications: 1, docsComplete: 4, docsTotal: 6, profileComplete: false, flagged: true, status: 'active', joinedAt: '2026-07-28' },
  { id: 'st-6', name: 'Grace Abara', email: 'grace.abara@unilag.edu.ng', country: 'Nigeria', school: 'University of Lagos', step1: '233', step2: '—', applications: 1, docsComplete: 5, docsTotal: 6, profileComplete: true, flagged: false, status: 'active', joinedAt: '2026-07-25' },
  { id: 'st-7', name: 'Liam O’Connor', email: 'liam.oconnor@rcsi.com', country: 'Ireland', school: 'RCSI Dublin', step1: '244', step2: '252', applications: 1, docsComplete: 3, docsTotal: 6, profileComplete: true, flagged: true, status: 'active', joinedAt: '2026-07-22' },
  { id: 'st-8', name: 'Ahmed Hassan', email: 'ahmed.hassan@cu.edu.eg', country: 'Egypt', school: 'Cairo University', step1: '—', step2: '—', applications: 0, docsComplete: 2, docsTotal: 6, profileComplete: false, flagged: false, status: 'suspended', joinedAt: '2026-07-22' },
  { id: 'st-9', name: 'Priya Sharma', email: 'priya.sharma@afmc.ac.in', country: 'India', school: 'Armed Forces Medical College', step1: '249', step2: '255', applications: 2, docsComplete: 6, docsTotal: 6, profileComplete: true, flagged: false, status: 'active', joinedAt: '2026-07-19' },
  { id: 'st-10', name: 'Yusuf Abdullahi', email: 'yusuf.abdullahi@abu.edu.ng', country: 'Nigeria', school: 'Ahmadu Bello University', step1: '—', step2: '—', applications: 0, docsComplete: 4, docsTotal: 6, profileComplete: false, flagged: false, status: 'invited', joinedAt: '2026-07-16' },
  { id: 'st-11', name: 'Sofia Martinez', email: 'sofia.martinez@unam.mx', country: 'Mexico', school: 'UNAM Faculty of Medicine', step1: '241', step2: '—', applications: 2, docsComplete: 5, docsTotal: 6, profileComplete: true, flagged: false, status: 'active', joinedAt: '2026-07-14' },
  { id: 'st-12', name: 'Omar Farouk', email: 'omar.farouk@kasralainy.edu.eg', country: 'Egypt', school: 'Kasr Al-Ainy', step1: '236', step2: '244', applications: 1, docsComplete: 6, docsTotal: 6, profileComplete: true, flagged: false, status: 'active', joinedAt: '2026-07-11' },
]

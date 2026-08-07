import type { RoleId } from '@/types/rbac'

export type UserStatus = 'active' | 'invited' | 'suspended'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: RoleId
  status: UserStatus
  org?: string
  country: string
  joinedAt: string
  applications: number
}

export const adminUsers: AdminUser[] = [
  { id: 'u-1', name: 'Aarav Patel', email: 'aarav.patel@med.edu.in', role: 'STUDENT', status: 'active', org: 'All India Institute', country: 'India', joinedAt: '2026-08-06', applications: 3 },
  { id: 'u-2', name: 'Maya Iyer', email: 'maya.iyer@gmail.com', role: 'STUDENT', status: 'active', org: 'Christian Medical College', country: 'India', joinedAt: '2026-08-05', applications: 5 },
  { id: 'u-3', name: 'Fatima Khan', email: 'fatima.khan@duhs.edu.pk', role: 'STUDENT', status: 'active', org: 'Dow Medical College', country: 'Pakistan', joinedAt: '2026-08-03', applications: 2 },
  { id: 'u-4', name: 'Chiamaka Okafor', email: 'chiamaka@luth.gov.ng', role: 'STUDENT', status: 'invited', org: 'Lagos University Teaching Hospital', country: 'Nigeria', joinedAt: '2026-08-02', applications: 0 },
  { id: 'u-5', name: 'Diego Ramírez', email: 'diego.ramirez@unam.mx', role: 'STUDENT', status: 'active', org: 'UNAM Faculty of Medicine', country: 'Mexico', joinedAt: '2026-07-28', applications: 1 },
  { id: 'u-6', name: 'Ahmed Hassan', email: 'ahmed.hassan@cu.edu.eg', role: 'STUDENT', status: 'suspended', org: 'Cairo University', country: 'Egypt', joinedAt: '2026-07-22', applications: 0 },
  { id: 'u-7', name: 'Rita Reviewer', email: 'rita.reviewer@imgprep.com', role: 'REVIEWER', status: 'active', org: 'Review Ops', country: 'United States', joinedAt: '2026-01-10', applications: 0 },
  { id: 'u-8', name: 'Dr. Sarah Kim', email: 'sarah.kim@imgprep.com', role: 'REVIEWER', status: 'active', org: 'Review Ops', country: 'United States', joinedAt: '2026-06-18', applications: 0 },
  { id: 'u-9', name: 'Dr. Michael Mentor', email: 'michael.mentor@imgprep.com', role: 'DOCTOR', status: 'active', org: 'Cleveland Clinic', country: 'United States', joinedAt: '2026-01-20', applications: 0 },
  { id: 'u-10', name: 'Dr. Priya Nair', email: 'priya.nair@clevelandclinic.org', role: 'DOCTOR', status: 'active', org: 'Cleveland Clinic', country: 'United States', joinedAt: '2026-03-12', applications: 0 },
  { id: 'u-11', name: 'St. Mary’s Medical Center', email: 'rotations@stmarys.org', role: 'HOSPITAL', status: 'active', org: 'St. Mary’s Medical Center', country: 'United States', joinedAt: '2026-01-15', applications: 0 },
  { id: 'u-12', name: 'Northside Medical Center', email: 'education@northside.org', role: 'HOSPITAL', status: 'invited', org: 'Northside Medical Center', country: 'United States', joinedAt: '2026-08-05', applications: 0 },
  { id: 'u-13', name: 'Alex Admin', email: 'ops@imgprep.com', role: 'ADMIN', status: 'active', org: 'IMG Prep HQ', country: 'United States', joinedAt: '2026-01-05', applications: 0 },
  { id: 'u-14', name: 'Jordan Lee', email: 'jordan.lee@imgprep.com', role: 'ADMIN', status: 'invited', org: 'IMG Prep HQ', country: 'United States', joinedAt: '2026-08-01', applications: 0 },
]

export type HospitalStatus = 'active' | 'paused' | 'onboarding'
export type HospitalTier = 'premier' | 'standard'

export interface HospitalRecord {
  id: string
  name: string
  city: string
  state: string
  tier: HospitalTier
  programs: number
  doctors: number
  students: number
  rating: number
  status: HospitalStatus
  joinedAt: string
  email: string
  phone: string
}

export const adminHospitals: HospitalRecord[] = [
  { id: 'h-1', name: 'Mount Sinai Beth Israel', city: 'New York', state: 'NY', tier: 'premier', programs: 9, doctors: 24, students: 86, rating: 4.8, status: 'active', joinedAt: '2026-01-12', email: 'rotations@mountsinai.org', phone: '+1 (212) 420-2000' },
  { id: 'h-2', name: 'Cleveland Clinic', city: 'Cleveland', state: 'OH', tier: 'premier', programs: 12, doctors: 31, students: 104, rating: 4.9, status: 'active', joinedAt: '2026-01-18', email: 'education@ccf.org', phone: '+1 (216) 444-2200' },
  { id: 'h-3', name: 'Lurie Children’s Hospital', city: 'Chicago', state: 'IL', tier: 'premier', programs: 7, doctors: 18, students: 61, rating: 4.7, status: 'active', joinedAt: '2026-02-03', email: 'rotations@luriechildrens.org', phone: '+1 (312) 227-4000' },
  { id: 'h-4', name: 'Massachusetts General Hospital', city: 'Boston', state: 'MA', tier: 'premier', programs: 11, doctors: 29, students: 98, rating: 4.9, status: 'active', joinedAt: '2026-02-11', email: 'rotations@mgh.harvard.edu', phone: '+1 (617) 726-2000' },
  { id: 'h-5', name: 'St. Mary’s Medical Center', city: 'San Francisco', state: 'CA', tier: 'standard', programs: 5, doctors: 12, students: 42, rating: 4.4, status: 'active', joinedAt: '2026-03-02', email: 'rotations@stmarys.org', phone: '+1 (415) 668-1000' },
  { id: 'h-6', name: 'Johns Hopkins Hospital', city: 'Baltimore', state: 'MD', tier: 'premier', programs: 10, doctors: 27, students: 92, rating: 4.8, status: 'active', joinedAt: '2026-03-19', email: 'education@jhmi.edu', phone: '+1 (410) 955-5000' },
  { id: 'h-7', name: 'Texas Medical Center', city: 'Houston', state: 'TX', tier: 'standard', programs: 6, doctors: 15, students: 51, rating: 4.5, status: 'paused', joinedAt: '2026-04-08', email: 'programs@texmed.org', phone: '+1 (713) 791-7300' },
  { id: 'h-8', name: 'UCLA Health', city: 'Los Angeles', state: 'CA', tier: 'standard', programs: 8, doctors: 20, students: 66, rating: 4.6, status: 'active', joinedAt: '2026-05-14', email: 'rotations@uclahealth.org', phone: '+1 (310) 825-9111' },
  { id: 'h-9', name: 'Northside Medical Center', city: 'Atlanta', state: 'GA', tier: 'standard', programs: 3, doctors: 6, students: 18, rating: 4.2, status: 'onboarding', joinedAt: '2026-08-05', email: 'education@northside.org', phone: '+1 (404) 851-8000' },
  { id: 'h-10', name: 'Mayo Clinic', city: 'Rochester', state: 'MN', tier: 'premier', programs: 13, doctors: 34, students: 118, rating: 4.9, status: 'active', joinedAt: '2026-06-22', email: 'rotations@mayo.edu', phone: '+1 (507) 284-2511' },
]

export type DoctorStatus = 'active' | 'busy' | 'inactive'

export interface DoctorRecord {
  id: string
  name: string
  specialty: string
  hospital: string
  students: number
  evaluations: number
  rating: number
  status: DoctorStatus
  joinedAt: string
}

export const adminDoctors: DoctorRecord[] = [
  { id: 'd-1', name: 'Dr. Michael Mentor', specialty: 'Internal Medicine', hospital: 'Cleveland Clinic', students: 14, evaluations: 42, rating: 4.9, status: 'active', joinedAt: '2026-01-20' },
  { id: 'd-2', name: 'Dr. Priya Nair', specialty: 'Cardiology', hospital: 'Cleveland Clinic', students: 11, evaluations: 30, rating: 4.8, status: 'busy', joinedAt: '2026-03-12' },
  { id: 'd-3', name: 'Dr. David Osei', specialty: 'Pediatrics', hospital: 'Lurie Children’s Hospital', students: 9, evaluations: 27, rating: 4.7, status: 'active', joinedAt: '2026-02-08' },
  { id: 'd-4', name: 'Dr. Laura Schmidt', specialty: 'Family Medicine', hospital: 'St. Mary’s Medical Center', students: 7, evaluations: 19, rating: 4.5, status: 'active', joinedAt: '2026-03-25' },
  { id: 'd-5', name: 'Dr. Emily Carter', specialty: 'Emergency Medicine', hospital: 'Massachusetts General Hospital', students: 12, evaluations: 35, rating: 4.8, status: 'active', joinedAt: '2026-02-17' },
  { id: 'd-6', name: 'Dr. Omar Farouk', specialty: 'Surgery', hospital: 'Johns Hopkins Hospital', students: 8, evaluations: 24, rating: 4.6, status: 'busy', joinedAt: '2026-04-01' },
  { id: 'd-7', name: 'Dr. Hannah Cole', specialty: 'Psychiatry', hospital: 'UCLA Health', students: 5, evaluations: 14, rating: 4.4, status: 'active', joinedAt: '2026-05-20' },
  { id: 'd-8', name: 'Dr. Thomas Bennett', specialty: 'Radiology', hospital: 'Mayo Clinic', students: 6, evaluations: 16, rating: 4.5, status: 'active', joinedAt: '2026-06-05' },
  { id: 'd-9', name: 'Dr. Grace Liu', specialty: 'Neurology', hospital: 'Mayo Clinic', students: 4, evaluations: 11, rating: 4.3, status: 'inactive', joinedAt: '2026-06-11' },
  { id: 'd-10', name: 'Dr. Adam Smith', specialty: 'Internal Medicine', hospital: 'Texas Medical Center', students: 6, evaluations: 15, rating: 4.2, status: 'inactive', joinedAt: '2026-04-15' },
  { id: 'd-11', name: 'Dr. Sofia Rodriguez', specialty: 'Family Medicine', hospital: 'Mount Sinai Beth Israel', students: 10, evaluations: 29, rating: 4.7, status: 'active', joinedAt: '2026-02-24' },
  { id: 'd-12', name: 'Dr. James Foster', specialty: 'Emergency Medicine', hospital: 'UCLA Health', students: 9, evaluations: 26, rating: 4.6, status: 'active', joinedAt: '2026-03-30' },
]

export type ReviewerStatus = 'active' | 'busy' | 'on-leave'

export interface ReviewerRecord {
  id: string
  name: string
  assigned: number
  completed: number
  pending: number
  completedToday: number
  avgReviewTime: string
  availability: 'High' | 'Medium' | 'Low'
  accuracy: number
  status: ReviewerStatus
  joinedAt: string
}

export const adminReviewers: ReviewerRecord[] = [
  { id: 'r-1', name: 'Rita Reviewer', assigned: 18, completed: 312, pending: 9, completedToday: 6, avgReviewTime: '1.1 days', availability: 'High', accuracy: 98, status: 'active', joinedAt: '2026-01-10' },
  { id: 'r-2', name: 'Dr. Sarah Kim', assigned: 14, completed: 86, pending: 6, completedToday: 5, avgReviewTime: '1.4 days', availability: 'High', accuracy: 97, status: 'active', joinedAt: '2026-06-18' },
  { id: 'r-3', name: 'Dr. Alan Cross', assigned: 12, completed: 194, pending: 11, completedToday: 3, avgReviewTime: '2.2 days', availability: 'Medium', accuracy: 96, status: 'busy', joinedAt: '2026-02-05' },
  { id: 'r-4', name: 'Dr. Maria Gomez', assigned: 9, completed: 121, pending: 8, completedToday: 4, avgReviewTime: '1.8 days', availability: 'Medium', accuracy: 99, status: 'active', joinedAt: '2026-03-15' },
  { id: 'r-5', name: 'Dr. Ben Carter', assigned: 8, completed: 74, pending: 5, completedToday: 3, avgReviewTime: '1.6 days', availability: 'High', accuracy: 95, status: 'active', joinedAt: '2026-04-22' },
  { id: 'r-6', name: 'Dr. Nia Johnson', assigned: 10, completed: 63, pending: 12, completedToday: 2, avgReviewTime: '2.8 days', availability: 'Low', accuracy: 97, status: 'busy', joinedAt: '2026-05-09' },
  { id: 'r-7', name: 'Dr. Robert Lee', assigned: 6, completed: 41, pending: 4, completedToday: 0, avgReviewTime: '—', availability: 'Low', accuracy: 94, status: 'on-leave', joinedAt: '2026-06-30' },
  { id: 'r-8', name: 'Dr. Amara Diallo', assigned: 7, completed: 28, pending: 6, completedToday: 2, avgReviewTime: '1.9 days', availability: 'Medium', accuracy: 96, status: 'active', joinedAt: '2026-07-21' },
]

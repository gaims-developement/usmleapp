export type DoctorAvailability = 'High' | 'Medium' | 'Low'
export type DoctorStatus = 'active' | 'busy' | 'on_leave'

export interface HospitalDoctor {
  id: string
  name: string
  department: string
  specialty: string
  email: string
  phone: string
  availability: DoctorAvailability
  status: DoctorStatus
  studentsAssigned: number
  currentRotations: number
  joinedAt: string
}

export const hospitalDoctors: HospitalDoctor[] = [
  { id: 'doc-1', name: 'Dr. Alan Cross', department: 'Internal Medicine', specialty: 'General Internal Medicine', email: 'a.cross@stmarys.org', phone: '+1 (415) 668-1001', availability: 'High', status: 'active', studentsAssigned: 4, currentRotations: 2, joinedAt: '2025-03-10' },
  { id: 'doc-2', name: 'Dr. Maria Gomez', department: 'Internal Medicine', specialty: 'Hospital Medicine', email: 'm.gomez@stmarys.org', phone: '+1 (415) 668-1002', availability: 'Medium', status: 'active', studentsAssigned: 3, currentRotations: 2, joinedAt: '2025-05-22' },
  { id: 'doc-3', name: 'Dr. Emily Chen', department: 'Pediatrics', specialty: 'General Pediatrics', email: 'e.chen@stmarys.org', phone: '+1 (415) 668-1003', availability: 'High', status: 'active', studentsAssigned: 3, currentRotations: 2, joinedAt: '2025-01-14' },
  { id: 'doc-4', name: 'Dr. Michael Brown', department: 'Pediatrics', specialty: 'Pediatric Critical Care', email: 'm.brown@stmarys.org', phone: '+1 (415) 668-1004', availability: 'Low', status: 'busy', studentsAssigned: 2, currentRotations: 1, joinedAt: '2025-09-02' },
  { id: 'doc-5', name: 'Dr. Robert King', department: 'General Surgery', specialty: 'General & Trauma Surgery', email: 'r.king@stmarys.org', phone: '+1 (415) 668-1005', availability: 'Medium', status: 'active', studentsAssigned: 3, currentRotations: 2, joinedAt: '2025-02-18' },
  { id: 'doc-6', name: 'Dr. Nia Johnson', department: 'Cardiology', specialty: 'Interventional Cardiology', email: 'n.johnson@stmarys.org', phone: '+1 (415) 668-1006', availability: 'Medium', status: 'busy', studentsAssigned: 2, currentRotations: 2, joinedAt: '2025-04-05' },
  { id: 'doc-7', name: 'Dr. David Lee', department: 'Neurology', specialty: 'Stroke Neurology', email: 'd.lee@stmarys.org', phone: '+1 (415) 668-1007', availability: 'High', status: 'active', studentsAssigned: 3, currentRotations: 1, joinedAt: '2025-06-30' },
  { id: 'doc-8', name: 'Dr. Sarah Patel', department: 'Dermatology', specialty: 'Medical Dermatology', email: 's.patel@stmarys.org', phone: '+1 (415) 668-1008', availability: 'High', status: 'active', studentsAssigned: 2, currentRotations: 1, joinedAt: '2025-08-11' },
  { id: 'doc-9', name: 'Dr. James Wilson', department: 'Obstetrics & Gynecology', specialty: 'Maternal-Fetal Medicine', email: 'j.wilson@stmarys.org', phone: '+1 (415) 668-1009', availability: 'Medium', status: 'active', studentsAssigned: 3, currentRotations: 2, joinedAt: '2025-03-25' },
  { id: 'doc-10', name: 'Dr. Angela Thomas', department: 'Anesthesiology', specialty: 'Regional Anesthesia', email: 'a.thomas@stmarys.org', phone: '+1 (415) 668-1010', availability: 'Low', status: 'on_leave', studentsAssigned: 1, currentRotations: 0, joinedAt: '2025-07-08' },
]

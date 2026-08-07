export interface DoctorProfile {
  name: string
  title: string
  department: string
  specialty: string
  hospital: string
  email: string
  phone: string
  yearsOfExperience: number
  studentsSupervised: number
  completedEvaluations: number
  averageStudentRating: number
  medicalDegree: string
  licenseNumber: string
}

export const doctorProfile: DoctorProfile = {
  name: 'Dr. Alan Cross',
  title: 'Attending Physician',
  department: 'Internal Medicine',
  specialty: 'General Internal Medicine',
  hospital: 'St. Mary\'s University Hospital',
  email: 'a.cross@stmarys.org',
  phone: '+1 (415) 668-1001',
  yearsOfExperience: 12,
  studentsSupervised: 34,
  completedEvaluations: 96,
  averageStudentRating: 4.8,
  medicalDegree: 'MD — University of California, San Francisco',
  licenseNumber: 'CA-114725',
}

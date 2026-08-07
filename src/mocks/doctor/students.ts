export type StageStatus = 'completed' | 'in_progress' | 'pending'

export interface DoctorStudent {
  id: string
  name: string
  country: string
  medicalSchool: string
  graduationYear: number
  usmleProgress: string
  researchExperience: string
  clinicalExperience: string
  department: string
  rotationStart: string
  rotationEnd: string
  progressCount: number
}

export const PROGRESS_STAGES = [
  'Orientation',
  'Ward Posting',
  'Case Presentations',
  'Clinical Skills',
  'Patient Interaction',
  'Final Assessment',
] as const

export type ProgressStage = (typeof PROGRESS_STAGES)[number]

export interface ProgressItem {
  stage: ProgressStage
  status: StageStatus
}

export function buildProgress(count: number): ProgressItem[] {
  return PROGRESS_STAGES.map((stage, i) => ({
    stage,
    status: i < count ? 'completed' : i === count ? 'in_progress' : 'pending',
  }))
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

export interface AttendanceRecord {
  week: number
  status: AttendanceStatus
}

export function buildAttendance(index: number, weeks: number): AttendanceRecord[] {
  const records: AttendanceRecord[] = []
  for (let w = 1; w <= weeks; w += 1) {
    const seed = (index * 3 + w * 5) % 7
    const status: AttendanceStatus =
      seed === 0 || seed === 6 ? 'present' :
      seed === 1 ? 'late' :
      seed === 2 ? 'absent' :
      seed === 3 ? 'excused' : 'present'
    records.push({ week: w, status })
  }
  return records
}

export function attendancePercentage(records: AttendanceRecord[]): number {
  if (records.length === 0) return 0
  const present = records.filter(r => r.status === 'present').length
  const late = records.filter(r => r.status === 'late').length
  return Math.round(((present + late) / records.length) * 100)
}

export const doctorStudents: DoctorStudent[] = [
  { id: 'dstu-1', name: 'Ahmed Hassan', country: 'Egypt', medicalSchool: 'Kasr Al Ainy University', graduationYear: 2027, usmleProgress: 'Step 1 passed (249)', researchExperience: 'Rheumatic heart disease poster', clinicalExperience: '6 weeks — Internal Medicine clerkship', department: 'Internal Medicine', rotationStart: '2026-10-05', rotationEnd: '2026-11-27', progressCount: 3 },
  { id: 'dstu-2', name: 'Aisha Khan', country: 'Pakistan', medicalSchool: 'Aga Khan University', graduationYear: 2027, usmleProgress: 'Step 1 passed (255)', researchExperience: 'Hypertension cohort study', clinicalExperience: '6 weeks — Cardiology elective', department: 'Internal Medicine', rotationStart: '2026-10-05', rotationEnd: '2026-11-27', progressCount: 2 },
  { id: 'dstu-3', name: 'Carlos Mendoza', country: 'Mexico', medicalSchool: 'UNAM', graduationYear: 2028, usmleProgress: 'Step 1 scheduled', researchExperience: 'Case report — dengue', clinicalExperience: '5 weeks — General Medicine', department: 'Internal Medicine', rotationStart: '2026-10-05', rotationEnd: '2026-11-27', progressCount: 1 },
  { id: 'dstu-4', name: 'Elena Petrova', country: 'Bulgaria', medicalSchool: 'Medical University Sofia', graduationYear: 2027, usmleProgress: 'Step 1 passed (241)', researchExperience: 'Sepsis biomarker review', clinicalExperience: '8 weeks — Internal Medicine', department: 'Internal Medicine', rotationStart: '2026-10-05', rotationEnd: '2026-11-27', progressCount: 4 },
  { id: 'dstu-5', name: 'Fatima Al-Sayed', country: 'United Arab Emirates', medicalSchool: 'Khalifa University', graduationYear: 2028, usmleProgress: 'Not taken', researchExperience: 'Diabetes education audit', clinicalExperience: '4 weeks — Family Medicine', department: 'Internal Medicine', rotationStart: '2026-11-02', rotationEnd: '2026-12-18', progressCount: 0 },
  { id: 'dstu-6', name: 'Gabriel Silva', country: 'Brazil', medicalSchool: 'UNIFESP', graduationYear: 2027, usmleProgress: 'Step 1 passed (258)', researchExperience: 'Migraine biomarkers abstract', clinicalExperience: '6 weeks — Neurology elective', department: 'Internal Medicine', rotationStart: '2026-11-02', rotationEnd: '2026-12-18', progressCount: 0 },
  { id: 'dstu-7', name: 'Hana Kim', country: 'South Korea', medicalSchool: 'Seoul National University', graduationYear: 2027, usmleProgress: 'Step 1 passed (262)', researchExperience: 'Diabetes remission cohort', clinicalExperience: '6 weeks — Endocrinology', department: 'Internal Medicine', rotationStart: '2026-10-05', rotationEnd: '2026-11-13', progressCount: 5 },
  { id: 'dstu-8', name: 'Ibrahim Diallo', country: 'Mali', medicalSchool: 'University of Bamako', graduationYear: 2028, usmleProgress: 'Not taken', researchExperience: 'Malaria prophylaxis study', clinicalExperience: '4 weeks — Community Health', department: 'Internal Medicine', rotationStart: '2026-11-02', rotationEnd: '2026-12-18', progressCount: 0 },
  { id: 'dstu-9', name: 'Jing Wei', country: 'China', medicalSchool: 'Peking University', graduationYear: 2027, usmleProgress: 'Step 1 passed (247)', researchExperience: 'COPD phenotyping cohort', clinicalExperience: '8 weeks — Internal Medicine', department: 'Internal Medicine', rotationStart: '2026-10-05', rotationEnd: '2026-11-27', progressCount: 3 },
  { id: 'dstu-10', name: 'Kwame Mensah', country: 'Ghana', medicalSchool: 'University of Ghana', graduationYear: 2028, usmleProgress: 'Step 1 scheduled', researchExperience: 'Sickle cell clinic audit', clinicalExperience: '5 weeks — General Medicine', department: 'Internal Medicine', rotationStart: '2026-10-05', rotationEnd: '2026-11-27', progressCount: 2 },
  { id: 'dstu-11', name: 'Layla Haddad', country: 'Jordan', medicalSchool: 'University of Jordan', graduationYear: 2027, usmleProgress: 'Step 1 passed (244)', researchExperience: 'Hepatic fibrosis case series', clinicalExperience: '6 weeks — Hepatology', department: 'Internal Medicine', rotationStart: '2026-10-05', rotationEnd: '2026-11-27', progressCount: 4 },
  { id: 'dstu-12', name: 'Miguel Santos', country: 'Philippines', medicalSchool: 'University of Santo Tomas', graduationYear: 2028, usmleProgress: 'Not taken', researchExperience: 'Tuberculosis adherence study', clinicalExperience: '4 weeks — Internal Medicine', department: 'Internal Medicine', rotationStart: '2026-11-02', rotationEnd: '2026-12-18', progressCount: 0 },
  { id: 'dstu-13', name: 'Nadia Rahimi', country: 'Iran', medicalSchool: 'Tehran University of Medical Sciences', graduationYear: 2027, usmleProgress: 'Step 1 passed (239)', researchExperience: 'CKD progression model', clinicalExperience: '6 weeks — Nephrology', department: 'Internal Medicine', rotationStart: '2026-10-05', rotationEnd: '2026-11-27', progressCount: 3 },
  { id: 'dstu-14', name: 'Omar Farouk', country: 'Sudan', medicalSchool: 'University of Khartoum', graduationYear: 2028, usmleProgress: 'Step 1 scheduled', researchExperience: 'Cholera outbreak report', clinicalExperience: '4 weeks — General Medicine', department: 'Internal Medicine', rotationStart: '2026-10-05', rotationEnd: '2026-11-27', progressCount: 2 },
  { id: 'dstu-15', name: 'Priya Sharma', country: 'India', medicalSchool: 'AIIMS Delhi', graduationYear: 2027, usmleProgress: 'Step 1 passed (251)', researchExperience: 'Diabetic ketoacidosis case report', clinicalExperience: '6 weeks — Internal Medicine', department: 'Internal Medicine', rotationStart: '2026-10-05', rotationEnd: '2026-11-27', progressCount: 5 },
  { id: 'dstu-16', name: 'Rosa Martinez', country: 'Colombia', medicalSchool: 'Universidad de Antioquia', graduationYear: 2028, usmleProgress: 'Not taken', researchExperience: 'Vector-borne disease review', clinicalExperience: '5 weeks — General Medicine', department: 'Internal Medicine', rotationStart: '2026-11-02', rotationEnd: '2026-12-18', progressCount: 0 },
  { id: 'dstu-17', name: 'Sara Ali', country: 'Pakistan', medicalSchool: 'Dow University', graduationYear: 2027, usmleProgress: 'Step 1 passed (253)', researchExperience: 'Post-op complication review', clinicalExperience: '6 weeks — Internal Medicine', department: 'Internal Medicine', rotationStart: '2026-10-05', rotationEnd: '2026-11-27', progressCount: 4 },
  { id: 'dstu-18', name: 'Tarek Benali', country: 'Morocco', medicalSchool: 'University of Casablanca', graduationYear: 2028, usmleProgress: 'Step 1 scheduled', researchExperience: 'Diabetes foot care audit', clinicalExperience: '4 weeks — General Medicine', department: 'Internal Medicine', rotationStart: '2026-10-05', rotationEnd: '2026-11-27', progressCount: 1 },
  { id: 'dstu-19', name: 'Yuki Tanaka', country: 'Japan', medicalSchool: 'University of Tokyo', graduationYear: 2027, usmleProgress: 'Step 1 passed (246)', researchExperience: 'Hypertension biomarkers', clinicalExperience: '6 weeks — Internal Medicine', department: 'Internal Medicine', rotationStart: '2026-10-05', rotationEnd: '2026-11-27', progressCount: 3 },
  { id: 'dstu-20', name: 'Zainab Ibrahim', country: 'Nigeria', medicalSchool: 'Lagos State University', graduationYear: 2028, usmleProgress: 'Not taken', researchExperience: 'Malaria in pregnancy study', clinicalExperience: '4 weeks — General Medicine', department: 'Internal Medicine', rotationStart: '2026-11-02', rotationEnd: '2026-12-18', progressCount: 0 },
]

export const doctorStudentById = (id: string) => doctorStudents.find(s => s.id === id)

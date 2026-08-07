export type LorStatus = 'draft' | 'pending_review' | 'signed' | 'delivered'

export interface LetterOfRecommendation {
  id: string
  studentId: string
  status: LorStatus
  summary: string
  strengths: string
  body: string
  updatedAt: string
}

export const doctorLetters: LetterOfRecommendation[] = [
  {
    id: 'LOR-1',
    studentId: 'dstu-7',
    status: 'delivered',
    summary: 'Strong endorsement for Internal Medicine residency.',
    strengths: 'Clinical reasoning, reliability, patient communication.',
    body: 'I am pleased to recommend Hana Kim for residency training in Internal Medicine. Over the course of her elective, she demonstrated outstanding clinical acumen, consistently prepared, and communicated with empathy.',
    updatedAt: '2026-11-13',
  },
  {
    id: 'LOR-2',
    studentId: 'dstu-15',
    status: 'signed',
    summary: 'Excellent candidate for a competitive program.',
    strengths: 'Clinical skills, work ethic, patient advocacy.',
    body: 'Priya Sharma is among the top students I have supervised. Her diagnostic ability and commitment to patient-centered care set her apart.',
    updatedAt: '2026-11-12',
  },
  {
    id: 'LOR-3',
    studentId: 'dstu-4',
    status: 'pending_review',
    summary: 'Recommendation for Internal Medicine program.',
    strengths: 'Knowledge base, presentations, teamwork.',
    body: 'Elena Petrova impressed the team with her depth of knowledge and polished case presentations. She actively contributed to patient management discussions.',
    updatedAt: '2026-11-10',
  },
  {
    id: 'LOR-4',
    studentId: 'dstu-1',
    status: 'pending_review',
    summary: 'Supportive recommendation with strong bedside skills.',
    strengths: 'History taking, empathy, punctuality.',
    body: 'Ahmed Hassan is a dependable student with excellent patient rapport. He took ownership of his patients and communicated clearly.',
    updatedAt: '2026-11-08',
  },
  {
    id: 'LOR-5',
    studentId: 'dstu-11',
    status: 'pending_review',
    summary: 'Recommendation emphasizing medical knowledge.',
    strengths: 'Medical knowledge, documentation, presentations.',
    body: 'Layla Haddad demonstrated a deep command of internal medicine topics and produced high-quality documentation throughout the rotation.',
    updatedAt: '2026-11-06',
  },
  {
    id: 'LOR-6',
    studentId: 'dstu-2',
    status: 'draft',
    summary: 'Draft recommendation for Aisha Khan.',
    strengths: 'Communication, patient education, teamwork.',
    body: 'Aisha Khan consistently communicated effectively with patients and the care team, showing strong potential for residency.',
    updatedAt: '2026-11-05',
  },
  {
    id: 'LOR-7',
    studentId: 'dstu-9',
    status: 'draft',
    summary: 'Draft recommendation emphasizing clinical reasoning.',
    strengths: 'Medical knowledge, synthesis, diligence.',
    body: 'Jing Wei showed strong clinical reasoning and a methodical approach to complex patients during the rotation.',
    updatedAt: '2026-11-03',
  },
  {
    id: 'LOR-8',
    studentId: 'dstu-13',
    status: 'draft',
    summary: 'Draft recommendation for a dependable student.',
    strengths: 'Reliability, consistency, teamwork.',
    body: 'Nadia Rahimi was a consistent and dependable member of the team, contributing meaningfully to patient care.',
    updatedAt: '2026-11-02',
  },
  {
    id: 'LOR-9',
    studentId: 'dstu-17',
    status: 'draft',
    summary: 'Draft highlighting procedural aptitude.',
    strengths: 'Procedures, teamwork, diligence.',
    body: 'Sara Ali displayed excellent procedural aptitude and a strong collaborative spirit during the rotation.',
    updatedAt: '2026-11-01',
  },
  {
    id: 'LOR-10',
    studentId: 'dstu-19',
    status: 'draft',
    summary: 'Draft recommendation for Yuki Tanaka.',
    strengths: 'Consistency, documentation, initiative.',
    body: 'Yuki Tanaka showed steady improvement and initiative, taking on independent tasks with supervision.',
    updatedAt: '2026-10-30',
  },
]

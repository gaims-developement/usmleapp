import { reviewerStudents, type ReviewerStudent } from './students'

export const REVIEW_DOC_TYPES = [
  'Passport',
  'Curriculum Vitae',
  'Medical Degree',
  'Transcript',
  'Vaccination Records',
  'USMLE Score Report',
  'English Proficiency',
  'Letters of Recommendation',
  'Statement of Purpose',
] as const

export type ReviewDocType = (typeof REVIEW_DOC_TYPES)[number]

export type DocVerification = 'verified' | 'pending' | 'rejected' | 'requires_update'

export type ReviewerAppStatus =
  | 'submitted'
  | 'under_review'
  | 'changes_requested'
  | 'approved'
  | 'rejected'
  | 'forwarded'

export type ReviewerRecommendation = 'approve' | 'reject' | 'request_changes' | 'forward' | ''

export type ApplicationPriority = 'high' | 'normal' | 'low'

export interface ReviewDocument {
  name: ReviewDocType
  verification: DocVerification
  uploadedAt: string
  note: string
}

export interface EligibilityCheck {
  medicalSchoolVerified: boolean
  graduationVerified: boolean
  passportValid: boolean
  transcriptValid: boolean
  vaccinationComplete: boolean
  englishRequirementMet: boolean
  usmleRequirementMet: boolean
  allDocumentsUploaded: boolean
  applicationComplete: boolean
}

export const ELIGIBILITY_ITEMS: { key: keyof EligibilityCheck; label: string }[] = [
  { key: 'medicalSchoolVerified', label: 'Medical School Verified' },
  { key: 'graduationVerified', label: 'Graduation Verified' },
  { key: 'passportValid', label: 'Passport Valid' },
  { key: 'transcriptValid', label: 'Transcript Valid' },
  { key: 'vaccinationComplete', label: 'Vaccination Complete' },
  { key: 'englishRequirementMet', label: 'English Requirement Met' },
  { key: 'usmleRequirementMet', label: 'USMLE Requirement Met' },
  { key: 'allDocumentsUploaded', label: 'All Documents Uploaded' },
  { key: 'applicationComplete', label: 'Application Complete' },
]

export interface ReviewerApplicationCore {
  id: string
  studentId: string
  hospital: string
  specialty: string
  rotationStart: string
  rotationEnd: string
  duration: string
  programFee: number
  applicationDate: string
  submittedAt: string
  reviewedAt?: string
  reviewMinutes?: number
  priority: ApplicationPriority
  status: ReviewerAppStatus
  documents: ReviewDocument[]
  eligibility: EligibilityCheck
  reviewerNotes: string
  internalNotes: string
  recommendation: ReviewerRecommendation
}

export interface ReviewerApplication extends ReviewerApplicationCore {
  student: ReviewerStudent
}

export const reviewerHospitals = [
  'Mount Sinai Beth Israel',
  'Cleveland Clinic',
  'Johns Hopkins Hospital',
  'Mayo Clinic',
  'UCLA Health',
]

export const reviewerSpecialties = [
  'Internal Medicine',
  'Pediatrics',
  'General Surgery',
  'Cardiology',
  'Neurology',
  'Dermatology',
  'Obstetrics & Gynecology',
  'Anesthesiology',
]

type DocSeed = Partial<Record<ReviewDocType, DocVerification>>
type NoteSeed = Partial<Record<ReviewDocType, string>>

function eligibilityFromDocs(
  docs: ReviewDocument[],
  usmleExempt: boolean,
): EligibilityCheck {
  const verified = (name: ReviewDocType) =>
    docs.find(d => d.name === name)?.verification === 'verified'
  const all = docs.every(d => d.verification === 'verified')
  return {
    medicalSchoolVerified: verified('Medical Degree'),
    graduationVerified: verified('Medical Degree'),
    passportValid: verified('Passport'),
    transcriptValid: verified('Transcript'),
    vaccinationComplete: verified('Vaccination Records'),
    englishRequirementMet: verified('English Proficiency'),
    usmleRequirementMet: usmleExempt || verified('USMLE Score Report'),
    allDocumentsUploaded: all,
    applicationComplete:
      all &&
      (usmleExempt || verified('USMLE Score Report')),
  }
}

const defaultNote = (name: ReviewDocType, v: DocVerification): string => {
  if (v === 'requires_update') return 'Please upload a clearer, full-page scan.'
  if (v === 'rejected') return 'Illegible scan — please re-upload the original document.'
  if (v === 'pending') return 'Awaiting upload from the student.'
  if (name === 'USMLE Score Report' && v === 'verified') return ''
  return ''
}

function mkDocs(
  baseDate: string,
  seed: DocSeed,
  notes: NoteSeed = {},
  usmleExempt = false,
): ReviewDocument[] {
  return REVIEW_DOC_TYPES.map(name => {
    let verification: DocVerification = seed[name] ?? 'verified'
    let note = notes[name] ?? defaultNote(name, verification)
    if (usmleExempt && name === 'USMLE Score Report') {
      verification = 'verified'
      note = 'Not required for this elective — marked exempt.'
    }
    return { name, verification, uploadedAt: baseDate, note }
  })
}

const apps: ReviewerApplicationCore[] = [
  // ── Under review ───────────────────────────────────────────────
  {
    id: 'RV-1001', studentId: 'stu-1', hospital: 'Mount Sinai Beth Israel', specialty: 'Internal Medicine',
    rotationStart: '2026-10-05', rotationEnd: '2026-11-27', duration: '8 weeks', programFee: 2600,
    applicationDate: '2026-07-28', submittedAt: '2026-07-28', priority: 'high', status: 'under_review',
    documents: mkDocs('2026-07-28', { 'Transcript': 'pending', 'Letters of Recommendation': 'pending' }),
    eligibility: eligibilityFromDocs(mkDocs('2026-07-28', { 'Transcript': 'pending', 'Letters of Recommendation': 'pending' }), false),
    reviewerNotes: 'Strong academic record with Step 1 262. Transcript and both LoRs still pending — flagged for follow-up.',
    internalNotes: 'Contacted student on 08-05 to upload transcript. Follow up in 48h.',
    recommendation: 'approve',
  },
  {
    id: 'RV-1002', studentId: 'stu-2', hospital: 'Cleveland Clinic', specialty: 'Pediatrics',
    rotationStart: '2026-11-02', rotationEnd: '2026-12-18', duration: '8 weeks', programFee: 2800,
    applicationDate: '2026-07-25', submittedAt: '2026-07-25', priority: 'normal', status: 'under_review',
    documents: mkDocs('2026-07-25', { 'Vaccination Records': 'pending' }),
    eligibility: eligibilityFromDocs(mkDocs('2026-07-25', { 'Vaccination Records': 'pending' }), false),
    reviewerNotes: 'Documents mostly complete. Vaccination record missing — will verify after upload.',
    internalNotes: 'Track vaccination upload before forwarding.',
    recommendation: '',
  },
  {
    id: 'RV-1003', studentId: 'stu-3', hospital: 'Johns Hopkins Hospital', specialty: 'General Surgery',
    rotationStart: '2026-10-19', rotationEnd: '2026-12-04', duration: '8 weeks', programFee: 3100,
    applicationDate: '2026-07-22', submittedAt: '2026-07-22', priority: 'high', status: 'under_review',
    documents: mkDocs('2026-07-22', { 'English Proficiency': 'pending' }),
    eligibility: eligibilityFromDocs(mkDocs('2026-07-22', { 'English Proficiency': 'pending' }), false),
    reviewerNotes: 'Surgical rotation candidate. Only IELTS score report missing; otherwise complete.',
    internalNotes: 'Cross-check English requirement with hospital policy.',
    recommendation: 'approve',
  },
  {
    id: 'RV-1005', studentId: 'stu-5', hospital: 'Mount Sinai Beth Israel', specialty: 'Internal Medicine',
    rotationStart: '2026-11-09', rotationEnd: '2026-12-18', duration: '6 weeks', programFee: 2200,
    applicationDate: '2026-07-20', submittedAt: '2026-07-20', priority: 'normal', status: 'under_review',
    documents: mkDocs('2026-07-20', { 'Statement of Purpose': 'pending' }),
    eligibility: eligibilityFromDocs(mkDocs('2026-07-20', { 'Statement of Purpose': 'pending' }), false),
    reviewerNotes: 'SOP missing. Step 1 243 within range for this elective.',
    internalNotes: '',
    recommendation: '',
  },
  {
    id: 'RV-1009', studentId: 'stu-9', hospital: 'Mayo Clinic', specialty: 'Neurology',
    rotationStart: '2026-10-12', rotationEnd: '2026-11-20', duration: '6 weeks', programFee: 2900,
    applicationDate: '2026-07-15', submittedAt: '2026-07-15', priority: 'high', status: 'under_review',
    documents: mkDocs('2026-07-15', { 'Passport': 'pending', 'USMLE Score Report': 'pending' }),
    eligibility: eligibilityFromDocs(mkDocs('2026-07-15', { 'Passport': 'pending', 'USMLE Score Report': 'pending' }), false),
    reviewerNotes: 'Passport scan pending and USMLE score report not yet uploaded. Prioritize — start date is soon.',
    internalNotes: 'Deadline risk. Student was emailed on 08-05.',
    recommendation: 'approve',
  },
  // ── Submitted ──────────────────────────────────────────────────
  {
    id: 'RV-1004', studentId: 'stu-4', hospital: 'Cleveland Clinic', specialty: 'Cardiology',
    rotationStart: '2026-12-01', rotationEnd: '2027-01-15', duration: '6 weeks', programFee: 2800,
    applicationDate: '2026-08-02', submittedAt: '2026-08-02', priority: 'normal', status: 'submitted',
    documents: mkDocs('2026-08-02', {}),
    eligibility: eligibilityFromDocs(mkDocs('2026-08-02', {}), false),
    reviewerNotes: '',
    internalNotes: '',
    recommendation: '',
  },
  {
    id: 'RV-1007', studentId: 'stu-7', hospital: 'Mayo Clinic', specialty: 'Internal Medicine',
    rotationStart: '2026-11-16', rotationEnd: '2026-12-18', duration: '5 weeks', programFee: 2400,
    applicationDate: '2026-08-01', submittedAt: '2026-08-01', priority: 'normal', status: 'submitted',
    documents: mkDocs('2026-08-01', { 'Curriculum Vitae': 'pending' }),
    eligibility: eligibilityFromDocs(mkDocs('2026-08-01', { 'Curriculum Vitae': 'pending' }), false),
    reviewerNotes: '',
    internalNotes: '',
    recommendation: '',
  },
  {
    id: 'RV-1014', studentId: 'stu-14', hospital: 'Mayo Clinic', specialty: 'General Surgery',
    rotationStart: '2026-12-07', rotationEnd: '2027-01-15', duration: '6 weeks', programFee: 2900,
    applicationDate: '2026-07-30', submittedAt: '2026-07-30', priority: 'high', status: 'submitted',
    documents: mkDocs('2026-07-30', {}),
    eligibility: eligibilityFromDocs(mkDocs('2026-07-30', {}), false),
    reviewerNotes: '',
    internalNotes: '',
    recommendation: '',
  },
  // ── Changes requested ──────────────────────────────────────────
  {
    id: 'RV-1006', studentId: 'stu-6', hospital: 'UCLA Health', specialty: 'Pediatrics',
    rotationStart: '2026-11-02', rotationEnd: '2026-12-04', duration: '5 weeks', programFee: 2500,
    applicationDate: '2026-07-18', submittedAt: '2026-07-18', priority: 'normal', status: 'changes_requested',
    documents: mkDocs('2026-07-18', { 'Transcript': 'requires_update', 'Vaccination Records': 'requires_update' },
      { 'Transcript': 'Scanned copy is blurry — full transcript required.', 'Vaccination Records': 'Missing hepatitis B series documentation.' }, true),
    eligibility: eligibilityFromDocs(mkDocs('2026-07-18', { 'Transcript': 'requires_update', 'Vaccination Records': 'requires_update' }, {}, true), true),
    reviewerNotes: 'Two blocking documents. Student notified on 08-04.',
    internalNotes: 'Awaiting resubmission for 5 days — send reminder.',
    recommendation: 'request_changes',
  },
  {
    id: 'RV-1008', studentId: 'stu-8', hospital: 'UCLA Health', specialty: 'Family Medicine',
    rotationStart: '2026-12-01', rotationEnd: '2026-12-22', duration: '4 weeks', programFee: 2100,
    applicationDate: '2026-07-16', submittedAt: '2026-07-16', priority: 'normal', status: 'changes_requested',
    documents: mkDocs('2026-07-16', { 'Passport': 'requires_update', 'Vaccination Records': 'requires_update' },
      { 'Passport': 'Expires within 6 months — renewal required.', 'Vaccination Records': 'MMR titer not uploaded.' }, true),
    eligibility: eligibilityFromDocs(mkDocs('2026-07-16', { 'Passport': 'requires_update', 'Vaccination Records': 'requires_update' }, {}, true), true),
    reviewerNotes: 'Passport renewal pending; vaccination record incomplete.',
    internalNotes: 'Re-check passport validity on resubmission.',
    recommendation: 'request_changes',
  },
  {
    id: 'RV-1011', studentId: 'stu-11', hospital: 'Cleveland Clinic', specialty: 'Internal Medicine',
    rotationStart: '2026-11-23', rotationEnd: '2026-12-18', duration: '4 weeks', programFee: 2300,
    applicationDate: '2026-07-14', submittedAt: '2026-07-14', priority: 'normal', status: 'changes_requested',
    documents: mkDocs('2026-07-14', { 'Transcript': 'requires_update', 'English Proficiency': 'requires_update', 'USMLE Score Report': 'requires_update' },
      { 'Transcript': 'Not in English — certified translation required.', 'English Proficiency': 'IELTS score invalidated — please provide TOEFL.', 'USMLE Score Report': 'USMLE Step 1 required for this elective.' }),
    eligibility: eligibilityFromDocs(mkDocs('2026-07-14', { 'Transcript': 'requires_update', 'English Proficiency': 'requires_update', 'USMLE Score Report': 'requires_update' }), false),
    reviewerNotes: 'Multiple blocking documents. Student was contacted on 08-03.',
    internalNotes: '',
    recommendation: 'request_changes',
  },
  {
    id: 'RV-1013', studentId: 'stu-13', hospital: 'UCLA Health', specialty: 'Dermatology',
    rotationStart: '2026-12-07', rotationEnd: '2027-01-08', duration: '6 weeks', programFee: 2700,
    applicationDate: '2026-07-12', submittedAt: '2026-07-12', priority: 'normal', status: 'changes_requested',
    documents: mkDocs('2026-07-12', { 'Curriculum Vitae': 'requires_update', 'USMLE Score Report': 'requires_update' },
      { 'Curriculum Vitae': 'CV must include clinical rotations and publications.', 'USMLE Score Report': 'USMLE Step 1 required for this elective.' }),
    eligibility: eligibilityFromDocs(mkDocs('2026-07-12', { 'Curriculum Vitae': 'requires_update', 'USMLE Score Report': 'requires_update' }), false),
    reviewerNotes: 'Dermatology requires USMLE Step 1 — student needs to upload score.',
    internalNotes: '',
    recommendation: 'request_changes',
  },
  {
    id: 'RV-1016', studentId: 'stu-16', hospital: 'Cleveland Clinic', specialty: 'Anesthesiology',
    rotationStart: '2026-12-14', rotationEnd: '2027-01-22', duration: '6 weeks', programFee: 2600,
    applicationDate: '2026-07-10', submittedAt: '2026-07-10', priority: 'low', status: 'changes_requested',
    documents: mkDocs('2026-07-10', { 'Medical Degree': 'requires_update', 'English Proficiency': 'requires_update', 'USMLE Score Report': 'requires_update' },
      { 'Medical Degree': 'Degree certificate not yet issued — provide provisional certificate.', 'English Proficiency': 'Duolingo accepted? Confirm with hospital.', 'USMLE Score Report': 'USMLE Step 1 required for this elective.' }),
    eligibility: eligibilityFromDocs(mkDocs('2026-07-10', { 'Medical Degree': 'requires_update', 'English Proficiency': 'requires_update', 'USMLE Score Report': 'requires_update' }), false),
    reviewerNotes: 'Provisional degree acceptable for final-year students; pending English + USMLE.',
    internalNotes: '',
    recommendation: 'request_changes',
  },
  // ── Approved ───────────────────────────────────────────────────
  {
    id: 'RV-1017', studentId: 'stu-17', hospital: 'Johns Hopkins Hospital', specialty: 'Obstetrics & Gynecology',
    rotationStart: '2026-10-26', rotationEnd: '2026-12-04', duration: '6 weeks', programFee: 3000,
    applicationDate: '2026-06-30', submittedAt: '2026-06-30', reviewedAt: '2026-08-06', reviewMinutes: 40,
    priority: 'normal', status: 'approved',
    documents: mkDocs('2026-06-30', {}),
    eligibility: eligibilityFromDocs(mkDocs('2026-06-30', {}), false),
    reviewerNotes: 'All documents verified. Graduate with strong maternal-health research background.',
    internalNotes: 'Ready for hospital review.',
    recommendation: 'approve',
  },
  {
    id: 'RV-1019', studentId: 'stu-19', hospital: 'Mayo Clinic', specialty: 'Internal Medicine',
    rotationStart: '2026-11-09', rotationEnd: '2026-12-04', duration: '4 weeks', programFee: 2200,
    applicationDate: '2026-06-25', submittedAt: '2026-06-25', reviewedAt: '2026-08-06', reviewMinutes: 22,
    priority: 'low', status: 'approved',
    documents: mkDocs('2026-06-25', {}),
    eligibility: eligibilityFromDocs(mkDocs('2026-06-25', {}), false),
    reviewerNotes: 'Complete file. No USMLE required for this elective.',
    internalNotes: '',
    recommendation: 'approve',
  },
  {
    id: 'RV-1020', studentId: 'stu-20', hospital: 'Cleveland Clinic', specialty: 'Internal Medicine',
    rotationStart: '2026-10-19', rotationEnd: '2026-11-27', duration: '6 weeks', programFee: 2800,
    applicationDate: '2026-06-20', submittedAt: '2026-06-20', reviewedAt: '2026-08-06', reviewMinutes: 28,
    priority: 'normal', status: 'approved',
    documents: mkDocs('2026-06-20', {}),
    eligibility: eligibilityFromDocs(mkDocs('2026-06-20', {}), false),
    reviewerNotes: 'All requirements met. Recent graduate with publications.',
    internalNotes: '',
    recommendation: 'approve',
  },
  // ── Rejected ───────────────────────────────────────────────────
  {
    id: 'RV-1012', studentId: 'stu-12', hospital: 'Mount Sinai Beth Israel', specialty: 'Pediatrics',
    rotationStart: '2026-11-02', rotationEnd: '2026-11-27', duration: '4 weeks', programFee: 2100,
    applicationDate: '2026-06-28', submittedAt: '2026-06-28', reviewedAt: '2026-08-06', reviewMinutes: 19,
    priority: 'normal', status: 'rejected',
    documents: mkDocs('2026-06-28', { 'Vaccination Records': 'rejected', 'Passport': 'requires_update' },
      { 'Vaccination Records': 'Suspected altered record — rejected after two reviews.', 'Passport': 'No response to update request.' }),
    eligibility: eligibilityFromDocs(mkDocs('2026-06-28', { 'Vaccination Records': 'rejected', 'Passport': 'requires_update' }, {}, false), false),
    reviewerNotes: 'Application closed after 3 unresolved document requests.',
    internalNotes: 'Flag for compliance review before any re-application.',
    recommendation: 'reject',
  },
  {
    id: 'RV-1018', studentId: 'stu-18', hospital: 'Mount Sinai Beth Israel', specialty: 'Cardiology',
    rotationStart: '2026-10-12', rotationEnd: '2026-11-06', duration: '4 weeks', programFee: 2400,
    applicationDate: '2026-06-22', submittedAt: '2026-06-22', reviewedAt: '2026-08-04', reviewMinutes: 15,
    priority: 'normal', status: 'rejected',
    documents: mkDocs('2026-06-22', { 'USMLE Score Report': 'rejected', 'English Proficiency': 'requires_update' },
      { 'USMLE Score Report': 'Score report not verifiable with ECFMG.', 'English Proficiency': 'Expired IELTS certificate.' }),
    eligibility: eligibilityFromDocs(mkDocs('2026-06-22', { 'USMLE Score Report': 'rejected', 'English Proficiency': 'requires_update' }, {}, false), false),
    reviewerNotes: 'USMLE score unverifiable and English certificate expired.',
    internalNotes: 'Student may reapply with updated documents after 60 days.',
    recommendation: 'reject',
  },
  // ── Forwarded ──────────────────────────────────────────────────
  {
    id: 'RV-1010', studentId: 'stu-10', hospital: 'Johns Hopkins Hospital', specialty: 'Pediatrics',
    rotationStart: '2026-10-05', rotationEnd: '2026-11-13', duration: '6 weeks', programFee: 3000,
    applicationDate: '2026-06-18', submittedAt: '2026-06-18', reviewedAt: '2026-08-01', reviewMinutes: 34,
    priority: 'normal', status: 'forwarded',
    documents: mkDocs('2026-06-18', {}),
    eligibility: eligibilityFromDocs(mkDocs('2026-06-18', {}), false),
    reviewerNotes: 'Fully verified. Forwarded to Johns Hopkins for seat confirmation.',
    internalNotes: 'Sent to hospital portal on 08-01.',
    recommendation: 'forward',
  },
  {
    id: 'RV-1015', studentId: 'stu-15', hospital: 'Johns Hopkins Hospital', specialty: 'Internal Medicine',
    rotationStart: '2026-10-12', rotationEnd: '2026-11-20', duration: '6 weeks', programFee: 3000,
    applicationDate: '2026-06-15', submittedAt: '2026-06-15', reviewedAt: '2026-07-30', reviewMinutes: 26,
    priority: 'normal', status: 'forwarded',
    documents: mkDocs('2026-06-15', {}),
    eligibility: eligibilityFromDocs(mkDocs('2026-06-15', {}), false),
    reviewerNotes: 'All documents verified. Forwarded to Johns Hopkins for seat confirmation.',
    internalNotes: '',
    recommendation: 'forward',
  },
]

export const reviewerApplications: ReviewerApplicationCore[] = apps

export function buildReviewerApplication(app: ReviewerApplicationCore): ReviewerApplication {
  const student = reviewerStudents.find(s => s.id === app.studentId)!
  return { ...app, student, documents: app.documents.map(d => ({ ...d })) }
}

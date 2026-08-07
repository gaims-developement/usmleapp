export type HospitalAppStatus =
  | 'awaiting_decision'
  | 'accepted'
  | 'rejected'
  | 'waitlisted'
  | 'scheduled'
  | 'completed'

export interface HospitalApplicationCore {
  id: string
  studentId: string
  programId: string
  status: HospitalAppStatus
  appliedAt: string
  reviewedBy: string
  usmleProgress: string
  clinicalExperience: string
  researchExperience: string
  languages: string[]
  doctorId?: string
  rotationStart?: string
  rotationEnd?: string
  decisionNote?: string
  internalNotes: string
}

const DEFAULTS = {
  reviewedBy: 'Dr. Nia Johnson',
  usmleProgress: 'Step 1 passed (252)',
  clinicalExperience: '6 weeks — Internal Medicine clerkship',
  researchExperience: 'Case report',
  languages: ['English', 'Hindi'] as string[],
  internalNotes: '',
}

let seq = 2100
function a(
  studentId: string,
  programId: string,
  status: HospitalAppStatus,
  opts: Partial<HospitalApplicationCore> = {},
): HospitalApplicationCore {
  seq += 1
  return {
    id: `AP-${seq}`,
    studentId,
    programId,
    status,
    appliedAt: opts.appliedAt ?? '2026-07-25',
    reviewedBy: opts.reviewedBy ?? DEFAULTS.reviewedBy,
    usmleProgress: opts.usmleProgress ?? DEFAULTS.usmleProgress,
    clinicalExperience: opts.clinicalExperience ?? DEFAULTS.clinicalExperience,
    researchExperience: opts.researchExperience ?? DEFAULTS.researchExperience,
    languages: opts.languages ?? DEFAULTS.languages,
    doctorId: opts.doctorId,
    rotationStart: opts.rotationStart,
    rotationEnd: opts.rotationEnd,
    decisionNote: opts.decisionNote,
    internalNotes: opts.internalNotes ?? '',
  }
}

export const hospitalApplications: HospitalApplicationCore[] = [
  // ── Awaiting decision (14) ─────────────────────────────────────
  a('hstu-1', 'PRG-201', 'awaiting_decision', { appliedAt: '2026-08-01', usmleProgress: 'Step 1 passed (262)', clinicalExperience: '6 weeks — Internal Medicine, AIIMS Delhi', researchExperience: 'Case report on diabetic ketoacidosis' }),
  a('hstu-2', 'PRG-209', 'awaiting_decision', { appliedAt: '2026-07-31', usmleProgress: 'Step 1 passed (248)', languages: ['English', 'Hindi', 'Marathi'] }),
  a('hstu-3', 'PRG-205', 'awaiting_decision', { appliedAt: '2026-07-30', usmleProgress: 'Step 1 passed (251)', clinicalExperience: '8 weeks — General Medicine, LASUTH', researchExperience: 'Hypertension screening study', languages: ['English', 'Igbo'] }),
  a('hstu-4', 'PRG-206', 'awaiting_decision', { appliedAt: '2026-07-29', usmleProgress: 'Step 1 passed (255)', clinicalExperience: '6 weeks — Cardiology, Kasr Al Ainy', researchExperience: 'Rheumatic heart disease poster' }),
  a('hstu-5', 'PRG-203', 'awaiting_decision', { appliedAt: '2026-07-28', usmleProgress: 'Step 1 passed (243)', clinicalExperience: '5 weeks — General Surgery, AKUH', languages: ['English', 'Urdu'] }),
  a('hstu-6', 'PRG-203', 'awaiting_decision', { appliedAt: '2026-07-28', usmleProgress: 'Not taken', clinicalExperience: '4 weeks — Obstetrics, DMCH', languages: ['English', 'Bengali'] }),
  a('hstu-7', 'PRG-209', 'awaiting_decision', { appliedAt: '2026-07-27', usmleProgress: 'Step 1 passed (239)', clinicalExperience: '10 weeks — Family Medicine, PGH', languages: ['English', 'Tagalog'] }),
  a('hstu-8', 'PRG-209', 'awaiting_decision', { appliedAt: '2026-07-26', usmleProgress: 'Not taken', clinicalExperience: '6 weeks — Internal Medicine, INC', languages: ['Spanish', 'English'] }),
  a('hstu-9', 'PRG-207', 'awaiting_decision', { appliedAt: '2026-07-25', usmleProgress: 'Step 1 passed (252)', clinicalExperience: '7 weeks — Neurology, HC-FMUSP', researchExperience: 'Migraine biomarkers abstract', languages: ['Portuguese', 'English'] }),
  a('hstu-11', 'PRG-201', 'awaiting_decision', { appliedAt: '2026-07-24', usmleProgress: 'Not taken', clinicalExperience: '5 weeks — Internal Medicine, KNH', languages: ['English', 'Swahili'] }),
  a('hstu-12', 'PRG-208', 'awaiting_decision', { appliedAt: '2026-07-23', usmleProgress: 'Step 1 passed (236)', languages: ['English', 'Nepali'] }),
  a('hstu-14', 'PRG-205', 'awaiting_decision', { appliedAt: '2026-07-22', usmleProgress: 'Step 1 passed (241)', clinicalExperience: '5 weeks — General Surgery, Cho Ray', languages: ['Vietnamese', 'English'] }),
  a('hstu-16', 'PRG-211', 'awaiting_decision', { appliedAt: '2026-07-21', usmleProgress: 'Not taken', clinicalExperience: '6 weeks — Anesthesiology, H12O', languages: ['Spanish', 'English'] }),
  a('hstu-18', 'PRG-206', 'awaiting_decision', { appliedAt: '2026-07-20', usmleProgress: 'Not taken', clinicalExperience: '4 weeks — Cardiology, Mayo Hospital', languages: ['English', 'Urdu'] }),
  // ── Accepted (8) ───────────────────────────────────────────────
  a('hstu-13', 'PRG-208', 'accepted', { appliedAt: '2026-07-18', usmleProgress: 'Not taken', clinicalExperience: '6 weeks — Dermatology, Razi Hospital', languages: ['Persian', 'English'], internalNotes: 'Awaiting doctor assignment.' }),
  a('hstu-15', 'PRG-201', 'accepted', { appliedAt: '2026-07-17', usmleProgress: 'Step 1 passed (244)', clinicalExperience: '8 weeks — Internal Medicine, Soba Hospital', researchExperience: 'Dengue outbreak report', internalNotes: 'Coordinate with Dr. Cross.' }),
  a('hstu-19', 'PRG-201', 'accepted', { appliedAt: '2026-07-16', usmleProgress: 'Not taken', researchExperience: 'Sepsis biomarkers review', languages: ['Bulgarian', 'English'] }),
  a('hstu-21', 'PRG-206', 'accepted', { appliedAt: '2026-07-15', usmleProgress: 'Step 1 passed (260)', clinicalExperience: '8 weeks — Cardiology, SNUH', researchExperience: 'Cath lab outcomes review', languages: ['Korean', 'English'] }),
  a('hstu-22', 'PRG-209', 'accepted', { appliedAt: '2026-07-14', usmleProgress: 'Step 1 passed (240)', languages: ['English', 'Yoruba'] }),
  a('hstu-23', 'PRG-207', 'accepted', { appliedAt: '2026-07-13', usmleProgress: 'Step 1 passed (238)', clinicalExperience: '6 weeks — Neurology, HUN', languages: ['Spanish', 'English'] }),
  a('hstu-24', 'PRG-202', 'accepted', { appliedAt: '2026-07-12', usmleProgress: 'Step 1 passed (247)', clinicalExperience: '6 weeks — Internal Medicine, DUHS', languages: ['English', 'Urdu'] }),
  a('hstu-25', 'PRG-207', 'accepted', { appliedAt: '2026-07-11', usmleProgress: 'Step 1 passed (256)', clinicalExperience: '6 weeks — Neurology, PKUHSC', languages: ['Mandarin', 'English'] }),
  // ── Rejected (7) ───────────────────────────────────────────────
  a('hstu-26', 'PRG-205', 'rejected', { appliedAt: '2026-07-10', decisionNote: 'Surgical experience below minimum; recommend reapplication next cycle.' }),
  a('hstu-27', 'PRG-202', 'rejected', { appliedAt: '2026-07-09', decisionNote: 'USMLE Step 1 score not yet available for sub-internship requirement.' }),
  a('hstu-28', 'PRG-206', 'rejected', { appliedAt: '2026-07-08', decisionNote: 'Cohort full; application declined for this cycle.' }),
  a('hstu-29', 'PRG-201', 'rejected', { appliedAt: '2026-07-07', decisionNote: 'English proficiency score below program threshold.' }),
  a('hstu-30', 'PRG-209', 'rejected', { appliedAt: '2026-07-06', decisionNote: 'Graduation date does not align with rotation window.' }),
  a('hstu-10', 'PRG-203', 'rejected', { appliedAt: '2026-07-05', decisionNote: 'Program preference mismatch; student directed to IM elective.' }),
  a('hstu-3', 'PRG-202', 'rejected', { appliedAt: '2026-07-04', decisionNote: 'Not selected for advanced sub-internship this term.' }),
  // ── Waitlisted (4) ─────────────────────────────────────────────
  a('hstu-17', 'PRG-209', 'waitlisted', { appliedAt: '2026-07-03', decisionNote: 'Placed on waitlist pending seat availability in January cohort.' }),
  a('hstu-2', 'PRG-201', 'waitlisted', { appliedAt: '2026-07-02', decisionNote: 'Waitlisted — second candidate for same rotation window.' }),
  a('hstu-1', 'PRG-202', 'waitlisted', { appliedAt: '2026-07-01', decisionNote: 'Waitlisted for sub-internship; high interest.' }),
  a('hstu-20', 'PRG-206', 'waitlisted', { appliedAt: '2026-06-30', decisionNote: 'Waitlisted pending USMLE Step 2 CK score release.' }),
  // ── Scheduled (12) ─────────────────────────────────────────────
  a('hstu-4', 'PRG-206', 'scheduled', { appliedAt: '2026-06-28', doctorId: 'doc-6', rotationStart: '2026-10-26', rotationEnd: '2026-12-04', internalNotes: 'Confirmed seat — cardiology cohort.' }),
  a('hstu-5', 'PRG-203', 'scheduled', { appliedAt: '2026-06-27', doctorId: 'doc-3', rotationStart: '2026-10-12', rotationEnd: '2026-11-20', internalNotes: '' }),
  a('hstu-7', 'PRG-209', 'scheduled', { appliedAt: '2026-06-26', doctorId: 'doc-9', rotationStart: '2026-10-05', rotationEnd: '2026-11-27', internalNotes: 'Lab preference: nights.' }),
  a('hstu-9', 'PRG-207', 'scheduled', { appliedAt: '2026-06-25', doctorId: 'doc-7', rotationStart: '2026-10-12', rotationEnd: '2026-11-20', internalNotes: '' }),
  a('hstu-10', 'PRG-201', 'scheduled', { appliedAt: '2026-06-24', doctorId: 'doc-1', rotationStart: '2026-10-05', rotationEnd: '2026-11-27', researchExperience: 'Malaria prophylaxis study', internalNotes: 'Reassigned from pediatrics.' }),
  a('hstu-17', 'PRG-201', 'scheduled', { appliedAt: '2026-06-23', doctorId: 'doc-2', rotationStart: '2026-11-02', rotationEnd: '2026-12-18', internalNotes: '' }),
  a('hstu-20', 'PRG-201', 'scheduled', { appliedAt: '2026-06-22', doctorId: 'doc-1', rotationStart: '2026-10-05', rotationEnd: '2026-11-13', researchExperience: 'Diabetes remission cohort', internalNotes: '' }),
  a('hstu-22', 'PRG-203', 'scheduled', { appliedAt: '2026-06-21', doctorId: 'doc-3', rotationStart: '2026-11-09', rotationEnd: '2026-12-18', internalNotes: '' }),
  a('hstu-24', 'PRG-202', 'scheduled', { appliedAt: '2026-06-20', doctorId: 'doc-2', rotationStart: '2026-11-16', rotationEnd: '2027-01-08', internalNotes: 'Sub-intern; night float week 5.' }),
  a('hstu-25', 'PRG-207', 'scheduled', { appliedAt: '2026-06-19', doctorId: 'doc-7', rotationStart: '2026-11-09', rotationEnd: '2026-12-18', internalNotes: '' }),
  a('hstu-28', 'PRG-205', 'scheduled', { appliedAt: '2026-06-18', doctorId: 'doc-5', rotationStart: '2026-10-19', rotationEnd: '2026-12-04', internalNotes: '' }),
  a('hstu-30', 'PRG-205', 'scheduled', { appliedAt: '2026-06-17', doctorId: 'doc-5', rotationStart: '2026-11-16', rotationEnd: '2027-01-08', internalNotes: '' }),
  // ── Completed (5) ──────────────────────────────────────────────
  a('hstu-6', 'PRG-203', 'completed', { appliedAt: '2026-05-10', doctorId: 'doc-3', rotationStart: '2026-06-08', rotationEnd: '2026-07-18', internalNotes: 'Completed on time. Evaluation submitted.' }),
  a('hstu-8', 'PRG-209', 'completed', { appliedAt: '2026-05-08', doctorId: 'doc-9', rotationStart: '2026-06-15', rotationEnd: '2026-07-24', internalNotes: '' }),
  a('hstu-12', 'PRG-208', 'completed', { appliedAt: '2026-05-05', doctorId: 'doc-8', rotationStart: '2026-06-01', rotationEnd: '2026-06-26', internalNotes: '' }),
  a('hstu-13', 'PRG-203', 'completed', { appliedAt: '2026-05-02', doctorId: 'doc-3', rotationStart: '2026-06-22', rotationEnd: '2026-07-30', internalNotes: '' }),
  a('hstu-15', 'PRG-209', 'completed', { appliedAt: '2026-04-28', doctorId: 'doc-9', rotationStart: '2026-06-08', rotationEnd: '2026-07-16', internalNotes: '' }),
]

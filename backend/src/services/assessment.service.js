import { prisma } from '../db/prisma.js'
import { AppError } from '../utils/app-error.js'

/**
 * Workflow records a student's rotation generates for the supervising doctor.
 * Creating them up-front when a doctor is assigned means the doctor's
 * Assessments section (evaluations, certificates, letters) is populated with
 * real drafts they can act on, instead of relying on demo data.
 */

/**
 * Idempotently ensures an Evaluation, Certificate and LetterOfRecommendation
 * exist for the given application. Re-scheduling or re-assigning a doctor must
 * never duplicate these records, so each is only created when absent.
 */
async function ensureAssessmentRecords(applicationId, doctorProfileId) {
  if (!doctorProfileId) return { created: [] }

  const created = []

  const [evaluation, certificate, letter] = await Promise.all([
    prisma.evaluation.findFirst({ where: { applicationId } }),
    prisma.certificate.findFirst({ where: { applicationId } }),
    prisma.letterOfRecommendation.findFirst({ where: { applicationId } }),
  ])

  if (!evaluation) {
    await prisma.evaluation.create({
      data: { applicationId, doctorProfileId, status: 'DRAFT' },
    })
    created.push('evaluation')
  }

  if (!certificate) {
    await prisma.certificate.create({
      data: { applicationId, doctorProfileId, certificateStatus: 'DRAFT' },
    })
    created.push('certificate')
  }

  if (!letter) {
    await prisma.letterOfRecommendation.create({
      data: { applicationId, doctorProfileId, status: 'DRAFT' },
    })
    created.push('letter')
  }

  return { created }
}

/**
 * Creates a student-submitted logbook entry against their assigned rotation.
 * Entries are always created as SUBMITTED so the supervising doctor can
 * approve or reject them through the existing logbook workflow.
 */
async function createStudentLogbookEntry({ applicationId, doctorProfileId, type, description, date }) {
  if (!doctorProfileId) {
    throw new AppError('No doctor has been assigned to this rotation yet', 400, 'DOCTOR_NOT_ASSIGNED')
  }

  const trimmed = String(description ?? '').trim()
  if (!trimmed) {
    throw new AppError('Entry description is required', 400, 'LOGBOOK_DESCRIPTION_REQUIRED')
  }

  const entry = await prisma.logbookEntry.create({
    data: {
      applicationId,
      doctorProfileId,
      entryDate: date ? new Date(`${date}T00:00:00.000Z`) : new Date(),
      type: type ?? 'case_discussion',
      description: trimmed,
      status: 'SUBMITTED',
      comments: null,
    },
    include: {
      application: { include: { studentProfile: { include: { user: true } } } },
    },
  })

  return entry
}

export const assessmentService = {
  ensureAssessmentRecords,
  createStudentLogbookEntry,
}

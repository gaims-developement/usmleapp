import { Router } from 'express'
import { prisma } from '../db/prisma.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { requireRoles } from '../middleware/role.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'
import { AppError } from '../utils/app-error.js'
import { toHospitalDecision, HOSPITAL_DECISION_TO_DB, DATE_ONLY } from '../utils/status-maps.js'
import { notify } from './notification.routes.js'
import { assessmentService } from '../services/assessment.service.js'

export const applicationRouter = Router()

applicationRouter.use(authenticate)

const dateOnly = date => (date ? date.toISOString().slice(0, 10) : '')

// Map DB enum -> frontend status shape
function mapApplicationStatus(dbStatus) {
  switch (dbStatus) {
    case 'DRAFT': return 'withdrawn'
    case 'SUBMITTED': return 'submitted'
    case 'UNDER_REVIEW': return 'under_review'
    case 'CHANGES_REQUESTED': return 'additional_info'
    case 'APPROVED': return 'approved'
    case 'REJECTED': return 'rejected'
    case 'FORWARDED': return 'forwarded'
    case 'AWAITING_DECISION': return 'offered'
    case 'ACCEPTED': return 'offered'
    case 'WAITLISTED': return 'waitlisted'
    case 'SCHEDULED': return 'confirmed'
    case 'COMPLETED': return 'completed'
    default: return 'submitted'
  }
}

// Frontend logbook status shape. Rejected entries follow the existing
// convention of a DRAFT status with comments prefixed "REJECTED: ".
function mapStudentLogbookStatus(entry) {
  if (entry.status === 'APPROVED') return 'approved'
  if ((entry.comments ?? '').startsWith('REJECTED:')) return 'rejected'
  return 'pending'
}

// Build a real timeline from persisted timestamps + status
function buildTimeline(status, submitted, reviewed, decisionDate) {
  const reviewedStatuses = ['under_review', 'additional_info', 'approved', 'rejected', 'forwarded', 'offered', 'waitlisted', 'confirmed', 'completed']
  const decidedStatuses = ['offered', 'rejected', 'waitlisted', 'confirmed', 'completed']

  return [
    { label: 'Application submitted', date: dateOnly(submitted), done: true },
    {
      label: 'Documents reviewed',
      date: dateOnly(reviewed),
      done: Boolean(reviewed) || reviewedStatuses.includes(status),
    },
    {
      label: 'Program review',
      date: reviewedStatuses.includes(status) ? dateOnly(reviewed) : '',
      done: reviewedStatuses.includes(status),
    },
    {
      label: 'Offer decision',
      date: decidedStatuses.includes(status) ? dateOnly(decisionDate ?? reviewed) : '',
      done: decidedStatuses.includes(status),
    },
  ]
}

// GET /api/applications - List applications depending on role
applicationRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const role = req.user.role
    const userId = req.user.id

    if (role === 'STUDENT') {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId },
      })
      if (!studentProfile) {
        return res.json({ success: true, data: [] })
      }

      const applications = await prisma.application.findMany({
        where: { studentProfileId: studentProfile.id },
        include: {
          program: {
            include: { hospital: true },
          },
          documents: true,
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      // Map to frontend shape
      const mapped = applications.map(app => {
        const status = mapApplicationStatus(app.status)
        const submitted = app.submittedAt ?? app.createdAt
        const reviewed = app.reviewedAt ?? null
        const decisionDate = app.decisionNote ? app.reviewedAt : null
        const timeline = buildTimeline(status, submitted, reviewed, decisionDate)

        return {
          id: app.id,
          electiveId: app.programId,
          specialty: app.program.specialty ?? 'General',
          hospital: app.program.hospital.name ?? 'Partner Hospital',
          city: app.program.hospital.city ?? 'Boston',
          state: app.program.hospital.state ?? 'MA',
          status,
          startDate: app.startDate?.toISOString().slice(0, 10) ?? '',
          durationWeeks: app.durationWeeks,
          submittedAt: submitted.toISOString().slice(0, 10),
          reviewedAt: reviewed ? reviewed.toISOString().slice(0, 10) : undefined,
          documentsIncluded: app.documents.map(d => d.name),
          paymentMethod: app.payments[0]?.paymentMethod?.toLowerCase() ?? 'card',
          timeline,
        }
      })

      return res.json({ success: true, data: mapped })
    }

    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      const applications = await prisma.application.findMany({
        where: {
          studentProfile: {
            user: {
              isDemo: req.user.isDemo,
            },
          },
        },
        include: {
          studentProfile: { include: { user: true } },
          program: { include: { hospital: true } },
          reviewerProfile: { include: { user: true } },
          documents: true,
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      const mapped = applications.map(app => ({
        id: app.id,
        student: app.studentProfile.user.name,
        studentId: app.studentProfile.userId,
        hospital: app.program.hospital.name ?? 'Hospital',
        specialty: app.program.specialty ?? 'Specialty',
        status: app.status.toLowerCase(),
        reviewer: app.reviewerProfile?.user.name ?? 'Unassigned',
        amount: app.program.fee ? Number(app.program.fee) : 0,
        submittedAt: app.submittedAt?.toISOString().slice(0, 10) ?? app.createdAt.toISOString().slice(0, 10),
        priority: 'normal',
        flagged: false,
        documentsComplete: app.documents.filter(d => d.verification === 'VERIFIED').length,
        documentsTotal: app.documents.length || 6,
      }))

      return res.json({ success: true, data: mapped })
    }

    if (role === 'REVIEWER') {
      const reviewerProfile = await prisma.reviewerProfile.findUnique({
        where: { userId },
      })
      if (!reviewerProfile) {
        return res.json({ success: true, data: [] })
      }

      const applications = await prisma.application.findMany({
        where: {
          OR: reviewerProfile.hospitalId
            ? [{ reviewerProfileId: reviewerProfile.id }, { program: { hospitalId: reviewerProfile.hospitalId } }]
            : [{ reviewerProfileId: reviewerProfile.id }],
          studentProfile: {
            user: {
              isDemo: req.user.isDemo,
            },
          },
        },
        include: {
          studentProfile: { include: { user: true, documents: true } },
          program: { include: { hospital: true } },
          documents: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      const mapped = applications.map(app => ({
        id: app.id,
        studentId: app.studentProfile.userId,
        hospital: app.program.hospital.name ?? 'Hospital',
        specialty: app.program.specialty ?? 'Specialty',
        rotationStart: app.startDate?.toISOString().slice(0, 10) ?? '',
        rotationEnd: '',
        duration: `${app.durationWeeks} weeks`,
        programFee: app.program.fee ? Number(app.program.fee) : 0,
        applicationDate: app.createdAt.toISOString().slice(0, 10),
        submittedAt: app.submittedAt?.toISOString().slice(0, 10) ?? app.createdAt.toISOString().slice(0, 10),
        reviewedAt: app.reviewedAt?.toISOString().slice(0, 10) ?? '',
        reviewMinutes: app.reviewMinutes ?? undefined,
        priority: 'normal',
        status: app.status.toLowerCase(),
        student: {
          name: app.studentProfile.user.name ?? 'Student',
          email: app.studentProfile.user.email ?? '',
          phone: '',
          country: '',
          medicalSchool: app.studentProfile.college ?? '',
          graduationYear: app.studentProfile.graduationYear ?? 0,
          currentYear: '',
          currentStatus: '',
          usmleStep1: '',
          usmleStep2Ck: '',
          clinicalExperience: '',
          researchExperience: '',
        },
        documents: app.documents.map(d => {
          const uploaded = (app.studentProfile.documents ?? []).find(
            sd => sd.name.toLowerCase() === String(d.name).toLowerCase(),
          )
          return {
            id: uploaded?.id,
            applicationDocumentId: d.id,
            name: d.name,
            verification: d.verification.toLowerCase(),
            uploadedAt: (uploaded?.uploadedAt ?? d.createdAt).toISOString().slice(0, 10),
            note: d.note ?? '',
            fileName: uploaded?.fileName ?? undefined,
            mimeType: uploaded?.mimeType ?? undefined,
          }
        }),
        eligibility: {
          medicalSchoolVerified: app.documents.some(d => d.name === 'Medical School Transcript' && d.verification === 'VERIFIED'),
          graduationVerified: app.documents.some(d => d.name === 'CV / Resume' && d.verification === 'VERIFIED'),
          passportValid: app.documents.some(d => d.name === 'Passport' && d.verification === 'VERIFIED'),
          transcriptValid: app.documents.some(d => d.name === 'Medical School Transcript' && d.verification === 'VERIFIED'),
          vaccinationComplete: app.documents.some(d => d.name === 'Immunization Record' && d.verification === 'VERIFIED'),
          englishRequirementMet: true,
          usmleRequirementMet: true,
          allDocumentsUploaded: app.documents.every(d => d.verification === 'VERIFIED'),
          applicationComplete: app.status === 'APPROVED',
        },
        reviewerNotes: app.internalNotes ?? '',
        internalNotes: app.internalNotes ?? '',
        recommendation: '',
      }))

      return res.json({ success: true, data: mapped })
    }

    if (role === 'HOSPITAL') {
      const hospitalProfile = await prisma.hospitalProfile.findUnique({
        where: { userId },
      })
      if (!hospitalProfile) {
        return res.json({ success: true, data: [] })
      }

      const applications = await prisma.application.findMany({
        where: {
          program: { hospitalId: hospitalProfile.id },
          studentProfile: {
            user: {
              isDemo: req.user.isDemo,
            },
          },
        },
        include: {
          studentProfile: { include: { user: true } },
          program: true,
          doctorProfile: { include: { user: true } },
          reviewerProfile: { include: { user: true } },
          documents: true,
          languages: true,
          rotation: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      const mapped = applications.map(app => ({
        id: app.id,
        studentId: app.studentProfile.userId,
        programId: app.programId,
        status: toHospitalDecision(app.status),
        appliedAt: DATE_ONLY(app.submittedAt ?? app.createdAt),
        startDate: DATE_ONLY(app.startDate),
        durationWeeks: app.durationWeeks,
        doctorId: app.doctorProfileId ?? undefined,
        doctor: app.doctorProfile
          ? {
              id: app.doctorProfile.id,
              name: app.doctorProfile.user.name ?? 'Doctor',
              specialty: app.doctorProfile.specialty ?? '',
            }
          : undefined,
        decisionNote: app.decisionNote ?? '',
        internalNotes: app.internalNotes ?? '',
        reviewedBy: app.reviewerProfile?.user.name ?? 'Review team',
        languages: (app.languages ?? []).map(l => l.language),
        rotationStart: app.rotation ? DATE_ONLY(app.rotation.startDate) : undefined,
        rotationEnd: app.rotation ? DATE_ONLY(app.rotation.endDate) : undefined,
        student: {
          id: app.studentProfile.userId,
          name: app.studentProfile.user.name ?? 'Student',
          country: '',
          medicalSchool: app.studentProfile.college ?? '',
          graduationYear: app.studentProfile.graduationYear ?? undefined,
        },
        program: {
          id: app.programId,
          name: app.program.title ?? 'Rotation Program',
          department: app.program.department ?? '',
          specialty: app.program.specialty ?? '',
          duration: app.program.duration ?? '',
          fee: app.program.fee != null ? Number(app.program.fee) : 0,
        },
        documents: (app.documents ?? []).map(d => ({
          name: d.name,
          verification: d.verification.toLowerCase(),
        })),
      }))

      return res.json({ success: true, data: mapped })
    }

    if (role === 'DOCTOR') {
      const doctorProfile = await prisma.doctorProfile.findUnique({
        where: { userId },
      })
      if (!doctorProfile) {
        return res.json({ success: true, data: [] })
      }

      const applications = await prisma.application.findMany({
        where: { doctorProfileId: doctorProfile.id },
        include: {
          studentProfile: { include: { user: true } },
          program: true,
        },
      })

      const mapped = applications.map(app => ({
        id: app.id,
        studentId: app.studentProfile.userId,
        status: app.status.toLowerCase(),
        rotationStart: app.startDate?.toISOString().slice(0, 10) ?? '',
        rotationEnd: '',
      }))

      return res.json({ success: true, data: mapped })
    }

    return res.json({ success: true, data: [] })
  }),
)

// GET /api/applications/:id - Retrieve a single application (role-scoped)
applicationRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const role = req.user.role
    const userId = req.user.id

    const where = { id }
    if (role === 'STUDENT') {
      const studentProfile = await prisma.studentProfile.findUnique({ where: { userId } })
      if (!studentProfile) throw new AppError('Profile not found', 404, 'PROFILE_NOT_FOUND')
      where.studentProfileId = studentProfile.id
    } else if (role === 'HOSPITAL') {
      const hospitalProfile = await prisma.hospitalProfile.findUnique({ where: { userId } })
      if (!hospitalProfile) throw new AppError('Profile not found', 404, 'PROFILE_NOT_FOUND')
      where.program = { hospitalId: hospitalProfile.id }
    } else if (role === 'REVIEWER') {
      const reviewerProfile = await prisma.reviewerProfile.findUnique({ where: { userId } })
      if (!reviewerProfile) throw new AppError('Profile not found', 404, 'PROFILE_NOT_FOUND')
      where.reviewerProfileId = reviewerProfile.id
    } else if (role === 'DOCTOR') {
      const doctorProfile = await prisma.doctorProfile.findUnique({ where: { userId } })
      if (!doctorProfile) throw new AppError('Profile not found', 404, 'PROFILE_NOT_FOUND')
      where.doctorProfileId = doctorProfile.id
    } else if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      where.studentProfile = { user: { isDemo: req.user.isDemo } }
    }

    const application = await prisma.application.findFirst({
      where,
      include: {
        studentProfile: { include: { user: true } },
        program: { include: { hospital: true } },
        reviewerProfile: { include: { user: true } },
        doctorProfile: { include: { user: true } },
        documents: true,
        languages: true,
        payments: true,
        rotation: true,
      },
    })

    if (!application) {
      throw new AppError('Application not found', 404, 'APPLICATION_NOT_FOUND')
    }

    return res.json({
      success: true,
      data: {
        id: application.id,
        studentId: application.studentProfile.userId,
        programId: application.programId,
        status: toHospitalDecision(application.status),
        appliedAt: DATE_ONLY(application.submittedAt ?? application.createdAt),
        startDate: DATE_ONLY(application.startDate),
        durationWeeks: application.durationWeeks,
        doctorId: application.doctorProfileId ?? undefined,
        decisionNote: application.decisionNote ?? '',
        internalNotes: application.internalNotes ?? '',
        reviewedBy: application.reviewerProfile?.user.name ?? 'Review team',
        languages: (application.languages ?? []).map(l => l.language),
        rotationStart: application.rotation ? DATE_ONLY(application.rotation.startDate) : undefined,
        rotationEnd: application.rotation ? DATE_ONLY(application.rotation.endDate) : undefined,
        student: {
          id: application.studentProfile.userId,
          name: application.studentProfile.user.name ?? 'Student',
          country: '',
          medicalSchool: application.studentProfile.college ?? '',
          graduationYear: application.studentProfile.graduationYear ?? undefined,
        },
        program: {
          id: application.programId,
          name: application.program.title ?? 'Rotation Program',
          department: application.program.department ?? '',
          specialty: application.program.specialty ?? '',
          duration: application.program.duration ?? '',
          fee: application.program.fee != null ? Number(application.program.fee) : 0,
        },
      },
    })
  }),
)

// GET /api/applications/:id/logbook - Student lists their rotation logbook entries
applicationRouter.get(
  '/:id/logbook',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const role = req.user.role
    const userId = req.user.id

    if (role === 'STUDENT') {
      const studentProfile = await prisma.studentProfile.findUnique({ where: { userId } })
      if (!studentProfile) throw new AppError('Profile not found', 404, 'PROFILE_NOT_FOUND')
      const application = await prisma.application.findFirst({
        where: { id, studentProfileId: studentProfile.id },
        include: { doctorProfile: { include: { user: true } } },
      })
      if (!application) throw new AppError('Application not found', 404, 'APPLICATION_NOT_FOUND')

      const entries = await prisma.logbookEntry.findMany({
        where: { applicationId: id },
        orderBy: { entryDate: 'desc' },
      })

      return res.json({
        success: true,
        data: {
          doctor: application.doctorProfile
            ? {
                id: application.doctorProfile.id,
                name: application.doctorProfile.user.name ?? 'Doctor',
                specialty: application.doctorProfile.specialty ?? '',
              }
            : null,
          entries: entries.map(entry => ({
            id: entry.id,
            date: DATE_ONLY(entry.entryDate),
            type: entry.type ?? 'case_discussion',
            description: entry.description ?? '',
            status: mapStudentLogbookStatus(entry),
            comments: entry.comments ?? '',
          })),
        },
      })
    }

    throw new AppError('Only students can access their logbook', 403, 'FORBIDDEN')
  }),
)

// POST /api/applications/:id/logbook - Student submits a logbook entry
applicationRouter.post(
  '/:id/logbook',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const role = req.user.role
    const userId = req.user.id
    const { type, description, date } = req.body

    if (role !== 'STUDENT') {
      throw new AppError('Only students can submit logbook entries', 403, 'FORBIDDEN')
    }

    const studentProfile = await prisma.studentProfile.findUnique({ where: { userId } })
    if (!studentProfile) throw new AppError('Profile not found', 404, 'PROFILE_NOT_FOUND')

    const application = await prisma.application.findFirst({
      where: { id, studentProfileId: studentProfile.id },
      include: { doctorProfile: { include: { user: true } } },
    })
    if (!application) throw new AppError('Application not found', 404, 'APPLICATION_NOT_FOUND')

    const entry = await assessmentService.createStudentLogbookEntry({
      applicationId: id,
      doctorProfileId: application.doctorProfileId,
      type,
      description,
      date,
    })

    if (application.doctorProfile?.userId) {
      await notify(application.doctorProfile.userId, {
        tone: 'INFO',
        title: 'New logbook entry submitted',
        body: 'A student submitted a new logbook entry for your review.',
        applicationId: id,
      })
    }

    return res.status(201).json({
      success: true,
      data: {
        id: entry.id,
        date: DATE_ONLY(entry.entryDate),
        type: entry.type,
        description: entry.description,
        status: mapStudentLogbookStatus(entry),
        comments: entry.comments ?? '',
      },
    })
  }),
)

// POST /api/applications - Submit application
applicationRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const { electiveId, startDate, durationWeeks, documentsIncluded, paymentMethod, transactionId } = req.body
    const userId = req.user.id

    let studentProfile = await prisma.studentProfile.findUnique({
      where: { userId },
    })
    if (!studentProfile) {
      studentProfile = await prisma.studentProfile.create({
        data: { userId },
      })
    }

    const program = await prisma.program.findUnique({
      where: { id: electiveId },
    })
    if (!program) {
      throw new AppError('Elective program not found', 404, 'PROGRAM_NOT_FOUND')
    }

    const app = await prisma.application.create({
      data: {
        studentProfileId: studentProfile.id,
        programId: electiveId,
        status: 'SUBMITTED',
        startDate: new Date(`${startDate}T00:00:00.000Z`),
        durationWeeks,
        submittedAt: new Date(),
        documents: {
          create: documentsIncluded.map(name => ({
            name,
            verification: 'PENDING',
            required: true,
          })),
        },
        payments: {
          create: {
            studentId: userId,
            amount: program.fee ?? 1000,
            paymentMethod: paymentMethod.toUpperCase(),
            transactionId,
            status: 'UNDER_VERIFICATION',
            submittedAt: new Date(),
          },
        },
      },
      include: {
        documents: true,
        payments: true,
        program: { include: { hospital: true } },
      },
    })

    // Create Notification
    await prisma.notification.create({
      data: {
        userId,
        applicationId: app.id,
        tone: 'SUCCESS',
        title: 'Application submitted',
        body: `Your application for ${app.program.title} under ${app.program.hospital?.name ?? 'the hospital'} has been submitted successfully.`,
        details: {
          program: app.program.title,
          hospital: app.program.hospital?.name ?? null,
          submittedAt: app.submittedAt?.toISOString() ?? new Date().toISOString(),
          startDate: app.startDate?.toISOString() ?? null,
          status: 'Submitted',
        },
      },
    })

    return res.json({
      success: true,
      data: {
        id: app.id,
        electiveId: app.programId,
        specialty: app.program.specialty,
        hospital: app.program.hospital.name,
        status: app.status.toLowerCase(),
        submittedAt: app.submittedAt.toISOString().slice(0, 10),
      },
    })
  }),
)

// PATCH /api/applications/:id/withdraw - Withdraw application
applicationRouter.patch(
  '/:id/withdraw',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const userId = req.user.id

    const studentProfile = await prisma.studentProfile.findUnique({ where: { userId } })
    if (!studentProfile) throw new AppError('Profile not found', 404)

    const app = await prisma.application.findFirst({
      where: { id, studentProfileId: studentProfile.id },
      include: { program: { include: { hospital: true } } },
    })
    if (!app) throw new AppError('Application not found', 404)

    const updated = await prisma.application.update({
      where: { id },
      data: { status: 'DRAFT' }, // representing withdrawn/draft on schema or clean status
    })

    await notify(userId, {
      tone: 'INFO',
      title: 'Application withdrawn',
      body: `Your application for ${app.program?.title ?? 'the program'} under ${app.program?.hospital?.name ?? 'the hospital'} has been withdrawn. You can re-apply at any time.`,
      applicationId: id,
      details: {
        program: app.program?.title ?? null,
        hospital: app.program?.hospital?.name ?? null,
        status: 'Withdrawn',
      },
    })

    return res.json({ success: true, data: updated })
  }),
)

// PATCH /api/applications/:id/decide - Decide application (hospital)
applicationRouter.patch(
  '/:id/decide',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const { decision, decisionNote } = req.body

    if (req.user.role === 'HOSPITAL') {
      const hospitalProfile = await prisma.hospitalProfile.findUnique({ where: { userId: req.user.id } })
      if (!hospitalProfile) throw new AppError('Profile not found', 404, 'PROFILE_NOT_FOUND')
      const owned = await prisma.application.findFirst({
        where: {
          id,
          program: { hospitalId: hospitalProfile.id },
        },
      })
      if (!owned) throw new AppError('Application not found', 404, 'APPLICATION_NOT_FOUND')
    }

    const existing = await prisma.application.findUnique({
      where: { id },
      include: { studentProfile: { include: { user: true } }, program: { include: { hospital: true } }, rotation: true },
    })
    if (!existing) throw new AppError('Application not found', 404)

    if (!HOSPITAL_DECISION_TO_DB[decision]) {
      throw new AppError('Invalid decision', 400, 'INVALID_DECISION')
    }

    const updated = await prisma.application.update({
      where: { id },
      data: {
        status: HOSPITAL_DECISION_TO_DB[decision],
        decisionNote: decisionNote !== undefined ? decisionNote : existing.decisionNote,
        reviewedAt: new Date(),
      },
    })

    if (decision === 'scheduled') {
      const rotationData = {
        applicationId: id,
        startDate: req.body.rotationStart ? new Date(`${req.body.rotationStart}T00:00:00.000Z`) : null,
        endDate: req.body.rotationEnd ? new Date(`${req.body.rotationEnd}T00:00:00.000Z`) : null,
      }
      if (req.body.doctorId) {
        const doctor = await prisma.doctorProfile.findUnique({ where: { id: req.body.doctorId } })
        if (doctor) {
          rotationData.doctorProfileId = doctor.id
          await prisma.application.update({ where: { id }, data: { doctorProfileId: doctor.id } })
        }
      }
      if (existing.rotation) {
        await prisma.rotation.update({ where: { id: existing.rotation.id }, data: rotationData })
      } else {
        await prisma.rotation.create({ data: rotationData })
      }
      if (rotationData.doctorProfileId) {
        await assessmentService.ensureAssessmentRecords(id, rotationData.doctorProfileId)
      }
    }

    const decisionKey = decision.toLowerCase()
    const decisionMeta = {
      accepted: { tone: 'SUCCESS', title: 'Application accepted', body: `Great news! Your application for ${existing.program.title} under ${existing.program.hospital?.name ?? 'the hospital'} has been accepted.` },
      rejected: { tone: 'ERROR', title: 'Application not approved', body: `Your application for ${existing.program.title} under ${existing.program.hospital?.name ?? 'the hospital'} was not approved.` },
      waitlisted: { tone: 'WARNING', title: 'You are waitlisted', body: `${existing.program.title} placed you on the waitlist.` },
    }
    const meta = decisionMeta[decisionKey]
    if (meta) {
      await notify(existing.studentProfile.userId, {
        ...meta,
        applicationId: id,
        details: {
          program: existing.program.title,
          hospital: existing.program.hospital?.name ?? null,
          status: decisionKey.charAt(0).toUpperCase() + decisionKey.slice(1),
          ...(decisionNote ? { reason: decisionNote } : {}),
        },
      })
    }

    return res.json({ success: true, data: updated })
  }),
)

// PATCH /api/applications/:id/assign-reviewer - Assign reviewer (admin)
applicationRouter.patch(
  '/:id/assign-reviewer',
  requireRoles('SUPER_ADMIN', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const { reviewer } = req.body // reviewer email or name or ID

    const existing = await prisma.application.findUnique({
      where: { id },
      include: { studentProfile: { include: { user: true } }, program: true },
    })
    if (!existing) throw new AppError('Application not found', 404, 'APPLICATION_NOT_FOUND')

    if (existing.studentProfile.user.isDemo !== req.user.isDemo) {
      throw new AppError('Application not found', 404, 'APPLICATION_NOT_FOUND')
    }

    // Find reviewer user
    const reviewerUser = await prisma.user.findFirst({
      where: {
        OR: [
          { name: reviewer },
          { email: reviewer },
          { id: reviewer },
        ],
        role: { name: 'REVIEWER' },
        isDemo: req.user.isDemo,
      },
      include: { reviewerProfile: true },
    })

    const reviewerProfileId = reviewerUser?.reviewerProfile?.id ?? null

    const updated = await prisma.application.update({
      where: { id },
      data: {
        reviewerProfileId,
        status: 'UNDER_REVIEW',
      },
    })

    if (reviewerUser) {
      await notify(reviewerUser.id, {
        tone: 'INFO',
        title: 'New application assigned',
        body: `${existing.studentProfile.user.name} · ${existing.program?.title ?? 'Elective'} has been assigned to your review queue.`,
        applicationId: id,
      })
    }

    return res.json({ success: true, data: updated })
  }),
)

// PATCH /api/applications/:id/documents/:docId - Update application document verification status
const DOCUMENT_VERIFICATION_MAP = {
  verified: 'VERIFIED',
  pending: 'PENDING',
  requires_update: 'REQUIRES_UPDATE',
  rejected: 'REJECTED',
  needs_attention: 'NEEDS_ATTENTION',
}

applicationRouter.patch(
  '/:id/documents/:docId',
  asyncHandler(async (req, res) => {
    const { id, docId } = req.params
    const { verification, note } = req.body

    if (!docId) {
      throw new AppError('A document ID is required', 400, 'DOCUMENT_ID_REQUIRED')
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: { studentProfile: { include: { user: true } }, program: { include: { hospital: true } } },
    })
    if (!application) throw new AppError('Application not found', 404, 'APPLICATION_NOT_FOUND')

    if (req.user.role === 'REVIEWER') {
      const reviewerProfile = await prisma.reviewerProfile.findUnique({
        where: { userId: req.user.id },
        select: { id: true, hospitalId: true },
      })
      const hospitalScoped =
        reviewerProfile?.hospitalId &&
        application.program.hospitalId &&
        reviewerProfile.hospitalId === application.program.hospitalId
      if (!hospitalScoped && application.reviewerProfileId !== req.user.reviewerProfileId) {
        throw new AppError('Application not found', 404, 'APPLICATION_NOT_FOUND')
      }
    } else if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      throw new AppError('You are not authorized to update this document.', 403, 'DOCUMENT_ACCESS_DENIED')
    } else if (application.studentProfile.user.isDemo !== req.user.isDemo) {
      throw new AppError('Application not found', 404, 'APPLICATION_NOT_FOUND')
    }

    const doc = await prisma.applicationDocument.findFirst({
      where: { id: docId, applicationId: id },
    })

    if (!doc) {
      throw new AppError('Document not found', 404, 'DOCUMENT_NOT_FOUND')
    }

    const nextVerification = verification !== undefined ? DOCUMENT_VERIFICATION_MAP[String(verification).toLowerCase()] : undefined
    if (verification !== undefined && !nextVerification) {
      throw new AppError('Invalid verification status', 400, 'INVALID_STATUS')
    }

    const isRejection = nextVerification === 'REJECTED'
    const reason = isRejection ? (note !== undefined && String(note).trim() ? String(note).trim() : (doc.note ?? '').trim()) : note

    const updated = await prisma.applicationDocument.update({
      where: { id: doc.id },
      data: {
        ...(nextVerification ? { verification: nextVerification } : {}),
        note: note !== undefined ? String(note) : doc.note,
      },
    })

    if (isRejection) {
      const studentDoc = await prisma.studentDocument.findFirst({
        where: { studentProfileId: application.studentProfileId, name: doc.name },
      })

      if (studentDoc) {
        await prisma.studentDocument.update({
          where: { id: studentDoc.id },
          data: {
            status: 'rejected',
            note: reason || studentDoc.note,
            rejectedAt: new Date(),
            rejectedById: req.user.id,
          },
        })
      }

      await notify(application.studentProfile.userId, {
        tone: 'WARNING',
        title: 'Document Rejected',
        body: `Your ${doc.name} was rejected. Reason: ${reason || 'Please upload a clearer scan of this document.'}`,
        applicationId: id,
        documentId: studentDoc?.id ?? null,
      })
    } else if (nextVerification === 'VERIFIED') {
      await prisma.studentDocument.updateMany({
        where: { studentProfileId: application.studentProfileId, name: doc.name },
        data: { status: 'verified', note: null, rejectedAt: null, rejectedById: null },
      })
    }

    return res.json({ success: true, data: updated })
  }),
)

// PATCH /api/applications/:id/reviewer-decision - Reviewer recommendation
applicationRouter.patch(
  '/:id/reviewer-decision',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const { status, recommendation, internalNotes, reviewerNotes } = req.body

    const application = await prisma.application.findUnique({
      where: { id },
      include: { studentProfile: { include: { user: true } }, program: { include: { hospital: true } } },
    })
    if (!application) throw new AppError('Application not found', 404, 'APPLICATION_NOT_FOUND')

    if (req.user.role === 'REVIEWER') {
      const reviewerProfile = await prisma.reviewerProfile.findUnique({
        where: { userId: req.user.id },
        select: { id: true, hospitalId: true },
      })
      const hospitalScoped =
        reviewerProfile?.hospitalId &&
        application.program.hospitalId &&
        reviewerProfile.hospitalId === application.program.hospitalId
      if (!hospitalScoped && application.reviewerProfileId !== req.user.reviewerProfileId) {
        throw new AppError('Application not found', 404, 'APPLICATION_NOT_FOUND')
      }
    } else if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      throw new AppError('Not authorized', 403, 'FORBIDDEN')
    } else if (application.studentProfile.user.isDemo !== req.user.isDemo) {
      throw new AppError('Application not found', 404, 'APPLICATION_NOT_FOUND')
    }

    const allowedStatuses = ['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED', 'FORWARDED']
    const nextStatus = String(status).toUpperCase()
    if (!allowedStatuses.includes(nextStatus)) {
      throw new AppError('Invalid status', 400, 'INVALID_STATUS')
    }

    if (nextStatus === 'FORWARDED' && application.status !== 'APPROVED') {
      throw new AppError('Application must be approved before it can be forwarded to the hospital.', 409, 'MUST_APPROVE_FIRST')
    }

    const existingReview = req.user.reviewerProfileId
      ? await prisma.applicationReview.findFirst({
          where: { applicationId: id, reviewerProfileId: req.user.reviewerProfileId },
        })
      : null

    const updated = await prisma.application.update({
      where: { id },
      data: {
        status: nextStatus,
        internalNotes: internalNotes ?? reviewerNotes ?? null,
        decisionNote: reviewerNotes ?? null,
        reviewedAt: new Date(),
      },
    })

    const recommendationByStatus = {
      APPROVED: 'APPROVE',
      REJECTED: 'REJECT',
      CHANGES_REQUESTED: 'REQUEST_CHANGES',
      FORWARDED: 'FORWARD',
    }
    const frontendToEnumRecommendation = {
      APPROVE: 'APPROVE',
      REJECT: 'REJECT',
      REQUEST_CHANGES: 'REQUEST_CHANGES',
      FORWARD: 'FORWARD',
    }
    let storedRecommendation = null
    if (recommendation != null && String(recommendation).trim() !== '') {
      const normalized = String(recommendation).trim().toUpperCase()
      storedRecommendation = frontendToEnumRecommendation[normalized] ?? null
      if (!storedRecommendation) {
        throw new AppError('Invalid recommendation', 400, 'INVALID_RECOMMENDATION')
      }
    } else {
      storedRecommendation = recommendationByStatus[nextStatus] ?? null
    }

    if (req.user.reviewerProfileId) {
      const reviewData = {
        applicationId: id,
        reviewerProfileId: req.user.reviewerProfileId,
        recommendation: storedRecommendation,
        reviewerNotes: reviewerNotes ?? null,
        internalNotes: internalNotes ?? null,
        reviewedAt: new Date(),
      }
      if (existingReview) {
        await prisma.applicationReview.update({ where: { id: existingReview.id }, data: reviewData })
      } else {
        await prisma.applicationReview.create({ data: reviewData })
      }
    }

    const statusKey = nextStatus.toLowerCase()
    const statusMeta = {
      approved: { tone: 'SUCCESS', title: 'Application approved', body: `Your application for ${application.program.title} under ${application.program.hospital?.name ?? 'the hospital'} has been approved.` },
      rejected: { tone: 'ERROR', title: 'Application not approved', body: `Your application for ${application.program.title} under ${application.program.hospital?.name ?? 'the hospital'} was not approved.` },
      changes_requested: { tone: 'WARNING', title: 'More information needed', body: `The reviewer requested changes on your ${application.program.title} application.` },
      forwarded: { tone: 'INFO', title: 'Application forwarded', body: `Your application for ${application.program.title} under ${application.program.hospital?.name ?? 'the hospital'} has been forwarded for review.` },
    }
    const meta = statusMeta[statusKey]
    if (meta) {
      await notify(application.studentProfile.userId, {
        ...meta,
        applicationId: id,
        details: {
          program: application.program.title,
          hospital: application.program.hospital?.name ?? null,
          status: nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1).toLowerCase(),
          ...(reviewerNotes ? { reason: reviewerNotes } : {}),
        },
      })
    }

    return res.json({ success: true, data: updated })
  }),
)


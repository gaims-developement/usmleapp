import { Router } from 'express'
import { prisma } from '../db/prisma.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'
import { AppError } from '../utils/app-error.js'

export const applicationRouter = Router()

applicationRouter.use(authenticate)

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
      const mapped = applications.map(app => ({
        id: app.id,
        electiveId: app.programId,
        specialty: app.program.specialty ?? 'General',
        hospital: app.program.hospital.name ?? 'Partner Hospital',
        city: app.program.hospital.city ?? 'Boston',
        state: app.program.hospital.state ?? 'MA',
        status: app.status.toLowerCase(), // frontend expects lowercase
        startDate: app.startDate?.toISOString().slice(0, 10) ?? '',
        durationWeeks: app.durationWeeks,
        submittedAt: app.submittedAt?.toISOString().slice(0, 10) ?? app.createdAt.toISOString().slice(0, 10),
        documentsIncluded: app.documents.map(d => d.name),
        paymentMethod: app.payments[0]?.paymentMethod?.toLowerCase() ?? 'card',
        timeline: [
          { label: 'Application submitted', date: app.submittedAt?.toISOString().slice(0, 10) ?? '', done: true },
          { label: 'Documents reviewed', date: app.reviewedAt?.toISOString().slice(0, 10) ?? '', done: !!app.reviewedAt },
          { label: 'Program review', date: '', done: ['accepted', 'rejected', 'confirmed', 'scheduled'].includes(app.status.toLowerCase()) },
          { label: 'Offer decision', date: '', done: ['accepted', 'rejected', 'confirmed'].includes(app.status.toLowerCase()) },
        ],
      }))

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
          reviewerProfileId: reviewerProfile.id,
          studentProfile: {
            user: {
              isDemo: req.user.isDemo,
            },
          },
        },
        include: {
          studentProfile: { include: { user: true } },
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
        priority: 'normal',
        status: app.status.toLowerCase(),
        documents: app.documents.map(d => ({
          name: d.name,
          verification: d.verification.toLowerCase(),
          uploadedAt: d.createdAt.toISOString().slice(0, 10),
          note: d.note ?? '',
        })),
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
          documents: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      const mapped = applications.map(app => ({
        id: app.id,
        studentId: app.studentProfile.userId,
        programId: app.programId,
        status: app.status.toLowerCase(),
        appliedAt: app.submittedAt?.toISOString().slice(0, 10) ?? app.createdAt.toISOString().slice(0, 10),
        startDate: app.startDate?.toISOString().slice(0, 10) ?? '',
        durationWeeks: app.durationWeeks,
        doctorId: app.doctorProfileId ?? undefined,
        languages: [],
        decisionNote: app.decisionNote ?? '',
        internalNotes: app.internalNotes ?? '',
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
        body: `Your application for ${program.title} has been submitted successfully!`,
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
    })
    if (!app) throw new AppError('Application not found', 404)

    const updated = await prisma.application.update({
      where: { id },
      data: { status: 'DRAFT' }, // representing withdrawn/draft on schema or clean status
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

    const updated = await prisma.application.update({
      where: { id },
      data: {
        status: decision.toUpperCase(),
        decisionNote,
      },
    })

    return res.json({ success: true, data: updated })
  }),
)

// PATCH /api/applications/:id/assign-reviewer - Assign reviewer (admin)
applicationRouter.patch(
  '/:id/assign-reviewer',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const { reviewer } = req.body // reviewer email or name or ID

    // Find reviewer user
    const reviewerUser = await prisma.user.findFirst({
      where: {
        OR: [
          { name: reviewer },
          { email: reviewer },
        ],
        role: { name: 'REVIEWER' },
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

    return res.json({ success: true, data: updated })
  }),
)

// PATCH /api/applications/:id/documents/:docName - Update application document verification status
applicationRouter.patch(
  '/:id/documents/:docName',
  asyncHandler(async (req, res) => {
    const { id, docName } = req.params
    const { verification, note } = req.body

    const doc = await prisma.applicationDocument.findFirst({
      where: { applicationId: id, name: docName },
    })

    if (!doc) {
      throw new AppError('Document not found', 404)
    }

    const updated = await prisma.applicationDocument.update({
      where: { id: doc.id },
      data: {
        verification: verification.toUpperCase(),
        note: note !== undefined ? note : doc.note,
      },
    })

    return res.json({ success: true, data: updated })
  }),
)

// PATCH /api/applications/:id/reviewer-decision - Reviewer recommendation
applicationRouter.patch(
  '/:id/reviewer-decision',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const { status, recommendation, internalNotes, reviewerNotes } = req.body

    const updated = await prisma.application.update({
      where: { id },
      data: {
        status: status.toUpperCase(),
        internalNotes: internalNotes ?? reviewerNotes ?? null,
      },
    })

    return res.json({ success: true, data: updated })
  }),
)


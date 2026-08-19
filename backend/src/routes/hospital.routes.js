import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db/prisma.js'
import { asyncHandler } from '../utils/async-handler.js'
import { validate } from '../middleware/validate.middleware.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { requireRoles } from '../middleware/role.middleware.js'
import { AppError } from '../utils/app-error.js'
import { orgService } from '../services/org.service.js'
import { assessmentService } from '../services/assessment.service.js'
import { notify } from './notification.routes.js'
import {
  toHospitalDecision,
  HOSPITAL_DECISION_TO_DB,
  PROGRAM_STATUS_TO_FRONTEND,
  PROGRAM_STATUS_TO_DB,
  DATE_ONLY,
} from '../utils/status-maps.js'

export const hospitalRouter = Router()

hospitalRouter.use(authenticate, requireRoles('HOSPITAL'))

const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1),
  }),
})

const departmentParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
})

const createDoctorSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1),
    specialty: z.string().trim().optional().nullable(),
    department: z.string().trim().optional().nullable(),
    email: z.string().trim().email().optional().nullable(),
    phone: z.string().trim().optional().nullable(),
    availability: z.string().trim().optional().nullable(),
  }),
})

const createProgramSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1),
    specialty: z.string().trim().optional().nullable(),
    department: z.string().trim().optional().nullable(),
    duration: z.string().trim().optional().nullable(),
    fee: z.coerce.number().optional().nullable(),
    status: z.string().trim().optional().nullable(),
    seats: z.coerce.number().optional().nullable(),
    deadline: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    eligibility: z.string().optional().nullable(),
  }),
})

const updateProgramSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z
    .object({
      name: z.string().trim().min(1).optional(),
      specialty: z.string().trim().optional().nullable(),
      department: z.string().trim().optional().nullable(),
      duration: z.string().trim().optional().nullable(),
      fee: z.coerce.number().optional().nullable(),
      status: z.string().trim().optional().nullable(),
      seats: z.coerce.number().optional().nullable(),
      deadline: z.string().optional().nullable(),
      description: z.string().optional().nullable(),
      eligibility: z.string().optional().nullable(),
    })
    .refine(body => Object.keys(body).length > 0, { message: 'No fields to update' }),
})

const createAnnouncementSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1),
    body: z.string().trim().min(1),
    status: z.string().trim().optional(),
    audience: z.string().trim().optional(),
  }),
})

const updateAnnouncementSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    title: z.string().trim().min(1).optional(),
    body: z.string().trim().min(1).optional(),
    status: z.string().trim().optional(),
    audience: z.string().trim().optional(),
  }),
})

const applicationParamsSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
})

const ANNOUNCEMENT_STATUS_TO_DB = { draft: 'DRAFT', published: 'PUBLISHED', archived: 'ARCHIVED' }
const ANNOUNCEMENT_STATUS_TO_FRONTEND = { DRAFT: 'draft', PUBLISHED: 'published', ARCHIVED: 'archived' }
const AUDIENCE_TO_ROLE = { 'All Students': 'STUDENT', Departments: 'HOSPITAL', Coordinators: 'ADMIN' }
const ROLE_TO_AUDIENCE = { STUDENT: 'All Students', HOSPITAL: 'Departments', ADMIN: 'Coordinators' }

function mapProgram(program) {
  return {
    id: program.id,
    name: program.title,
    department: program.department ?? '',
    specialty: program.specialty ?? '',
    duration: program.duration ?? '',
    fee: program.fee != null ? Number(program.fee) : 0,
    seats: program.seats,
    filled: program.filledSeats,
    deadline: DATE_ONLY(program.deadline),
    status: PROGRAM_STATUS_TO_FRONTEND[program.status] ?? 'draft',
    description: program.description ?? '',
    eligibility: program.eligibility ?? '',
    requiredDocuments: (program.requirements ?? []).map(r => r.requirement),
    availableDates: (program.slots ?? []).map(s => DATE_ONLY(s.startDate)).filter(Boolean),
    faculty: (program.faculty ?? []).map(f => f.name),
    createdAt: DATE_ONLY(program.createdAt),
  }
}

function mapDoctor(doctor) {
  return {
    id: doctor.id,
    userId: doctor.userId,
    name: doctor.user.name ?? 'Doctor',
    department: doctor.department?.name ?? '',
    specialty: doctor.specialty ?? '',
    email: doctor.email ?? doctor.user.email,
    phone: doctor.phone ?? '',
    availability: doctor.availability ?? 'Medium',
    status: doctor.status ?? 'active',
    studentsAssigned: doctor.studentsAssigned,
    currentRotations: doctor.currentRotations,
    joinedAt: DATE_ONLY(doctor.joinedAt),
  }
}

function mapStudent(student) {
  return {
    id: student.userId,
    profileId: student.id,
    name: student.user.name ?? 'Student',
    country: '',
    medicalSchool: student.college ?? '',
    graduationYear: student.graduationYear ?? undefined,
  }
}

function mapApplication(app) {
  return {
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
    usmleProgress: '',
    clinicalExperience: '',
    researchExperience: '',
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
  }
}

const hospitalProgramInclude = {
  requirements: true,
  slots: { orderBy: { startDate: 'asc' } },
  faculty: true,
}

const hospitalApplicationInclude = {
  studentProfile: { include: { user: true } },
  program: true,
  doctorProfile: { include: { user: true } },
  reviewerProfile: { include: { user: true } },
  languages: true,
  rotation: true,
}

// GET /api/hospitals/me/organization
hospitalRouter.get(
  '/me/organization',
  asyncHandler(async (req, res) => {
    const data = await orgService.getOrganization(req.user.hospitalProfileId)
    res.json({ success: true, data })
  }),
)

// GET /api/hospitals/me - Hospital profile
hospitalRouter.get(
  '/me',
  asyncHandler(async (req, res) => {
    const hospital = await prisma.hospitalProfile.findUnique({
      where: { id: req.user.hospitalProfileId },
      include: { accreditation: true },
    })
    if (!hospital) throw new AppError('Hospital profile not found', 404, 'HOSPITAL_NOT_FOUND')

    res.json({
      success: true,
      data: {
        id: hospital.id,
        name: hospital.name ?? '',
        tagline: '',
        address: hospital.address ?? '',
        city: hospital.city ?? '',
        country: hospital.country ?? '',
        phone: hospital.phone ?? '',
        email: hospital.email ?? '',
        website: hospital.website ?? '',
        beds: 0,
        staffCount: 0,
        accreditation: hospital.accreditation.map(a => a.label),
        coordinator: {
          name: hospital.coordinatorName ?? '',
          email: hospital.coordinatorEmail ?? '',
          phone: hospital.coordinatorPhone ?? '',
        },
        about: hospital.description ?? '',
        logoColor: '',
      },
    })
  }),
)

// GET /api/hospitals/me/programs
hospitalRouter.get(
  '/me/programs',
  asyncHandler(async (req, res) => {
    const programs = await prisma.program.findMany({
      where: { hospitalId: req.user.hospitalProfileId },
      include: hospitalProgramInclude,
      orderBy: { createdAt: 'desc' },
    })
    res.json({ success: true, data: programs.map(mapProgram) })
  }),
)

// GET /api/hospitals/me/programs/:id
hospitalRouter.get(
  '/me/programs/:id',
  validate(applicationParamsSchema),
  asyncHandler(async (req, res) => {
    const program = await prisma.program.findFirst({
      where: { id: req.params.id, hospitalId: req.user.hospitalProfileId },
      include: hospitalProgramInclude,
    })
    if (!program) throw new AppError('Program not found', 404, 'PROGRAM_NOT_FOUND')
    res.json({ success: true, data: mapProgram(program) })
  }),
)

// POST /api/hospitals/me/programs
hospitalRouter.post(
  '/me/programs',
  validate(createProgramSchema),
  asyncHandler(async (req, res) => {
    const { name, specialty, department, duration, fee, status, seats, deadline, description, eligibility } = req.body
    const program = await prisma.program.create({
      data: {
        hospitalId: req.user.hospitalProfileId,
        creatorId: req.user.id,
        title: name,
        specialty: specialty ?? null,
        department: department ?? null,
        duration: duration ?? null,
        fee: fee ?? 0,
        seats: seats ?? 5,
        deadline: deadline ? new Date(`${deadline}T23:59:59.000Z`) : null,
        description: description ?? null,
        eligibility: eligibility ?? null,
        status: PROGRAM_STATUS_TO_DB[status] ?? 'DRAFT',
      },
      include: hospitalProgramInclude,
    })
    res.status(201).json({ success: true, data: mapProgram(program) })
  }),
)

// PATCH /api/hospitals/me/programs/:id
hospitalRouter.patch(
  '/me/programs/:id',
  validate(updateProgramSchema),
  asyncHandler(async (req, res) => {
    const owned = await prisma.program.findFirst({
      where: { id: req.params.id, hospitalId: req.user.hospitalProfileId },
    })
    if (!owned) throw new AppError('Program not found', 404, 'PROGRAM_NOT_FOUND')

    const { name, specialty, department, duration, fee, status, seats, deadline, description, eligibility } = req.body
    const program = await prisma.program.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined ? { title: name } : {}),
        ...(specialty !== undefined ? { specialty } : {}),
        ...(department !== undefined ? { department } : {}),
        ...(duration !== undefined ? { duration } : {}),
        ...(fee !== undefined ? { fee } : {}),
        ...(seats !== undefined ? { seats } : {}),
        ...(deadline !== undefined ? { deadline: deadline ? new Date(`${deadline}T23:59:59.000Z`) : null } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(eligibility !== undefined ? { eligibility } : {}),
        ...(status !== undefined ? { status: PROGRAM_STATUS_TO_DB[status] ?? owned.status } : {}),
      },
      include: hospitalProgramInclude,
    })
    res.json({ success: true, data: mapProgram(program) })
  }),
)

// PATCH /api/hospitals/me/programs/:id/status
hospitalRouter.patch(
  '/me/programs/:id/status',
  validate(applicationParamsSchema),
  asyncHandler(async (req, res) => {
    const owned = await prisma.program.findFirst({
      where: { id: req.params.id, hospitalId: req.user.hospitalProfileId },
    })
    if (!owned) throw new AppError('Program not found', 404, 'PROGRAM_NOT_FOUND')
    const next = PROGRAM_STATUS_TO_DB[req.body.status] ?? owned.status
    const program = await prisma.program.update({
      where: { id: req.params.id },
      data: { status: next },
      include: hospitalProgramInclude,
    })
    res.json({ success: true, data: mapProgram(program) })
  }),
)

// GET /api/hospitals/me/doctors
hospitalRouter.get(
  '/me/doctors',
  asyncHandler(async (req, res) => {
    const doctors = await prisma.doctorProfile.findMany({
      where: { hospitalId: req.user.hospitalProfileId },
      include: { user: true, department: true },
      orderBy: { joinedAt: 'desc' },
    })
    res.json({ success: true, data: doctors.map(mapDoctor) })
  }),
)

// POST /api/hospitals/me/doctors
hospitalRouter.post(
  '/me/doctors',
  validate(createDoctorSchema),
  asyncHandler(async (req, res) => {
    const { name, specialty, department, email, phone, availability } = req.body

    const doctorRole = await prisma.role.findUnique({ where: { name: 'DOCTOR' } })

    let departmentId = null
    if (department) {
      const existing = await prisma.department.findFirst({
        where: { hospitalId: req.user.hospitalProfileId, name: department },
      })
      departmentId = existing?.id ?? null
    }

    const uniqueEmail = email ?? `doctor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@placeholder.local`

    const user = await prisma.user.create({
      data: {
        name,
        email: uniqueEmail,
        roleId: doctorRole?.id ?? null,
        onboarded: true,
        isDemo: req.user.isDemo,
        doctorProfile: {
          create: {
            hospitalId: req.user.hospitalProfileId,
            departmentId,
            specialty: specialty ?? null,
            title: 'Doctor',
            email: email ?? null,
            phone: phone ?? null,
            availability: availability ?? 'Medium',
            status: 'active',
          },
        },
      },
      include: { doctorProfile: { include: { department: true, user: true } } },
    })

    res.status(201).json({ success: true, data: mapDoctor(user.doctorProfile) })
  }),
)

// GET /api/hospitals/me/students
hospitalRouter.get(
  '/me/students',
  asyncHandler(async (req, res) => {
    const applications = await prisma.application.findMany({
      where: {
        program: { hospitalId: req.user.hospitalProfileId },
        studentProfile: { user: { isDemo: req.user.isDemo } },
      },
      include: { studentProfile: { include: { user: true } } },
    })

    const seen = new Set()
    const students = []
    for (const app of applications) {
      if (seen.has(app.studentProfile.id)) continue
      seen.add(app.studentProfile.id)
      students.push(mapStudent(app.studentProfile))
    }

    res.json({ success: true, data: students })
  }),
)

// GET /api/hospitals/me/applications
hospitalRouter.get(
  '/me/applications',
  asyncHandler(async (req, res) => {
    const applications = await prisma.application.findMany({
      where: {
        program: { hospitalId: req.user.hospitalProfileId },
        studentProfile: { user: { isDemo: req.user.isDemo } },
      },
      include: hospitalApplicationInclude,
      orderBy: { createdAt: 'desc' },
    })
    res.json({ success: true, data: applications.map(mapApplication) })
  }),
)

// GET /api/hospitals/me/applications/:id
hospitalRouter.get(
  '/me/applications/:id',
  validate(applicationParamsSchema),
  asyncHandler(async (req, res) => {
    const application = await prisma.application.findFirst({
      where: {
        id: req.params.id,
        program: { hospitalId: req.user.hospitalProfileId },
        studentProfile: { user: { isDemo: req.user.isDemo } },
      },
      include: hospitalApplicationInclude,
    })
    if (!application) throw new AppError('Application not found', 404, 'APPLICATION_NOT_FOUND')
    res.json({ success: true, data: mapApplication(application) })
  }),
)

// PATCH /api/hospitals/me/applications/:id/decide
hospitalRouter.patch(
  '/me/applications/:id/decide',
  validate(applicationParamsSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const { decision, decisionNote } = req.body

    const application = await prisma.application.findFirst({
      where: { id, program: { hospitalId: req.user.hospitalProfileId } },
      include: { studentProfile: { include: { user: true } }, program: true },
    })
    if (!application) throw new AppError('Application not found', 404, 'APPLICATION_NOT_FOUND')
    if (!HOSPITAL_DECISION_TO_DB[decision]) throw new AppError('Invalid decision', 400, 'INVALID_DECISION')

    const updated = await prisma.application.update({
      where: { id },
      data: {
        status: HOSPITAL_DECISION_TO_DB[decision],
        decisionNote: decisionNote !== undefined ? decisionNote : application.decisionNote,
        reviewedAt: new Date(),
      },
    })

    const joined = await prisma.application.findUnique({ where: { id }, include: hospitalApplicationInclude })
    res.json({ success: true, data: mapApplication(joined) })
  }),
)

// PATCH /api/hospitals/me/applications/:id/schedule
hospitalRouter.patch(
  '/me/applications/:id/schedule',
  validate(applicationParamsSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const { doctorId, start, end } = req.body

    const application = await prisma.application.findFirst({
      where: { id, program: { hospitalId: req.user.hospitalProfileId } },
      include: { rotation: true },
    })
    if (!application) throw new AppError('Application not found', 404, 'APPLICATION_NOT_FOUND')

    let doctorProfileId = application.doctorProfileId
    if (doctorId) {
      const doctor = await prisma.doctorProfile.findFirst({
        where: { id: doctorId, hospitalId: req.user.hospitalProfileId },
      })
      if (!doctor) throw new AppError('Doctor not found', 404, 'DOCTOR_NOT_FOUND')
      doctorProfileId = doctor.id
    }

    await prisma.application.update({
      where: { id },
      data: { status: 'SCHEDULED', doctorProfileId },
    })

    const rotationData = {
      applicationId: id,
      doctorProfileId,
      startDate: start ? new Date(`${start}T00:00:00.000Z`) : null,
      endDate: end ? new Date(`${end}T00:00:00.000Z`) : null,
    }

    if (application.rotation) {
      await prisma.rotation.update({ where: { id: application.rotation.id }, data: rotationData })
    } else {
      await prisma.rotation.create({ data: rotationData })
    }

    if (doctorProfileId) {
      await assessmentService.ensureAssessmentRecords(id, doctorProfileId)
    }

    const joined = await prisma.application.findUnique({ where: { id }, include: hospitalApplicationInclude })
    res.json({ success: true, data: mapApplication(joined) })
  }),
)

// PATCH /api/hospitals/me/applications/:id/notes
hospitalRouter.patch(
  '/me/applications/:id/notes',
  validate(applicationParamsSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const owned = await prisma.application.findFirst({
      where: { id, program: { hospitalId: req.user.hospitalProfileId } },
    })
    if (!owned) throw new AppError('Application not found', 404, 'APPLICATION_NOT_FOUND')

    await prisma.application.update({
      where: { id },
      data: { internalNotes: req.body.notes ?? null },
    })

    const joined = await prisma.application.findUnique({ where: { id }, include: hospitalApplicationInclude })
    res.json({ success: true, data: mapApplication(joined) })
  }),
)

// GET /api/hospitals/me/announcements
hospitalRouter.get(
  '/me/announcements',
  asyncHandler(async (req, res) => {
    const announcements = await prisma.announcement.findMany({
      where: { authorId: req.user.id },
      include: { author: true, audiences: true },
      orderBy: { createdAt: 'desc' },
    })
    res.json({
      success: true,
      data: announcements.map(a => ({
        id: a.id,
        title: a.title,
        body: a.body,
        audience: ROLE_TO_AUDIENCE[a.audiences[0]?.roleName] ?? 'All Students',
        status: ANNOUNCEMENT_STATUS_TO_FRONTEND[a.status] ?? 'draft',
        author: a.author.name,
        publishedAt: a.publishedAt ? DATE_ONLY(a.publishedAt) : '',
      })),
    })
  }),
)

// POST /api/hospitals/me/announcements
hospitalRouter.post(
  '/me/announcements',
  validate(createAnnouncementSchema),
  asyncHandler(async (req, res) => {
    const { title, body, status, audience } = req.body
    const nextStatus = ANNOUNCEMENT_STATUS_TO_DB[status] ?? 'DRAFT'
    const roleName = AUDIENCE_TO_ROLE[audience] ?? 'STUDENT'

    const announcement = await prisma.announcement.create({
      data: {
        authorId: req.user.id,
        creatorId: req.user.id,
        title,
        body,
        status: nextStatus,
        publishedAt: nextStatus === 'PUBLISHED' ? new Date() : null,
        audiences: { create: [{ roleName }] },
      },
      include: { author: true, audiences: true },
    })

    res.status(201).json({
      success: true,
      data: {
        id: announcement.id,
        title: announcement.title,
        body: announcement.body,
        audience: ROLE_TO_AUDIENCE[announcement.audiences[0]?.roleName] ?? 'All Students',
        status: ANNOUNCEMENT_STATUS_TO_FRONTEND[announcement.status] ?? 'draft',
        author: announcement.author.name,
        publishedAt: announcement.publishedAt ? DATE_ONLY(announcement.publishedAt) : '',
      },
    })
  }),
)

// PATCH /api/hospitals/me/announcements/:id
hospitalRouter.patch(
  '/me/announcements/:id',
  validate(updateAnnouncementSchema),
  asyncHandler(async (req, res) => {
    const owned = await prisma.announcement.findFirst({
      where: { id: req.params.id, authorId: req.user.id },
    })
    if (!owned) throw new AppError('Announcement not found', 404, 'ANNOUNCEMENT_NOT_FOUND')

    const { title, body, status, audience } = req.body
    const nextStatus = status ? ANNOUNCEMENT_STATUS_TO_DB[status] : owned.status
    const roleName = audience ? AUDIENCE_TO_ROLE[audience] : null

    const announcement = await prisma.announcement.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(body !== undefined ? { body } : {}),
        ...(nextStatus !== owned.status ? { status: nextStatus } : {}),
        publishedAt:
          nextStatus === 'PUBLISHED' && owned.status !== 'PUBLISHED'
            ? new Date()
            : nextStatus !== 'PUBLISHED'
              ? null
              : owned.publishedAt,
        ...(roleName ? { audiences: { deleteMany: {}, create: [{ roleName }] } } : {}),
      },
      include: { author: true, audiences: true },
    })

    res.json({
      success: true,
      data: {
        id: announcement.id,
        title: announcement.title,
        body: announcement.body,
        audience: ROLE_TO_AUDIENCE[announcement.audiences[0]?.roleName] ?? 'All Students',
        status: ANNOUNCEMENT_STATUS_TO_FRONTEND[announcement.status] ?? 'draft',
        author: announcement.author.name,
        publishedAt: announcement.publishedAt ? DATE_ONLY(announcement.publishedAt) : '',
      },
    })
  }),
)

// DELETE /api/hospitals/me/announcements/:id
hospitalRouter.delete(
  '/me/announcements/:id',
  validate(applicationParamsSchema),
  asyncHandler(async (req, res) => {
    const owned = await prisma.announcement.findFirst({
      where: { id: req.params.id, authorId: req.user.id },
    })
    if (!owned) throw new AppError('Announcement not found', 404, 'ANNOUNCEMENT_NOT_FOUND')
    await prisma.announcement.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  }),
)

// GET /api/hospitals/me/calendar-events
hospitalRouter.get(
  '/me/calendar-events',
  asyncHandler(async (req, res) => {
    const events = await prisma.calendarEvent.findMany({
      where: { hospitalId: req.user.hospitalProfileId },
      orderBy: { startAt: 'asc' },
    })
    res.json({
      success: true,
      data: events.map(e => ({
        id: e.id,
        kind: 'rotation',
        title: e.title,
        date: DATE_ONLY(e.startAt),
        startTime: new Date(e.startAt).toISOString().slice(11, 16),
        endTime: e.endAt ? new Date(e.endAt).toISOString().slice(11, 16) : '',
        location: e.location ?? '',
        notes: e.description ?? '',
      })),
    })
  }),
)

hospitalRouter.post(
  '/me/departments',
  validate(createDepartmentSchema),
  asyncHandler(async (req, res) => {
    const department = await orgService.createDepartment(
      req.user.hospitalProfileId,
      req.body.name,
    )
    res.status(201).json({ success: true, data: department })
  }),
)

hospitalRouter.delete(
  '/me/departments/:id',
  validate(departmentParamsSchema),
  asyncHandler(async (req, res) => {
    const result = await orgService.deleteDepartment(req.user.hospitalProfileId, req.params.id)
    res.json({ success: true, data: result })
  }),
)

hospitalRouter.post(
  '/me/code/regenerate',
  asyncHandler(async (req, res) => {
    const code = await orgService.regenerateHospitalCode(req.user.hospitalProfileId)
    res.json({ success: true, data: code })
  }),
)

// ---------------------------------------------------------------------------
// Hospital approval status
// ---------------------------------------------------------------------------

hospitalRouter.get(
  '/me/status',
  asyncHandler(async (req, res) => {
    const hospital = await prisma.hospitalProfile.findUnique({
      where: { id: req.user.hospitalProfileId },
      select: { status: true, joinedAt: true, name: true },
    })
    if (!hospital) throw new AppError('Hospital profile not found', 404, 'HOSPITAL_NOT_FOUND')
    res.json({ success: true, data: { status: hospital.status, joinedAt: hospital.joinedAt, name: hospital.name } })
  }),
)

// ---------------------------------------------------------------------------
// Pending doctor / reviewer listings (for the approval queue)
// ---------------------------------------------------------------------------

const idParamsSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
})

const approveBodySchema = z.object({
  body: z.object({ message: z.string().optional() }),
})

hospitalRouter.get(
  '/me/pending-doctors',
  asyncHandler(async (req, res) => {
    const doctors = await prisma.doctorProfile.findMany({
      where: { hospitalId: req.user.hospitalProfileId, status: 'pending' },
      include: { user: true, department: true },
      orderBy: { joinedAt: 'desc' },
    })
    res.json({
      success: true,
      data: doctors.map(d => ({
        id: d.id,
        userId: d.userId,
        name: d.user.name,
        email: d.email ?? d.user.email,
        specialty: d.specialty ?? '',
        title: d.title ?? '',
        department: d.department?.name ?? '',
        phone: d.phone ?? '',
        status: d.status ?? 'pending',
        joinedAt: d.joinedAt.toISOString(),
      })),
    })
  }),
)

hospitalRouter.get(
  '/me/pending-reviewers',
  asyncHandler(async (req, res) => {
    const reviewers = await prisma.reviewerProfile.findMany({
      where: { hospitalId: req.user.hospitalProfileId, status: 'pending' },
      include: { user: true },
      orderBy: { joinedAt: 'desc' },
    })
    res.json({
      success: true,
      data: reviewers.map(r => ({
        id: r.id,
        userId: r.userId,
        name: r.user.name,
        email: r.user.email,
        specialty: r.specialty ?? '',
        department: r.department ?? '',
        title: r.title ?? '',
        phone: r.phone ?? '',
        yearsOfExperience: r.yearsOfExperience ?? 0,
        status: r.status ?? 'pending',
        joinedAt: r.joinedAt.toISOString(),
      })),
    })
  }),
)

// ---------------------------------------------------------------------------
// Approve / reject doctors
// ---------------------------------------------------------------------------

hospitalRouter.patch(
  '/me/doctors/:id/approve',
  validate(idParamsSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params

    const hospital = await prisma.hospitalProfile.findUnique({ where: { id: req.user.hospitalProfileId } })
    if (!hospital || hospital.status !== 'active') {
      throw new AppError('Hospital is not approved yet', 403, 'HOSPITAL_NOT_APPROVED')
    }

    const doctor = await prisma.doctorProfile.findFirst({
      where: { id, hospitalId: req.user.hospitalProfileId },
      include: { user: true },
    })
    if (!doctor) throw new AppError('Doctor not found', 404, 'DOCTOR_NOT_FOUND')

    const updated = await prisma.doctorProfile.update({
      where: { id },
      data: { status: 'active' },
    })

    await prisma.partnerRegistration.updateMany({
      where: { registeredById: doctor.userId, status: 'PENDING' },
      data: { status: 'APPROVED', reviewedAt: new Date(), reviewedById: req.user.id },
    })

    await notify(doctor.userId, {
      tone: 'SUCCESS',
      title: 'Doctor Account Approved',
      body: `Your account has been approved by ${hospital.name}. You can now access the doctor dashboard.`,
    })

    res.json({ success: true, data: { ...mapDoctor({ ...doctor, ...updated, user: doctor.user }), status: 'active' } })
  }),
)

hospitalRouter.patch(
  '/me/doctors/:id/reject',
  validate(idParamsSchema),
  validate(approveBodySchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const { message } = req.body

    const doctor = await prisma.doctorProfile.findFirst({
      where: { id, hospitalId: req.user.hospitalProfileId },
      include: { user: true },
    })
    if (!doctor) throw new AppError('Doctor not found', 404, 'DOCTOR_NOT_FOUND')

    await prisma.doctorProfile.update({
      where: { id },
      data: { status: 'rejected' },
    })

    await prisma.partnerRegistration.updateMany({
      where: { registeredById: doctor.userId, status: 'PENDING' },
      data: { status: 'REJECTED', reviewMessage: message || null, reviewedAt: new Date(), reviewedById: req.user.id },
    })

    const hospital = await prisma.hospitalProfile.findUnique({ where: { id: req.user.hospitalProfileId } })
    await notify(doctor.userId, {
      tone: 'WARNING',
      title: 'Doctor Registration Rejected',
      body: message || `Your registration was rejected by ${hospital?.name ?? 'the hospital'}.`,
    })

    res.json({ success: true, data: { id, status: 'rejected' } })
  }),
)

// ---------------------------------------------------------------------------
// Approve / reject reviewers
// ---------------------------------------------------------------------------

hospitalRouter.patch(
  '/me/reviewers/:id/approve',
  validate(idParamsSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params

    const hospital = await prisma.hospitalProfile.findUnique({ where: { id: req.user.hospitalProfileId } })
    if (!hospital || hospital.status !== 'active') {
      throw new AppError('Hospital is not approved yet', 403, 'HOSPITAL_NOT_APPROVED')
    }

    const reviewer = await prisma.reviewerProfile.findFirst({
      where: { id, hospitalId: req.user.hospitalProfileId },
      include: { user: true },
    })
    if (!reviewer) throw new AppError('Reviewer not found', 404, 'REVIEWER_NOT_FOUND')

    await prisma.reviewerProfile.update({
      where: { id },
      data: { status: 'active' },
    })

    await prisma.partnerRegistration.updateMany({
      where: { registeredById: reviewer.userId, status: 'PENDING' },
      data: { status: 'APPROVED', reviewedAt: new Date(), reviewedById: req.user.id },
    })

    await notify(reviewer.userId, {
      tone: 'SUCCESS',
      title: 'Reviewer Account Approved',
      body: `Your account has been approved by ${hospital.name}. You can now access the reviewer dashboard.`,
    })

    res.json({ success: true, data: { id, status: 'active' } })
  }),
)

hospitalRouter.patch(
  '/me/reviewers/:id/reject',
  validate(idParamsSchema),
  validate(approveBodySchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const { message } = req.body

    const reviewer = await prisma.reviewerProfile.findFirst({
      where: { id, hospitalId: req.user.hospitalProfileId },
      include: { user: true },
    })
    if (!reviewer) throw new AppError('Reviewer not found', 404, 'REVIEWER_NOT_FOUND')

    await prisma.reviewerProfile.update({
      where: { id },
      data: { status: 'rejected' },
    })

    await prisma.partnerRegistration.updateMany({
      where: { registeredById: reviewer.userId, status: 'PENDING' },
      data: { status: 'REJECTED', reviewMessage: message || null, reviewedAt: new Date(), reviewedById: req.user.id },
    })

    const hospital = await prisma.hospitalProfile.findUnique({ where: { id: req.user.hospitalProfileId } })
    await notify(reviewer.userId, {
      tone: 'WARNING',
      title: 'Reviewer Registration Rejected',
      body: message || `Your registration was rejected by ${hospital?.name ?? 'the hospital'}.`,
    })

    res.json({ success: true, data: { id, status: 'rejected' } })
  }),
)

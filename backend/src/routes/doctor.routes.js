import { Router } from 'express'
import { prisma } from '../db/prisma.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { requireRoles } from '../middleware/role.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'
import { AppError } from '../utils/app-error.js'
import { notify } from './notification.routes.js'

export const doctorRouter = Router()

doctorRouter.use(authenticate, requireRoles('DOCTOR'))

const DATE_ONLY = value => (value ? new Date(value).toISOString().slice(0, 10) : '')

function relativeTime(date) {
  const diffMs = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function scheduleType(title = '') {
  const t = title.toLowerCase()
  if (t.includes('orient')) return 'orientation'
  if (t.includes('ward')) return 'ward_round'
  if (t.includes('skill')) return 'clinical_skills'
  if (t.includes('eval')) return 'evaluation'
  if (t.includes('feedback')) return 'feedback'
  if (t.includes('lecture')) return 'lecture'
  return 'meeting'
}

function mapCounterpartRole(roleName) {
  switch (roleName) {
    case 'STUDENT': return 'student'
    case 'REVIEWER': return 'coordinator'
    case 'DOCTOR': return 'coordinator'
    default: return 'admin'
  }
}

function mapMessageFrom(senderId, senderRole, myUserId) {
  if (senderId === myUserId) return 'doctor'
  switch (senderRole) {
    case 'STUDENT': return 'student'
    case 'REVIEWER': return 'coordinator'
    case 'DOCTOR': return 'coordinator'
    default: return 'admin'
  }
}

async function requireDoctorProfile(userId) {
  const doctorProfile = await prisma.doctorProfile.findUnique({ where: { userId } })
  if (!doctorProfile) throw new AppError('Doctor profile not found', 404, 'PROFILE_NOT_FOUND')
  return doctorProfile
}

function mapStudent(app) {
  const studentProfile = app.studentProfile
  const user = studentProfile?.user
  const rotation = app.rotation
  return {
    id: user?.id ?? app.studentProfileId,
    name: user?.name ?? 'Student',
    country: '',
    medicalSchool: studentProfile?.college ?? '',
    graduationYear: studentProfile?.graduationYear ?? undefined,
    usmleProgress: 'Not taken',
    researchExperience: '',
    clinicalExperience: '',
    department: app.program?.department ?? app.program?.specialty ?? '',
    rotationStart: DATE_ONLY(rotation?.startDate ?? app.startDate),
    rotationEnd: DATE_ONLY(rotation?.endDate),
    progressCount: 0,
  }
}

function joinedStudent(app) {
  const user = app?.studentProfile?.user
  return { id: user?.id ?? '', name: user?.name ?? 'Unknown', country: '' }
}

const LOG_STATUS = { APPROVED: 'approved', SUBMITTED: 'pending', DRAFT: 'pending' }
const CERT_STATUS = { DRAFT: 'not_started', PENDING_ISSUE: 'generated', ISSUED: 'issued', REVOKED: 'revoked' }
const LOR_STATUS = { DRAFT: 'draft', PENDING_REVIEW: 'pending_review', SIGNED: 'signed', DELIVERED: 'delivered' }

function mapLogbookEntry(entry) {
  const rejected = (entry.comments ?? '').startsWith('REJECTED:')
  return {
    id: entry.id,
    studentId: joinedStudent(entry.application).id,
    date: DATE_ONLY(entry.entryDate ?? entry.createdAt),
    type: entry.type ?? 'case_discussion',
    description: entry.description ?? '',
    status: rejected ? 'rejected' : (LOG_STATUS[entry.status] ?? 'pending'),
    comments: entry.comments ?? '',
    student: joinedStudent(entry.application),
  }
}

function mapEvaluation(evaluation) {
  const scoreMap = {}
  for (const score of evaluation.scores ?? []) {
    scoreMap[score.criterion] = score.score
  }
  return {
    id: evaluation.id,
    studentId: joinedStudent(evaluation.application).id,
    period: 'mid_rotation',
    status: evaluation.status === 'COMPLETED' ? 'completed' : 'draft',
    scores: {
      professionalism: scoreMap.professionalism ?? 3,
      communication: scoreMap.communication ?? 3,
      medicalKnowledge: scoreMap.medicalKnowledge ?? 3,
      clinicalSkills: scoreMap.clinicalSkills ?? 3,
      patientInteraction: scoreMap.patientInteraction ?? 3,
      teamwork: scoreMap.teamwork ?? 3,
      documentation: scoreMap.documentation ?? 3,
    },
    overallPerformance: evaluation.overallPerformance ?? 3,
    strengths: evaluation.strengths ?? '',
    areasForImprovement: evaluation.areasForImprovement ?? '',
    overallComments: evaluation.overallComments ?? '',
    finalRecommendation: evaluation.finalRecommendation ?? 'recommend',
    submittedAt: DATE_ONLY(evaluation.submittedAt) || undefined,
    student: joinedStudent(evaluation.application),
  }
}

function mapCertificate(certificate) {
  return {
    id: certificate.id,
    studentId: joinedStudent(certificate.application).id,
    department: certificate.application?.program?.department ?? '',
    duration: certificate.application?.durationWeeks ? `${certificate.application.durationWeeks} weeks` : '',
    completionStatus: certificate.certificateStatus === 'ISSUED' ? 'completed' : 'in_progress',
    certificateStatus: CERT_STATUS[certificate.certificateStatus] ?? 'not_started',
    completedAt: certificate.issuedAt ? DATE_ONLY(certificate.issuedAt) : undefined,
    issuedAt: certificate.issuedAt ? DATE_ONLY(certificate.issuedAt) : undefined,
    student: joinedStudent(certificate.application),
  }
}

function mapLetter(letter) {
  return {
    id: letter.id,
    studentId: joinedStudent(letter.application).id,
    status: LOR_STATUS[letter.status] ?? 'draft',
    summary: letter.summary ?? '',
    strengths: letter.strengths ?? '',
    body: letter.body ?? '',
    updatedAt: DATE_ONLY(letter.updatedAt ?? letter.createdAt),
    student: joinedStudent(letter.application),
  }
}

async function getConversation(conversationId, myUserId) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        include: { user: { include: { role: true } } },
      },
      messages: {
        include: { sender: { include: { role: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
  if (!conversation) throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND')

  const mine = conversation.participants.find(p => p.userId === myUserId)
  const counterpart = conversation.participants.find(p => p.userId !== myUserId)
  const last = conversation.messages[conversation.messages.length - 1]

  return {
    id: conversation.id,
    counterpartId: counterpart?.user?.id ?? '',
    counterpartName: counterpart?.user?.name ?? 'Staff',
    counterpartRole: mapCounterpartRole(counterpart?.user?.role?.name),
    lastMessage: last?.body ?? '',
    lastTime: last ? relativeTime(last.createdAt) : '',
    unread: mine?.unreadCount ?? 0,
    messages: conversation.messages.map(message => ({
      id: message.id,
      from: mapMessageFrom(message.senderId, message.sender?.role?.name, myUserId),
      text: message.body,
      time: relativeTime(message.createdAt),
      attachment: message.attachmentName
        ? { name: message.attachmentName, size: message.attachmentSize ?? '' }
        : undefined,
    })),
  }
}

// GET /api/doctor/profile - Doctor dashboard profile + computed stats
doctorRouter.get(
  '/profile',
  asyncHandler(async (req, res) => {
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: req.user.id },
      include: { user: true, hospital: true, department: true },
    })
    if (!doctorProfile) throw new AppError('Doctor profile not found', 404, 'PROFILE_NOT_FOUND')

    const studentsSupervised = await prisma.application.count({
      where: { doctorProfileId: doctorProfile.id },
    })
    const completedEvaluations = await prisma.evaluation.count({
      where: { doctorProfileId: doctorProfile.id, status: 'COMPLETED' },
    })

    return res.json({
      success: true,
      data: {
        name: doctorProfile.user.name ?? '',
        title: doctorProfile.title ?? 'Attending Physician',
        department: doctorProfile.department?.name ?? '',
        specialty: doctorProfile.specialty ?? '',
        hospital: doctorProfile.hospital?.name ?? '',
        email: doctorProfile.email ?? doctorProfile.user.email ?? '',
        phone: doctorProfile.phone ?? '',
        yearsOfExperience: 0,
        studentsSupervised,
        completedEvaluations,
        averageStudentRating: 0,
        medicalDegree: '',
        licenseNumber: doctorProfile.licenseNumber ?? '',
      },
    })
  }),
)

// GET /api/doctor/students - Students assigned to this doctor
doctorRouter.get(
  '/students',
  asyncHandler(async (req, res) => {
    const doctorProfile = await requireDoctorProfile(req.user.id)

    const applications = await prisma.application.findMany({
      where: { doctorProfileId: doctorProfile.id },
      include: {
        studentProfile: { include: { user: true } },
        program: true,
        rotation: true,
        logbookEntries: { where: { status: 'APPROVED' } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const data = applications.map(app => {
      const student = mapStudent(app)
      student.progressCount = Math.min(app.logbookEntries.length, 6)
      return student
    })

    return res.json({ success: true, data })
  }),
)

// GET /api/doctor/students/:id - Single student detail for this doctor
doctorRouter.get(
  '/students/:id',
  asyncHandler(async (req, res) => {
    const doctorProfile = await requireDoctorProfile(req.user.id)
    const { id } = req.params

    const application = await prisma.application.findFirst({
      where: {
        doctorProfileId: doctorProfile.id,
        studentProfile: { userId: id },
      },
      include: {
        studentProfile: { include: { user: true } },
        program: true,
        rotation: true,
        logbookEntries: { where: { status: 'APPROVED' } },
      },
    })

    if (!application) throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND')

    const student = mapStudent(application)
    student.progressCount = Math.min(application.logbookEntries.length, 6)

    return res.json({ success: true, data: student })
  }),
)

// GET /api/doctor/schedule - Today's events for this doctor's hospital or created by them
doctorRouter.get(
  '/schedule',
  asyncHandler(async (req, res) => {
    const doctorProfile = await requireDoctorProfile(req.user.id)

    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const where = {
      startAt: { gte: startOfDay, lte: endOfDay },
    }
    if (doctorProfile.hospitalId) {
      where.OR = [{ hospitalId: doctorProfile.hospitalId }, { createdById: req.user.id }]
    } else {
      where.createdById = req.user.id
    }

    const events = await prisma.calendarEvent.findMany({
      where,
      orderBy: { startAt: 'asc' },
    })

    const data = events.map(event => ({
      time: new Date(event.startAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      title: event.title,
      type: scheduleType(event.title),
      location: event.location ?? '',
      studentIds: [],
    }))

    return res.json({ success: true, data })
  }),
)

// GET /api/doctor/upcoming-rotations - Students starting rotations in the future
doctorRouter.get(
  '/upcoming-rotations',
  asyncHandler(async (req, res) => {
    const doctorProfile = await requireDoctorProfile(req.user.id)

    const applications = await prisma.application.findMany({
      where: {
        doctorProfileId: doctorProfile.id,
        rotation: { startDate: { gt: new Date() } },
      },
      include: {
        studentProfile: { include: { user: true } },
        program: true,
        rotation: true,
      },
    })

    const data = applications
      .map(app => ({ student: mapStudent(app), date: DATE_ONLY(app.rotation.startDate) }))
      .filter(item => item.date)
      .sort((a, b) => a.date.localeCompare(b.date))

    return res.json({ success: true, data })
  }),
)

// GET /api/doctor/logbook - Logbook entries for this doctor
doctorRouter.get(
  '/logbook',
  asyncHandler(async (req, res) => {
    const doctorProfile = await requireDoctorProfile(req.user.id)

    const entries = await prisma.logbookEntry.findMany({
      where: { doctorProfileId: doctorProfile.id },
      include: { application: { include: { studentProfile: { include: { user: true } } } } },
      orderBy: { entryDate: 'desc' },
    })

    return res.json({ success: true, data: entries.map(mapLogbookEntry) })
  }),
)

// PATCH /api/doctor/logbook/:id - Approve or reject an entry
doctorRouter.patch(
  '/logbook/:id',
  asyncHandler(async (req, res) => {
    const doctorProfile = await requireDoctorProfile(req.user.id)
    const { id } = req.params
    const { status, comments } = req.body

    const existing = await prisma.logbookEntry.findFirst({
      where: { id, doctorProfileId: doctorProfile.id },
    })
    if (!existing) throw new AppError('Entry not found', 404, 'ENTRY_NOT_FOUND')

    let dbStatus = existing.status
    let dbComments = comments !== undefined ? comments : existing.comments

    if (status === 'approved') {
      dbStatus = 'APPROVED'
      if ((dbComments ?? '').startsWith('REJECTED:')) dbComments = comments ?? ''
    } else if (status === 'rejected') {
      dbStatus = 'DRAFT'
      dbComments = `REJECTED: ${comments ?? 'Not approved'}`
    }

    const updated = await prisma.logbookEntry.update({
      where: { id },
      data: { status: dbStatus, comments: dbComments },
      include: { application: { include: { studentProfile: { include: { user: true } } } } },
    })

    const studentUserId = updated.application.studentProfile?.userId
    if (studentUserId) {
      await notify(studentUserId, {
        tone: dbStatus === 'APPROVED' ? 'SUCCESS' : 'ERROR',
        title: dbStatus === 'APPROVED' ? 'Logbook entry approved' : 'Logbook entry needs revision',
        body:
          dbStatus === 'APPROVED'
            ? 'Your supervising doctor approved your logbook entry.'
            : 'Your supervising doctor asked you to revise a logbook entry.',
        applicationId: updated.applicationId,
      })
    }

    return res.json({ success: true, data: mapLogbookEntry(updated) })
  }),
)

// GET /api/doctor/evaluations - Evaluations for this doctor
doctorRouter.get(
  '/evaluations',
  asyncHandler(async (req, res) => {
    const doctorProfile = await requireDoctorProfile(req.user.id)

    const evaluations = await prisma.evaluation.findMany({
      where: { doctorProfileId: doctorProfile.id },
      include: {
        scores: true,
        application: { include: { studentProfile: { include: { user: true } } } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return res.json({ success: true, data: evaluations.map(mapEvaluation) })
  }),
)

// PATCH /api/doctor/evaluations/:id - Save draft or submit an evaluation
doctorRouter.patch(
  '/evaluations/:id',
  asyncHandler(async (req, res) => {
    const doctorProfile = await requireDoctorProfile(req.user.id)
    const { id } = req.params
    const { submit, scores, overallPerformance, strengths, areasForImprovement, overallComments, finalRecommendation } = req.body

    const existing = await prisma.evaluation.findFirst({
      where: { id, doctorProfileId: doctorProfile.id },
    })
    if (!existing) throw new AppError('Evaluation not found', 404, 'EVALUATION_NOT_FOUND')

    const data = {}
    if (overallPerformance != null) data.overallPerformance = overallPerformance
    if (strengths !== undefined) data.strengths = strengths
    if (areasForImprovement !== undefined) data.areasForImprovement = areasForImprovement
    if (overallComments !== undefined) data.overallComments = overallComments
    if (finalRecommendation) data.finalRecommendation = finalRecommendation
    if (submit) {
      data.status = 'COMPLETED'
      data.submittedAt = new Date()
    }

    await prisma.evaluation.update({ where: { id }, data })

    if (scores) {
      for (const [criterion, value] of Object.entries(scores)) {
        await prisma.evaluationScore.upsert({
          where: { evaluationId_criterion: { evaluationId: id, criterion } },
          update: { score: value },
          create: { evaluationId: id, criterion, score: value },
        })
      }
    }

    const updated = await prisma.evaluation.findUnique({
      where: { id },
      include: {
        scores: true,
        application: { include: { studentProfile: { include: { user: true } } } },
      },
    })

    return res.json({ success: true, data: mapEvaluation(updated) })
  }),
)

// GET /api/doctor/certificates - Certificates for this doctor
doctorRouter.get(
  '/certificates',
  asyncHandler(async (req, res) => {
    const doctorProfile = await requireDoctorProfile(req.user.id)

    const certificates = await prisma.certificate.findMany({
      where: { doctorProfileId: doctorProfile.id },
      include: {
        application: { include: { studentProfile: { include: { user: true } }, program: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.json({ success: true, data: certificates.map(mapCertificate) })
  }),
)

// PATCH /api/doctor/certificates/:id - Generate or issue a certificate
doctorRouter.patch(
  '/certificates/:id',
  asyncHandler(async (req, res) => {
    const doctorProfile = await requireDoctorProfile(req.user.id)
    const { id } = req.params
    const { status } = req.body

    const existing = await prisma.certificate.findFirst({
      where: { id, doctorProfileId: doctorProfile.id },
    })
    if (!existing) throw new AppError('Certificate not found', 404, 'CERTIFICATE_NOT_FOUND')

    let dbStatus = existing.certificateStatus
    if (status === 'generated') dbStatus = 'PENDING_ISSUE'
    else if (status === 'issued') dbStatus = 'ISSUED'

    const updated = await prisma.certificate.update({
      where: { id },
      data: {
        certificateStatus: dbStatus,
        issuedAt: status === 'issued' ? new Date() : existing.issuedAt,
      },
      include: {
        application: { include: { studentProfile: { include: { user: true } }, program: true } },
      },
    })

    return res.json({ success: true, data: mapCertificate(updated) })
  }),
)

// GET /api/doctor/letters - Letters of recommendation for this doctor
doctorRouter.get(
  '/letters',
  asyncHandler(async (req, res) => {
    const doctorProfile = await requireDoctorProfile(req.user.id)

    const letters = await prisma.letterOfRecommendation.findMany({
      where: { doctorProfileId: doctorProfile.id },
      include: { application: { include: { studentProfile: { include: { user: true } } } } },
      orderBy: { updatedAt: 'desc' },
    })

    return res.json({ success: true, data: letters.map(mapLetter) })
  }),
)

// PATCH /api/doctor/letters/:id - Save letter draft or update status
doctorRouter.patch(
  '/letters/:id',
  asyncHandler(async (req, res) => {
    const doctorProfile = await requireDoctorProfile(req.user.id)
    const { id } = req.params
    const { summary, strengths, body, status } = req.body

    const existing = await prisma.letterOfRecommendation.findFirst({
      where: { id, doctorProfileId: doctorProfile.id },
    })
    if (!existing) throw new AppError('Letter not found', 404, 'LETTER_NOT_FOUND')

    const data = { updatedAt: new Date() }
    if (summary !== undefined) data.summary = summary
    if (strengths !== undefined) data.strengths = strengths
    if (body !== undefined) data.body = body
    if (status) {
      const dbStatus = { draft: 'DRAFT', pending_review: 'PENDING_REVIEW', signed: 'SIGNED', delivered: 'DELIVERED' }[status]
      if (!dbStatus) throw new AppError('Invalid letter status', 400, 'INVALID_STATUS')
      data.status = dbStatus
    }

    const updated = await prisma.letterOfRecommendation.update({
      where: { id },
      data,
      include: { application: { include: { studentProfile: { include: { user: true } } } } },
    })

    return res.json({ success: true, data: mapLetter(updated) })
  }),
)

// GET /api/doctor/conversations - Conversations this doctor participates in
doctorRouter.get(
  '/conversations',
  asyncHandler(async (req, res) => {
    const participations = await prisma.conversationParticipant.findMany({
      where: { userId: req.user.id },
      include: {
        conversation: {
          include: {
            participants: { include: { user: { include: { role: true } } } },
            messages: { include: { sender: { include: { role: true } } }, orderBy: { createdAt: 'asc' } },
          },
        },
      },
    })

    const data = participations
      .map(participation => {
        const conversation = participation.conversation
        const counterpart = conversation.participants.find(p => p.userId !== req.user.id)
        const last = conversation.messages[conversation.messages.length - 1]
        return {
          id: conversation.id,
          counterpartId: counterpart?.user?.id ?? '',
          counterpartName: counterpart?.user?.name ?? 'Staff',
          counterpartRole: mapCounterpartRole(counterpart?.user?.role?.name),
          lastMessage: last?.body ?? '',
          lastTime: last ? relativeTime(last.createdAt) : '',
          unread: participation.unreadCount,
          messages: conversation.messages.map(message => ({
            id: message.id,
            from: mapMessageFrom(message.senderId, message.sender?.role?.name, req.user.id),
            text: message.body,
            time: relativeTime(message.createdAt),
            attachment: message.attachmentName
              ? { name: message.attachmentName, size: message.attachmentSize ?? '' }
              : undefined,
          })),
        }
      })
      .sort((a, b) => b.lastTime.localeCompare(a.lastTime))

    return res.json({ success: true, data })
  }),
)

// POST /api/doctor/conversations - Send a message (existing thread or new with a student)
doctorRouter.post(
  '/conversations',
  asyncHandler(async (req, res) => {
    const { conversationId, studentId, text, attachment } = req.body
    if (!text || !String(text).trim()) throw new AppError('Message text is required', 400, 'INVALID_MESSAGE')

    if (conversationId) {
      const mine = await prisma.conversationParticipant.findFirst({
        where: { conversationId, userId: req.user.id },
      })
      if (!mine) throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND')

      await prisma.message.create({
        data: {
          conversationId,
          senderId: req.user.id,
          body: String(text).trim(),
          attachmentName: attachment?.name ?? null,
          attachmentSize: attachment?.size ?? null,
        },
      })
      await prisma.conversationParticipant.updateMany({
        where: { conversationId, userId: req.user.id },
        data: { unreadCount: 0 },
      })
      await prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } })

      const data = await getConversation(conversationId, req.user.id)
      return res.json({ success: true, data })
    }

    if (studentId) {
      const doctorProfile = await requireDoctorProfile(req.user.id)
      const application = await prisma.application.findFirst({
        where: { doctorProfileId: doctorProfile.id, studentProfile: { userId: studentId } },
      })
      if (!application) throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND')

      const studentUser = await prisma.user.findUnique({ where: { id: studentId } })
      if (!studentUser) throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND')

      let conversation = await prisma.conversation.findFirst({
        where: {
          applicationId: application.id,
          conversationType: 'DIRECT',
          participants: { some: { userId: req.user.id } },
        },
      })

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            applicationId: application.id,
            conversationType: 'DIRECT',
            participants: {
              create: [
                { userId: req.user.id, unreadCount: 0 },
                { userId: studentId, unreadCount: 0 },
              ],
            },
            messages: {
              create: { senderId: req.user.id, body: String(text).trim() },
            },
          },
        })
      } else {
        await prisma.message.create({
          data: { conversationId: conversation.id, senderId: req.user.id, body: String(text).trim() },
        })
        await prisma.conversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } })
      }

      const data = await getConversation(conversation.id, req.user.id)
      return res.json({ success: true, data })
    }

    throw new AppError('A conversation or student is required', 400, 'INVALID_TARGET')
  }),
)

// PATCH /api/doctor/conversations/:id/read - Mark a conversation read
doctorRouter.patch(
  '/conversations/:id/read',
  asyncHandler(async (req, res) => {
    const { id } = req.params

    await prisma.conversationParticipant.updateMany({
      where: { conversationId: id, userId: req.user.id },
      data: { unreadCount: 0 },
    })

    const data = await getConversation(id, req.user.id)
    return res.json({ success: true, data })
  }),
)

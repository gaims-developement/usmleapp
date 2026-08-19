import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db/prisma.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { requireRoles } from '../middleware/role.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'
import { AppError } from '../utils/app-error.js'
import { notify } from './notification.routes.js'

export const adminRouter = Router()

adminRouter.use(authenticate)
adminRouter.use(requireRoles('SUPER_ADMIN', 'ADMIN'))

// GET /api/admin/kpis
adminRouter.get(
  '/kpis',
  asyncHandler(async (req, res) => {
    const isDemo = req.user.isDemo

    const totalApplications = await prisma.application.count({
      where: { studentProfile: { user: { isDemo } } },
    })

    const pendingReviews = await prisma.application.count({
      where: {
        studentProfile: { user: { isDemo } },
        status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
      },
    })

    const activeStudents = await prisma.user.count({
      where: {
        role: { name: 'STUDENT' },
        isDemo,
      },
    })

    const partnerHospitals = await prisma.user.count({
      where: {
        role: { name: 'HOSPITAL' },
        isDemo,
      },
    })

    const revenueResult = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        student: { isDemo },
        status: 'COMPLETED',
      },
    })
    const totalRevenue = revenueResult._sum.amount ? Number(revenueResult._sum.amount) : 0

    const kpis = [
      {
        id: 'total-apps',
        label: 'Total Applications',
        value: String(totalApplications),
        delta: '+0%',
        deltaTone: 'neutral',
        hint: 'vs last month',
      },
      {
        id: 'pending',
        label: 'Pending Reviews',
        value: String(pendingReviews),
        delta: '0',
        deltaTone: 'neutral',
        hint: 'Requires action',
      },
      {
        id: 'revenue',
        label: 'Total Revenue',
        value: `$${totalRevenue.toLocaleString()}`,
        delta: '+0%',
        deltaTone: 'neutral',
        hint: 'Gross platform volume',
      },
      {
        id: 'students',
        label: 'Active Students',
        value: String(activeStudents),
        delta: '+0%',
        deltaTone: 'neutral',
        hint: `${partnerHospitals} partner hospitals`,
      },
    ]

    return res.json({ success: true, data: kpis })
  }),
)

// GET /api/admin/analytics
adminRouter.get(
  '/analytics',
  asyncHandler(async (req, res) => {
    const isDemo = req.user.isDemo

    // Registrations by month
    const users = await prisma.user.findMany({
      where: { isDemo, role: { name: 'STUDENT' } },
      select: { createdAt: true },
    })

    const monthCounts = {}
    users.forEach(u => {
      const month = u.createdAt.toISOString().slice(0, 7)
      monthCounts[month] = (monthCounts[month] || 0) + 1
    })

    const monthlyRegistrations = Object.entries(monthCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, value]) => ({ label, value }))

    // Applications by status
    const appsByStatus = await prisma.application.groupBy({
      by: ['status'],
      where: { studentProfile: { user: { isDemo } } },
      _count: { status: true },
    })

    const applicationsByStatus = appsByStatus.map(a => ({
      label: a.status,
      value: a._count.status,
    }))

    // Applications by specialty
    const apps = await prisma.application.findMany({
      where: { studentProfile: { user: { isDemo } } },
      include: { program: true },
    })

    const specialtyCounts = {}
    apps.forEach(a => {
      const specialty = a.program?.specialty ?? 'General'
      specialtyCounts[specialty] = (specialtyCounts[specialty] || 0) + 1
    })

    const applicationsBySpecialty = Object.entries(specialtyCounts).map(([label, value]) => ({
      label,
      value,
    }))

    return res.json({
      success: true,
      data: {
        monthlyRegistrations: monthlyRegistrations.length
          ? monthlyRegistrations
          : [{ label: 'Current', value: users.length }],
        applicationsByStatus,
        applicationsBySpecialty,
      },
    })
  }),
)

// GET /api/admin/uptime
adminRouter.get(
  '/uptime',
  asyncHandler(async (_req, res) => {
    return res.json({
      success: true,
      data: [
        { name: 'Core API Server', uptime: 99.99, tone: 'brand' },
        { name: 'Database (PostgreSQL)', uptime: 100.0, tone: 'brand' },
        { name: 'Authentication (JWT)', uptime: 99.98, tone: 'brand' },
        { name: 'Payment Gateway', uptime: 99.95, tone: 'brand' },
      ],
    })
  }),
)

// GET /api/admin/activity
adminRouter.get(
  '/activity',
  asyncHandler(async (req, res) => {
    const isDemo = req.user.isDemo

    const recentApps = await prisma.application.findMany({
      where: { studentProfile: { user: { isDemo } } },
      include: { studentProfile: { include: { user: true } }, program: true },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    })

    const activity = recentApps.map(app => ({
      id: app.id,
      user: app.studentProfile.user.name,
      action: `Application ${app.status.toLowerCase()}`,
      target: app.program?.title ?? 'Elective Program',
      timestamp: app.updatedAt.toISOString(),
    }))

    return res.json({ success: true, data: activity })
  }),
)

// GET /api/admin/ops-kpis
adminRouter.get(
  '/ops-kpis',
  asyncHandler(async (req, res) => {
    const isDemo = req.user.isDemo

    const totalApps = await prisma.application.count({
      where: { studentProfile: { user: { isDemo } } },
    })
    const totalDocs = await prisma.studentDocument.count({
      where: { studentProfile: { user: { isDemo } } },
    })

    return res.json({
      success: true,
      data: [
        { label: 'Avg Review Time', value: '1.2 days', delta: '-0.3d' },
        { label: 'Total Applications', value: String(totalApps), delta: '+0%' },
        { label: 'Total Documents', value: String(totalDocs), delta: '+0%' },
      ],
    })
  }),
)

// GET /api/admin/documents
adminRouter.get(
  '/documents',
  asyncHandler(async (req, res) => {
    const isDemo = req.user.isDemo

    const docs = await prisma.studentDocument.findMany({
      where: {
        studentProfile: {
          user: { isDemo },
        },
      },
      include: {
        studentProfile: {
          include: { user: true },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    })

    const mapped = docs.map(d => ({
      id: d.id,
      owner: d.studentProfile.user.name,
      email: d.studentProfile.user.email,
      document: d.name,
      type: d.category ?? 'Identity',
      uploadedAt: d.uploadedAt ? d.uploadedAt.toISOString().slice(0, 10) : '—',
      status: d.status,
      fileName: d.fileName ?? 'document.pdf',
      note: d.note ?? '',
    }))

    return res.json({ success: true, data: mapped })
  }),
)

// GET /api/admin/documents/students - Grouped documents by student
adminRouter.get(
  '/documents/students',
  asyncHandler(async (req, res) => {
    const isDemo = req.user.isDemo

    const students = await prisma.user.findMany({
      where: {
        isDemo,
        role: { name: 'STUDENT' },
      },
      include: {
        studentProfile: {
          include: {
            documents: true,
            applications: { select: { id: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const mapped = students.map(u => {
      const docs = u.studentProfile?.documents ?? []
      const totalDocs = docs.length
      const verifiedDocs = docs.filter(d => d.status === 'verified' || d.status === 'VERIFIED').length
      const pendingDocs = docs.filter(d => d.status === 'pending' || d.status === 'uploaded').length
      const rejectedDocs = docs.filter(d => d.status === 'rejected' || d.status === 'REJECTED').length

      let overallStatus = 'No Documents'
      if (totalDocs > 0) {
        if (rejectedDocs > 0) overallStatus = 'Action Required'
        else if (pendingDocs > 0 && verifiedDocs > 0) overallStatus = 'Partially Verified'
        else if (pendingDocs > 0) overallStatus = 'Pending Review'
        else if (verifiedDocs === totalDocs) overallStatus = 'Complete'
      }

      let latestUploadStr = '—'
      const validDates = docs.map(d => d.uploadedAt).filter(Boolean).map(d => new Date(d).getTime())
      if (validDates.length > 0) {
        latestUploadStr = new Date(Math.max(...validDates)).toISOString().slice(0, 10)
      }

      return {
        studentId: u.id,
        name: u.name,
        email: u.email,
        college: u.studentProfile?.college ?? 'Medical School Not Specified',
        graduationYear: u.studentProfile?.graduationYear ?? null,
        applicationsCount: u.studentProfile?.applications?.length ?? 0,
        totalDocs,
        verifiedDocs,
        pendingDocs,
        rejectedDocs,
        overallStatus,
        lastUpload: latestUploadStr,
        documents: docs.map(d => ({
          id: d.id,
          name: d.name,
          category: d.category,
          status: d.status,
          fileName: d.fileName ?? 'file.pdf',
          mimeType: d.mimeType ?? null,
          fileSize: d.fileSize ?? null,
          storageProvider: d.storageProvider ?? null,
          storagePath: d.storagePath ?? null,
          uploadedAt: d.uploadedAt ? d.uploadedAt.toISOString().slice(0, 10) : '—',
          note: d.note ?? '',
          version: d.version ?? 1,
          rejectedAt: d.rejectedAt ? d.rejectedAt.toISOString() : null,
          rejectedById: d.rejectedById ?? null,
        })),
      }
    })

    return res.json({ success: true, data: mapped })
  }),
)

// PATCH /api/admin/documents/:id/status
adminRouter.patch(
  '/documents/:id/status',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const { status, note } = req.body

    const existingDoc = await prisma.studentDocument.findUnique({
      where: { id },
      include: {
        studentProfile: { select: { userId: true } },
      },
    })

    if (!existingDoc) {
      throw new AppError('Document record not found', 404, 'DOCUMENT_NOT_FOUND')
    }

    const isRejection = status === 'rejected' || status === 'REJECTED'
    const finalStatus = isRejection ? 'rejected' : status === 'verified' || status === 'VERIFIED' ? 'verified' : status

    if (isRejection) {
      const reasonText = (note ?? '').trim()
      if (!reasonText) {
        throw new AppError('A rejection reason is required to reject this document.', 400, 'REJECTION_REASON_REQUIRED')
      }
    }

    const doc = await prisma.studentDocument.update({
      where: { id },
      data: {
        status: finalStatus,
        note: isRejection ? (note ?? '').trim() : finalStatus === 'verified' ? null : note,
        rejectedAt: isRejection ? new Date() : null,
        rejectedById: isRejection ? req.user.id : null,
      },
    })

    // If rejected, issue student notification
    if (isRejection && existingDoc.studentProfile?.userId) {
      await notify(existingDoc.studentProfile.userId, {
        tone: 'WARNING',
        title: 'Document Rejected',
        body: `Your ${doc.name} was rejected.`,
        documentId: doc.id,
      })
    }

    return res.json({ success: true, data: doc })
  }),
)

// Roles that exist in the application's RBAC system (RoleName enum).
const ROLE_NAMES = ['SUPER_ADMIN', 'ADMIN', 'REVIEWER', 'HOSPITAL', 'DOCTOR', 'STUDENT']

const ROLE_DISPLAY = {
  SUPER_ADMIN: 'Super Admins',
  ADMIN: 'Admins',
  REVIEWER: 'Reviewers',
  HOSPITAL: 'Hospital Staff',
  DOCTOR: 'Doctors',
  STUDENT: 'Students',
}

// Display strings used by the legacy admin announcements editor.
const LEGACY_AUDIENCE_TO_ROLES = {
  'All students': ['STUDENT'],
  'All users': ROLE_NAMES,
  Reviewers: ['REVIEWER'],
  'Hospitals & students': ['HOSPITAL', 'STUDENT'],
  Doctors: ['DOCTOR'],
}

// Broadcast priority -> existing NotificationTone values.
const PRIORITY_TO_TONE = {
  normal: 'INFO',
  important: 'SUCCESS',
  urgent: 'WARNING',
}

const ANNOUNCEMENT_STATUS_TO_FRONTEND = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'draft',
}

function resolveAudienceRoles(audience) {
  if (!audience) return []
  if (audience === 'ALL' || audience === 'all') return [...ROLE_NAMES]
  if (typeof audience === 'string' && LEGACY_AUDIENCE_TO_ROLES[audience]) {
    return [...LEGACY_AUDIENCE_TO_ROLES[audience]]
  }
  const roles = (Array.isArray(audience) ? audience : [audience]).filter(role => ROLE_NAMES.includes(role))
  return [...new Set(roles)]
}

function audienceDisplay(roles) {
  if (!roles || roles.length === 0) return 'All Users'
  if (ROLE_NAMES.every(role => roles.includes(role))) return 'All Users'
  return roles.map(role => ROLE_DISPLAY[role] ?? role).join(', ')
}

const createAnnouncementSchema = z.object({
  body: z.object({
    type: z.enum(['announcement', 'notification']).optional(),
    title: z.string().trim().min(1, 'Title is required').max(200),
    body: z.string().trim().max(10000).optional().default(''),
    audience: z.union([z.string().trim().min(1), z.array(z.string().trim().min(1)).min(1)]),
    priority: z.enum(['normal', 'important', 'urgent']).optional().default('normal'),
    status: z.enum(['draft', 'published', 'scheduled']).optional(),
    publishedAt: z.string().optional(),
  }),
})

// GET /api/admin/announcements
adminRouter.get(
  '/announcements',
  asyncHandler(async (_req, res) => {
    const announcements = await prisma.announcement.findMany({
      include: { author: true, audiences: true },
      orderBy: { createdAt: 'desc' },
    })

    return res.json({
      success: true,
      data: announcements.map(a => ({
        id: a.id,
        title: a.title,
        body: a.body,
        audience: audienceDisplay(a.audiences.map(x => x.roleName)),
        status: ANNOUNCEMENT_STATUS_TO_FRONTEND[a.status] ?? 'draft',
        author: a.author.name,
        publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
        views: a.views,
      })),
    })
  }),
)

// POST /api/admin/announcements
// Requires SUPER_ADMIN or ADMIN (enforced at the router level). Creates an
// announcement record (when type is "announcement" or absent) and, for the
// broadcast flow, one Notification per eligible recipient via the existing
// notification architecture. Recipients are resolved from existing RBAC roles
// only; deleted/demo accounts are never notified.
adminRouter.post(
  '/announcements',
  validate(createAnnouncementSchema),
  asyncHandler(async (req, res) => {
    const { type, title, body, audience, priority = 'normal', status } = req.body

    const roles = resolveAudienceRoles(audience)
    if (roles.length === 0) {
      throw new AppError('At least one valid recipient role is required', 400, 'INVALID_AUDIENCE')
    }

    const isBroadcast = type === 'announcement' || type === 'notification'
    const persistAnnouncement = isBroadcast ? type === 'announcement' : true

    let announcement = null
    if (persistAnnouncement) {
      // The database has no SCHEDULED state, so a legacy "scheduled" request is
      // persisted as a non-live DRAFT rather than being published immediately.
      const nextStatus = status ? { draft: 'DRAFT', published: 'PUBLISHED', scheduled: 'DRAFT' }[status] : 'PUBLISHED'
      announcement = await prisma.announcement.create({
        data: {
          authorId: req.user.id,
          creatorId: req.user.id,
          title,
          body,
          status: nextStatus,
          publishedAt: nextStatus === 'PUBLISHED' ? new Date() : null,
          audiences: { create: roles.map(roleName => ({ roleName })) },
        },
        include: { author: true, audiences: true },
      })
    }

    // Always create Notification records for eligible recipients so the bell
    // shows the announcement. This applies to both 'announcement' and
    // 'notification' types, as well as the legacy broadcast flow.
    const shouldNotify = announcement
      ? announcement.status === 'PUBLISHED'
      : isBroadcast

    let notificationsCreated = 0
    if (shouldNotify) {
      const recipients = await prisma.user.findMany({
        where: {
          role: { name: { in: roles } },
          deletedAt: null,
          id: { not: req.user.id },
        },
        select: { id: true },
      })

      if (recipients.length > 0) {
        const tone = PRIORITY_TO_TONE[priority] ?? 'INFO'
        const created = await prisma.notification.createMany({
          data: recipients.map(user => ({ userId: user.id, tone, title, body })),
        })
        notificationsCreated = created.count
        console.log(`[NOTIFICATION] Announcement broadcast: ${notificationsCreated} notifications created for "${title}"`)
      } else {
        console.log(`[NOTIFICATION] Announcement broadcast: no eligible recipients for role(s): ${roles.join(', ')}`)
      }
    }

    return res.status(201).json({
      success: true,
      data: {
        id: announcement?.id ?? null,
        title,
        body,
        audience: audienceDisplay(roles),
        status: announcement ? ANNOUNCEMENT_STATUS_TO_FRONTEND[announcement.status] : 'published',
        author: req.user.name,
        publishedAt: announcement?.publishedAt ? announcement.publishedAt.toISOString() : null,
        views: 0,
        notificationsCreated,
      },
    })
  }),
)

// PATCH /api/admin/announcements/:id
adminRouter.patch(
  '/announcements/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const { title, body, audience, status } = req.body

    const existing = await prisma.announcement.findUnique({ where: { id } })
    if (!existing) throw new AppError('Announcement not found', 404, 'NOT_FOUND')

    const updateData = {}
    if (title !== undefined) updateData.title = title
    if (body !== undefined) updateData.body = body
    if (status !== undefined) {
      const dbStatus = { draft: 'DRAFT', published: 'PUBLISHED', scheduled: 'DRAFT', archived: 'ARCHIVED' }[status]
      if (dbStatus) {
        updateData.status = dbStatus
        if (dbStatus === 'PUBLISHED' && !existing.publishedAt) {
          updateData.publishedAt = new Date()
        }
      }
    }

    if (audience !== undefined) {
      const roles = resolveAudienceRoles(audience)
      if (roles.length > 0) {
        await prisma.announcementAudience.deleteMany({ where: { announcementId: id } })
        await prisma.announcementAudience.createMany({
          data: roles.map(roleName => ({ announcementId: id, roleName })),
        })
      }
    }

    const updated = await prisma.announcement.update({
      where: { id },
      data: updateData,
      include: { author: true, audiences: true },
    })

    return res.json({
      success: true,
      data: {
        id: updated.id,
        title: updated.title,
        body: updated.body,
        audience: audienceDisplay(updated.audiences.map(x => x.roleName)),
        status: ANNOUNCEMENT_STATUS_TO_FRONTEND[updated.status] ?? 'draft',
        author: updated.author.name,
        publishedAt: updated.publishedAt ? updated.publishedAt.toISOString() : null,
        views: updated.views,
      },
    })
  }),
)

// DELETE /api/admin/announcements/:id
adminRouter.delete(
  '/announcements/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params

    const existing = await prisma.announcement.findUnique({ where: { id } })
    if (!existing) throw new AppError('Announcement not found', 404, 'NOT_FOUND')

    await prisma.announcement.delete({ where: { id } })

    return res.json({ success: true })
  }),
)

// GET /api/admin/support-tickets
adminRouter.get(
  '/support-tickets',
  asyncHandler(async (_req, res) => {
    return res.json({ success: true, data: [] })
  }),
)

// GET /api/admin/audit-logs
adminRouter.get(
  '/audit-logs',
  asyncHandler(async (_req, res) => {
    return res.json({ success: true, data: [] })
  }),
)

// GET /api/admin/settings
adminRouter.get(
  '/settings',
  asyncHandler(async (_req, res) => {
    let settings = await prisma.platformSetting.findFirst()
    if (!settings) {
      settings = await prisma.platformSetting.create({
        data: { siteName: 'USMLEApp', enableDemoData: true },
      })
    }
    return res.json({ success: true, data: settings })
  }),
)

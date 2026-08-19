import { Router } from 'express'
import { prisma } from '../db/prisma.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'

export const notificationRouter = Router()

notificationRouter.use(authenticate)

function formatRelativeTime(date) {
  const diffMs = Date.now() - new Date(date).getTime()
  const minutes = Math.ceil(diffMs / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes <= 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

async function notify(userId, { tone = 'INFO', title, body, details = undefined, applicationId = null, documentId = null }) {
  try {
    console.log(`[NOTIFICATION] type: ${title}, recipientUserId: ${userId}, creating...`)
    const created = await prisma.notification.create({
      data: { userId, tone, title, body, details: details ?? undefined, applicationId, documentId },
    })
    console.log(`[NOTIFICATION] created: ${created.id}`)
    return created
  } catch (err) {
    console.error(`[NOTIFICATION] FAILED to create notification for user ${userId}:`, err)
    throw err
  }
}

export { notify }

// GET /api/notifications
notificationRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = req.user.id

    const notifications = await prisma.notification.findMany({
      where: { userId },
      include: {
        document: {
          select: {
            id: true,
            name: true,
            note: true,
            rejectedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const mapped = notifications.map(n => ({
      id: n.id,
      tone: n.tone === 'ERROR' ? 'critical' : n.tone.toLowerCase(), // info, success, warning, critical
      title: n.title,
      body: n.body,
      details: n.details ?? null,
      read: n.read,
      applicationId: n.applicationId,
      documentId: n.documentId,
      documentName: n.document?.name ?? null,
      rejectionReason: n.title === 'Document Rejected' ? n.document?.note ?? null : null,
      rejectedAt: n.document?.rejectedAt?.toISOString() ?? null,
      createdAt: n.createdAt.toISOString(),
      time: formatRelativeTime(n.createdAt),
    }))

    return res.json({ success: true, data: mapped })
  }),
)

// GET /api/notifications/unread-count
notificationRouter.get(
  '/unread-count',
  asyncHandler(async (req, res) => {
    const userId = req.user.id
    const count = await prisma.notification.count({
      where: { userId, read: false },
    })
    return res.json({ success: true, data: { count } })
  }),
)

// PATCH /api/notifications/:id/read - Mark read
notificationRouter.patch(
  '/:id/read',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const userId = req.user.id

    const updated = await prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    })

    return res.json({ success: true, data: updated })
  }),
)

// POST /api/notifications/read-all - Mark all read
notificationRouter.post(
  '/read-all',
  asyncHandler(async (req, res) => {
    const userId = req.user.id

    await prisma.notification.updateMany({
      where: { userId },
      data: { read: true },
    })

    return res.json({ success: true })
  }),
)

// GET /api/notifications/announcements - Published announcements for the current user's role
notificationRouter.get(
  '/announcements',
  asyncHandler(async (req, res) => {
    const userId = req.user.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: { select: { name: true } } },
    })
    if (!user) return res.json({ success: true, data: [] })

    const roleName = user.role?.name
    if (!roleName) return res.json({ success: true, data: [] })

    const announcements = await prisma.announcement.findMany({
      where: {
        status: 'PUBLISHED',
        audiences: { some: { roleName } },
      },
      include: { author: true },
      orderBy: { publishedAt: 'desc' },
      take: 20,
    })

    return res.json({
      success: true,
      data: announcements.map(a => ({
        id: a.id,
        title: a.title,
        body: a.body,
        author: a.author?.name ?? null,
        publishedAt: a.publishedAt ? a.publishedAt.toISOString() : a.createdAt.toISOString(),
      })),
    })
  }),
)

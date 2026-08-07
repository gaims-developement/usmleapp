import { Router } from 'express'
import { prisma } from '../db/prisma.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'

export const notificationRouter = Router()

notificationRouter.use(authenticate)

// GET /api/notifications
notificationRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = req.user.id
    const role = req.user.role

    let whereClause = { userId }
    // If Admin/Super Admin, we show all admin notifications or specific ones.
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      // In prisma, notifications are linked to a userId.
      // Admins see their own notifications, which we can seed or query.
      whereClause = { userId }
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    })

    const mapped = notifications.map(n => ({
      id: n.id,
      tone: n.tone.toLowerCase(), // info, success, warning, error
      title: n.title,
      body: n.body,
      read: n.read,
      time: 'just now', // Simple formatting
    }))

    return res.json({ success: true, data: mapped })
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

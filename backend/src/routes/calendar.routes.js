import { Router } from 'express'
import { prisma } from '../db/prisma.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'

export const calendarRouter = Router()

calendarRouter.use(authenticate)

// GET /api/calendar-events
calendarRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = req.user.id

    // Student planner / calendar events
    const events = await prisma.calendarEvent.findMany({
      where: {
        createdById: userId,
      },
      orderBy: { startAt: 'asc' },
    })

    const mapped = events.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description ?? '',
      start: e.startAt.toISOString(),
      end: e.endAt.toISOString(),
      location: e.location ?? '',
    }))

    return res.json({ success: true, data: mapped })
  }),
)

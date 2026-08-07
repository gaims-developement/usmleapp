import { Router } from 'express'
import { prisma } from '../db/prisma.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'

export const dashboardRouter = Router()

dashboardRouter.use(authenticate)

// GET /api/dashboard/stats
dashboardRouter.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const userId = req.user.id
    const role = req.user.role

    if (role !== 'STUDENT') {
      return res.json({
        success: true,
        data: {
          activeApplications: 0,
          confirmedRotations: 0,
          documentsReady: 0,
          requiredDocuments: 6,
          totalApplications: 0,
        },
      })
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        applications: true,
        documents: true,
      },
    })

    if (!studentProfile) {
      return res.json({
        success: true,
        data: {
          activeApplications: 0,
          confirmedRotations: 0,
          documentsReady: 0,
          requiredDocuments: 6,
          totalApplications: 0,
        },
      })
    }

    const apps = studentProfile.applications
    const docs = studentProfile.documents

    const totalApplications = apps.length
    // Active statuses are: SUBMITTED, UNDER_REVIEW, CHANGES_REQUESTED, AWAITING_DECISION, ACCEPTED, WAITLISTED, SCHEDULED
    const activeApplications = apps.filter(a =>
      ['SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'AWAITING_DECISION', 'ACCEPTED', 'WAITLISTED', 'SCHEDULED', 'submitted', 'under_review', 'changes_requested'].includes(a.status),
    ).length

    // Confirmed statuses are: ACCEPTED, WAITLISTED, SCHEDULED, COMPLETED, confirmed, offered
    const confirmedRotations = apps.filter(a =>
      ['ACCEPTED', 'SCHEDULED', 'COMPLETED', 'confirmed', 'offered'].includes(a.status),
    ).length

    const documentsReady = docs.filter(d => d.status === 'uploaded' || d.status === 'expiring' || d.status === 'VERIFIED').length
    const requiredDocuments = 6

    return res.json({
      success: true,
      data: {
        activeApplications,
        confirmedRotations,
        documentsReady,
        requiredDocuments,
        totalApplications,
      },
    })
  }),
)

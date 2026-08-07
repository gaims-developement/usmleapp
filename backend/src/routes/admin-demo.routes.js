import { Router } from 'express'
import { prisma } from '../db/prisma.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { requireRoles } from '../middleware/role.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'

export const adminDemoRouter = Router()

adminDemoRouter.use(authenticate)
adminDemoRouter.use(requireRoles('SUPER_ADMIN', 'ADMIN'))

// GET /api/admin/demo-status - Get counts of demo and real records
adminDemoRouter.get(
  '/demo-status',
  asyncHandler(async (req, res) => {
    const demoApps = await prisma.application.count({
      where: { studentProfile: { user: { isDemo: true } } },
    })
    const realApps = await prisma.application.count({
      where: { studentProfile: { user: { isDemo: false } } },
    })

    const demoDocs = await prisma.studentDocument.count({
      where: { studentProfile: { user: { isDemo: true } } },
    })
    const realDocs = await prisma.studentDocument.count({
      where: { studentProfile: { user: { isDemo: false } } },
    })

    const demoPayments = await prisma.payment.count({
      where: { student: { isDemo: true } },
    })
    const realPayments = await prisma.payment.count({
      where: { student: { isDemo: false } },
    })

    const demoNotifs = await prisma.notification.count({
      where: { user: { isDemo: true } },
    })
    const realNotifs = await prisma.notification.count({
      where: { user: { isDemo: false } },
    })

    const demoEvents = await prisma.calendarEvent.count({
      where: { createdBy: { isDemo: true } },
    })
    const realEvents = await prisma.calendarEvent.count({
      where: { createdBy: { isDemo: false } },
    })

    const demoCount = demoApps + demoDocs + demoPayments + demoNotifs + demoEvents
    const realCount = realApps + realDocs + realPayments + realNotifs + realEvents

    let settings = await prisma.platformSetting.findFirst()
    if (!settings) {
      settings = await prisma.platformSetting.create({
        data: { siteName: 'USMLEApp', enableDemoData: true },
      })
    }

    return res.json({
      success: true,
      data: {
        demoMode: settings.enableDemoData,
        demoRecords: demoCount,
        realRecords: realCount,
        details: {
          applications: { demo: demoApps, real: realApps },
          documents: { demo: demoDocs, real: realDocs },
          payments: { demo: demoPayments, real: realPayments },
          notifications: { demo: demoNotifs, real: realNotifs },
          events: { demo: demoEvents, real: realEvents },
        },
      },
    })
  }),
)

// POST /api/admin/demo-action - Enable, disable, or delete demo records
adminDemoRouter.post(
  '/demo-action',
  asyncHandler(async (req, res) => {
    const { action } = req.body

    let settings = await prisma.platformSetting.findFirst()
    if (!settings) {
      settings = await prisma.platformSetting.create({
        data: { siteName: 'USMLEApp', enableDemoData: true },
      })
    }

    if (action === 'enable') {
      await prisma.platformSetting.update({
        where: { id: settings.id },
        data: { enableDemoData: true },
      })
      return res.json({ success: true, message: 'Demo mode enabled' })
    }

    if (action === 'disable') {
      await prisma.platformSetting.update({
        where: { id: settings.id },
        data: { enableDemoData: false },
      })
      return res.json({ success: true, message: 'Demo mode disabled' })
    }

    if (action === 'delete') {
      const demoUsers = await prisma.user.findMany({
        where: { isDemo: true },
        select: { id: true },
      })
      const demoUserIds = demoUsers.map(u => u.id)

      const demoApps = await prisma.application.findMany({
        where: { studentProfile: { userId: { in: demoUserIds } } },
        select: { id: true },
      })
      const demoAppIds = demoApps.map(a => a.id)

      await prisma.$transaction([
        prisma.applicationReview.deleteMany({
          where: { applicationId: { in: demoAppIds } },
        }),
        prisma.applicationLanguage.deleteMany({
          where: { applicationId: { in: demoAppIds } },
        }),
        prisma.applicationDocument.deleteMany({
          where: { applicationId: { in: demoAppIds } },
        }),
        prisma.rotation.deleteMany({
          where: { applicationId: { in: demoAppIds } },
        }),
        prisma.evaluationScore.deleteMany({
          where: { evaluation: { applicationId: { in: demoAppIds } } },
        }),
        prisma.evaluation.deleteMany({
          where: { applicationId: { in: demoAppIds } },
        }),
        prisma.logbookEntry.deleteMany({
          where: { applicationId: { in: demoAppIds } },
        }),
        prisma.letterOfRecommendation.deleteMany({
          where: { applicationId: { in: demoAppIds } },
        }),
        prisma.certificate.deleteMany({
          where: { applicationId: { in: demoAppIds } },
        }),
        prisma.message.deleteMany({
          where: { senderId: { in: demoUserIds } },
        }),
        prisma.conversationParticipant.deleteMany({
          where: { userId: { in: demoUserIds } },
        }),
        prisma.conversation.deleteMany({
          where: { applicationId: { in: demoAppIds } },
        }),
        prisma.application.deleteMany({
          where: { id: { in: demoAppIds } },
        }),
        prisma.payment.deleteMany({
          where: { studentId: { in: demoUserIds } },
        }),
        prisma.notification.deleteMany({
          where: { userId: { in: demoUserIds } },
        }),
        prisma.studentDocument.deleteMany({
          where: { studentProfile: { userId: { in: demoUserIds } } },
        }),
        prisma.calendarEvent.deleteMany({
          where: { createdById: { in: demoUserIds } },
        }),
        prisma.partnerRegistration.deleteMany({
          where: { registeredById: { in: demoUserIds } },
        }),
        prisma.studentProfile.deleteMany({
          where: { userId: { in: demoUserIds } },
        }),
        prisma.reviewerProfile.deleteMany({
          where: { userId: { in: demoUserIds } },
        }),
        prisma.hospitalProfile.deleteMany({
          where: { userId: { in: demoUserIds } },
        }),
        prisma.doctorProfile.deleteMany({
          where: { userId: { in: demoUserIds } },
        }),
        prisma.refreshToken.deleteMany({
          where: { userId: { in: demoUserIds } },
        }),
        prisma.emailVerificationToken.deleteMany({
          where: { userId: { in: demoUserIds } },
        }),
        prisma.passwordResetToken.deleteMany({
          where: { userId: { in: demoUserIds } },
        }),
        prisma.user.deleteMany({
          where: { id: { in: demoUserIds } },
        }),
      ])

      return res.json({ success: true, message: 'Demo data deleted successfully' })
    }

    throw new Error(`Invalid action: ${action}`)
  }),
)

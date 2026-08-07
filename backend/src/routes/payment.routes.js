import { Router } from 'express'
import { prisma } from '../db/prisma.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'

export const paymentRouter = Router()

paymentRouter.use(authenticate)

// GET /api/payments
paymentRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const role = req.user.role
    const userId = req.user.id

    if (role === 'STUDENT') {
      const payments = await prisma.payment.findMany({
        where: { studentId: userId },
        include: {
          application: {
            include: { program: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      const mapped = payments.map(p => ({
        id: p.id,
        applicationId: p.applicationId,
        specialty: p.application.program.specialty ?? 'Rotation',
        hospital: p.application.program.hospitalId ?? 'Hospital',
        amount: Number(p.amount),
        submittedAt: p.submittedAt?.toISOString().slice(0, 10) ?? p.createdAt.toISOString().slice(0, 10),
        status: p.status.toLowerCase(), // frontend expects lowercase
        paymentMethod: p.paymentMethod.toLowerCase(),
        transactionId: p.transactionId ?? '',
      }))

      return res.json({ success: true, data: mapped })
    }

    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      const payments = await prisma.payment.findMany({
        where: {
          student: {
            isDemo: req.user.isDemo,
          },
        },
        include: {
          student: true,
          application: { include: { program: true } },
        },
        orderBy: { createdAt: 'desc' },
      })

      const mapped = payments.map(p => ({
        id: p.id,
        student: p.student.name,
        email: p.student.email,
        amount: Number(p.amount),
        method: p.paymentMethod.toLowerCase(),
        transactionId: p.transactionId ?? '',
        status: p.status.toLowerCase(),
        date: p.submittedAt?.toISOString().slice(0, 10) ?? p.createdAt.toISOString().slice(0, 10),
      }))

      return res.json({ success: true, data: mapped })
    }

    return res.json({ success: true, data: [] })
  }),
)

// POST /api/payments
paymentRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const { applicationId, amount, paymentMethod, transactionId } = req.body
    const userId = req.user.id

    const payment = await prisma.payment.create({
      data: {
        applicationId,
        studentId: userId,
        amount,
        paymentMethod: paymentMethod.toUpperCase(),
        transactionId,
        status: 'UNDER_VERIFICATION',
        submittedAt: new Date(),
      },
    })

    return res.json({ success: true, data: payment })
  }),
)

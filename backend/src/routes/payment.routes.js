import { Router } from 'express'
import { prisma } from '../db/prisma.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'
import { AppError } from '../utils/app-error.js'
import { notify } from './notification.routes.js'

export const paymentRouter = Router()

paymentRouter.use(authenticate)

const receiptInclude = {
  student: true,
  application: {
    include: { program: { include: { hospital: true } } },
  },
}

function mapPaymentReceipt(p) {
  return {
    id: p.id,
    applicationId: p.applicationId,
    receiptNumber: `IMG-REC-${p.id.slice(-8).toUpperCase()}`,
    studentName: p.student.name,
    studentEmail: p.student.email,
    specialty: p.application.program.title ?? p.application.program.specialty ?? 'Program unavailable',
    hospital: p.application.program.hospital?.name ?? 'Hospital unavailable',
    amount: Number(p.amount),
    currency: p.currency,
    submittedAt: p.submittedAt?.toISOString().slice(0, 10) ?? p.createdAt.toISOString().slice(0, 10),
    paidAt: p.verifiedAt?.toISOString().slice(0, 10) ?? p.submittedAt?.toISOString().slice(0, 10) ?? p.createdAt.toISOString().slice(0, 10),
    status: p.status.toLowerCase(), // frontend expects lowercase
    paymentMethod: p.paymentMethod.toLowerCase(),
    transactionId: p.transactionId ?? '',
  }
}

// GET /api/payments
paymentRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const role = req.user.role
    const userId = req.user.id

    if (role === 'STUDENT') {
      const payments = await prisma.payment.findMany({
        where: { studentId: userId },
        include: receiptInclude,
        orderBy: { createdAt: 'desc' },
      })

      const mapped = payments.map(mapPaymentReceipt)

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

// GET /api/payments/:id/receipt
// Returns the authoritative receipt payload for one payment.
// Ownership is verified server-side: a student can only ever access their
// own payment, and admins are isolated to their demo/real cohort.
paymentRouter.get(
  '/:id/receipt',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const role = req.user.role
    const userId = req.user.id

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: receiptInclude,
    })
    if (!payment) {
      throw new AppError('Payment not found', 404, 'PAYMENT_NOT_FOUND')
    }

    const isOwner = payment.studentId === userId
    const isStaff = role === 'ADMIN' || role === 'SUPER_ADMIN'
    const inSameCohort = isStaff && payment.student.isDemo === req.user.isDemo

    if (!isOwner && !inSameCohort) {
      throw new AppError('Payment not found', 404, 'PAYMENT_NOT_FOUND')
    }

    return res.json({ success: true, data: mapPaymentReceipt(payment) })
  }),
)

// POST /api/payments
paymentRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const { applicationId, amount, paymentMethod, transactionId } = req.body
    const userId = req.user.id

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { studentProfile: true },
    })
    if (!application || application.studentProfile.userId !== userId) {
      throw new AppError('Application not found', 404, 'APPLICATION_NOT_FOUND')
    }

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

    await notify(userId, {
      tone: 'INFO',
      title: 'Payment submitted',
      body: `Your payment of $${Number(amount).toFixed(2)} is being verified. You will be notified once confirmed.`,
      applicationId,
    })

    return res.json({ success: true, data: payment })
  }),
)

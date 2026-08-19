import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../utils/async-handler.js'
import { validate } from '../middleware/validate.middleware.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { requireRoles } from '../middleware/role.middleware.js'
import { orgService } from '../services/org.service.js'

export const invitationRouter = Router()

invitationRouter.use(authenticate, requireRoles('SUPER_ADMIN', 'ADMIN'))

const mintReviewerCodeSchema = z.object({
  body: z.object({
    expiresAt: z.string().datetime().optional().nullable(),
  }),
})

const reviewerCodeParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
})

invitationRouter.get(
  '/reviewer',
  asyncHandler(async (req, res) => {
    const codes = await orgService.listReviewerCodes()
    res.json({ success: true, data: codes })
  }),
)

invitationRouter.post(
  '/reviewer',
  validate(mintReviewerCodeSchema),
  asyncHandler(async (req, res) => {
    const code = await orgService.mintReviewerCode(req.user.id, req.body.expiresAt ?? null)
    res.status(201).json({ success: true, data: code })
  }),
)

invitationRouter.delete(
  '/reviewer/:id',
  validate(reviewerCodeParamsSchema),
  asyncHandler(async (req, res) => {
    const result = await orgService.deactivateReviewerCode(req.params.id)
    res.json({ success: true, data: result })
  }),
)

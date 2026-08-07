import { Router } from 'express'
import { asyncHandler } from '../utils/async-handler.js'

export const healthRouter = Router()

healthRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json({
      success: true,
      data: {
        service: 'usmle-app-api',
        status: 'ok',
        timestamp: new Date().toISOString(),
      },
    })
  }),
)

import { Router } from 'express'
import { env } from '../config/env.js'

export const devmodeRouter = Router()

// Read-only status used by the frontend to gate the /devmode page.
// Returns only a boolean; never exposes credentials or connection details.
devmodeRouter.get('/status', (_req, res) => {
  res.json({ success: true, data: { enabled: env.ENABLE_DEVMODE } })
})

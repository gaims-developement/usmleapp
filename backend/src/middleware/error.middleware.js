import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { env } from '../config/env.js'
import { AppError } from '../utils/app-error.js'
import { logger } from '../utils/logger.js'

export function errorMiddleware(error, req, res, _next) {
  logger.error(`${req.method} ${req.originalUrl}`, error)

  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: error.flatten(),
      },
    })
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Database request failed',
      },
    })
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    })
  }

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: env.NODE_ENV === 'production' ? 'Something went wrong' : error.message,
    },
  })
}

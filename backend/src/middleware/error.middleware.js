import { ZodError } from 'zod'
import multer from 'multer'
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

  if (error instanceof Prisma.PrismaClientValidationError) {
    logger.error('Prisma validation error', error)
    return res.status(400).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Unable to process the request. Please verify your input and try again.',
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

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'File is too large. PDFs must be 5 MB or smaller and images 1 MB or smaller.',
        },
      })
    }
    return res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: error.message,
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

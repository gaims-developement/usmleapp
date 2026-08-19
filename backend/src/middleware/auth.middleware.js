import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { AppError } from '../utils/app-error.js'
import { prisma } from '../db/prisma.js'

/**
 * Verifies the Bearer access token, loads the user from the database, and
 * attaches `req.user` (including the current role claim) for downstream
 * role-based authorization.
 */
async function resolveUserFromRequest(req, next) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined

  if (!token) {
    return { authenticated: false, error: null }
  }

  let payload
  try {
    payload = jwt.verify(token, env.JWT_SECRET)
  } catch {
    return { authenticated: false, error: new AppError('Invalid or expired authentication token', 401, 'AUTH_TOKEN_INVALID') }
  }

  if (!payload?.sub) {
    return { authenticated: false, error: new AppError('Invalid authentication token', 401, 'AUTH_TOKEN_INVALID') }
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: {
      role: true,
      hospitalProfile: { select: { id: true } },
      doctorProfile: { select: { id: true } },
      reviewerProfile: { select: { id: true } },
    },
  })

  if (!user || !user.passwordHash) {
    return { authenticated: false, error: new AppError('Account no longer exists', 401, 'USER_NOT_FOUND') }
  }

  if (user.deletedAt) {
    return { authenticated: false, error: new AppError('This account has been deactivated', 403, 'ACCOUNT_DEACTIVATED') }
  }

  req.user = {
    id: user.id,
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role?.name ?? 'STUDENT',
    onboarded: user.onboarded,
    isDemo: user.isDemo,
    hospitalProfileId: user.hospitalProfile?.id ?? null,
    doctorProfileId: user.doctorProfile?.id ?? null,
    reviewerProfileId: user.reviewerProfile?.id ?? null,
  }

  return { authenticated: true, error: null }
}

export async function authenticate(req, _res, next) {
  try {
    const { authenticated, error } = await resolveUserFromRequest(req, next)
    if (!authenticated) {
      return next(error ?? new AppError('Authentication token is required', 401, 'AUTH_TOKEN_MISSING'))
    }
    return next()
  } catch (error) {
    return next(error)
  }
}

/**
 * Like `authenticate` but never rejects. Attaches `req.user` when a valid
 * token is present, otherwise leaves it undefined so public endpoints can
 * offer optional personalization.
 */
export async function authenticateOptional(req, _res, next) {
  try {
    const { error } = await resolveUserFromRequest(req, next)
    if (error) return next()
    return next()
  } catch {
    return next()
  }
}

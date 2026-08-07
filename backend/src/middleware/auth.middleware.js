import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { AppError } from '../utils/app-error.js'
import { prisma } from '../db/prisma.js'

/**
 * Verifies the Bearer access token, loads the user from the database, and
 * attaches `req.user` (including the current role claim) for downstream
 * role-based authorization.
 */
export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined

    if (!token) {
      throw new AppError('Authentication token is required', 401, 'AUTH_TOKEN_MISSING')
    }

    let payload
    try {
      payload = jwt.verify(token, env.JWT_SECRET)
    } catch {
      throw new AppError('Invalid or expired authentication token', 401, 'AUTH_TOKEN_INVALID')
    }

    if (!payload?.sub) {
      throw new AppError('Invalid authentication token', 401, 'AUTH_TOKEN_INVALID')
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    })

    if (!user || !user.passwordHash) {
      throw new AppError('Account no longer exists', 401, 'USER_NOT_FOUND')
    }

    if (user.deletedAt) {
      throw new AppError('This account has been deactivated', 403, 'ACCOUNT_DEACTIVATED')
    }

    req.user = {
      id: user.id,
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role?.name ?? 'STUDENT',
      onboarded: user.onboarded,
    }

    return next()
  } catch (error) {
    return next(error)
  }
}

import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

/**
 * Access tokens are signed JWTs carrying `{ sub, role }`.
 * Refresh tokens are opaque random strings whose SHA-256 hash is stored in the
 * database so they can be revoked and rotated.
 */

export function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  })
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_SECRET)
}

export function generateOpaqueToken(bytes = 48) {
  return crypto.randomBytes(bytes).toString('hex')
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

const UNITS_PER_SECOND = { s: 1, m: 60, h: 3600, d: 86400 }

/** Parses durations like "15m", "24h", "30d" into milliseconds. */
export function durationToMs(expression) {
  const match = /^(\d+)([smhd])$/.exec(String(expression).trim())
  if (!match) return 60 * 60 * 1000
  const [, amount, unit] = match
  return Number(amount) * UNITS_PER_SECOND[unit] * 1000
}

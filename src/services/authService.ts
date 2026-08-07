import type { LoginCredentials, LoginResult } from '@/types/rbac'
import { userService } from '@/services/userService'
import { sessionService } from '@/services/sessionService'

/**
 * Auth service. This is the single seam between the UI and authentication.
 * Each method is async and mirrors the shape of the future Express endpoints:
 *
 *   POST /api/auth/login
 *   POST /api/auth/logout
 *   GET  /api/auth/me
 *
 * Swapping the mock for the real API only requires changing this file.
 */

export class AuthError extends Error {
  code: string
  constructor(message: string, code = 'AUTH_ERROR') {
    super(message)
    this.name = 'AuthError'
    this.code = code
  }
}

const latency = (ms = 350) => new Promise(resolve => setTimeout(resolve, ms))

export function makeMockToken(user: { id: string; role: string }): string {
  const payload = btoa(JSON.stringify({ sub: user.id, role: user.role }))
  return `mock-jwt.${payload}.demo-signature`
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    await latency()
    const user = userService.findByCredentials(credentials.email, credentials.password)
    if (!user) {
      throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS')
    }
    const token = makeMockToken(user)
    sessionService.set({ user, token })
    return { user, token }
  },

  async logout(): Promise<void> {
    await latency(100)
    sessionService.clear()
  },

  async me(): Promise<LoginResult | null> {
    await latency(100)
    return sessionService.get()
  },
}

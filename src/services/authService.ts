import type { LoginCredentials, LoginResult } from '@/types/rbac'
import type { AuthUser } from '@/types/rbac'
import { ApiError, apiGet, apiPost } from '@/lib/apiClient'
import { sessionService } from '@/services/sessionService'

export class AuthError extends ApiError {
  constructor(message: string, code = 'AUTH_ERROR', status = 400, details?: unknown) {
    super(message, code, status, details)
    this.name = 'AuthError'
  }
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    const result = await apiPost<LoginResult>('/auth/login', credentials)
    sessionService.set({
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      refreshTokenExpiresAt: result.refreshTokenExpiresAt,
    })
    return result
  },

  async register(input: {
    name: string
    email: string
    password: string
    college?: string
    dob?: string
    electives?: string[]
    locations?: string[]
  }): Promise<LoginResult> {
    const result = await apiPost<LoginResult>('/auth/register', input)
    sessionService.set({
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      refreshTokenExpiresAt: result.refreshTokenExpiresAt,
    })
    return result
  },

  async logout(): Promise<void> {
    const session = sessionService.get()
    if (session) {
      try {
        await apiPost<{ loggedOut: boolean }>('/auth/logout', {
          refreshToken: session.refreshToken,
        })
      } catch {
        // The server-side refresh token is best-effort; clear locally regardless.
      }
    }
    sessionService.clear()
  },

  async me(): Promise<LoginResult | null> {
    const session = sessionService.get()
    if (!session) return null
    const { user } = await apiGet<{ user: AuthUser }>('/auth/me')
    const updated = { ...session, user }
    sessionService.set(updated)
    return {
      user: updated.user,
      accessToken: updated.accessToken,
      refreshToken: updated.refreshToken,
      refreshTokenExpiresAt: updated.refreshTokenExpiresAt,
    }
  },
}

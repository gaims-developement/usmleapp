import type { LoginCredentials, LoginResult } from '@/types/rbac'
import type { AuthUser } from '@/types/rbac'
import { ApiError, apiGet, apiPost } from '@/lib/apiClient'
import { sessionService } from '@/services/sessionService'

export interface HospitalRegisterInput {
  name: string
  email: string
  password: string
  organizationName?: string
  city?: string
  state?: string
  country?: string
  address?: string
  website?: string
  phone?: string
  description?: string
  coordinatorName?: string
  coordinatorEmail?: string
  coordinatorPhone?: string
}

export interface DoctorRegisterInput {
  name: string
  email: string
  password: string
  hospitalCode: string
  departmentName?: string
  specialty?: string
  title?: string
  licenseNumber?: string
  phone?: string
  availability?: string
}

export interface ReviewerRegisterInput {
  name: string
  email: string
  password: string
  hospitalCode?: string
  invitationCode?: string
  specialty?: string
  department?: string
  timezone?: string
  title?: string
  institution?: string
  phone?: string
  yearsOfExperience?: number
}

export interface HospitalCodeLookup {
  valid: boolean
  code: string
  hospitalId: string
  hospitalName: string
  city: string | null
  state: string | null
  country: string | null
  departments?: string[]
}

export const HOSPITAL_CODE_LOOKUP_ERROR_MESSAGES: Record<string, string> = {
  HOSPITAL_CODE_NOT_FOUND:
    'Hospital code not found. Please check the code provided by your hospital.',
  HOSPITAL_CODE_INACTIVE:
    'This hospital code is no longer active. Please contact your hospital administrator.',
  HOSPITAL_CODE_EXPIRED:
    'This hospital code is no longer active. Please contact your hospital administrator.',
}

export const HOSPITAL_CODE_LOOKUP_GENERIC_ERROR =
  'Unable to verify this code right now. Please try again.'

export class AuthError extends ApiError {
  constructor(message: string, code = 'AUTH_ERROR', status = 400, details?: unknown) {
    super(message, code, status, details)
    this.name = 'AuthError'
  }
}

const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'The email or password you entered is incorrect.',
  ACCOUNT_DEACTIVATED: 'This account has been deactivated. Please contact support.',
  VALIDATION_ERROR: 'Please enter a valid email address and password.',
  DATABASE_ERROR: 'The service is temporarily unavailable. Please try again in a few minutes.',
  NETWORK_ERROR: 'Unable to reach the server. Check your connection and try again.',
  REQUEST_TIMEOUT: 'The server took too long to respond. Please try again.',
  AUTH_TOKEN_MISSING: 'Your session has expired. Please log in again.',
}

function loginErrorMessage(error: ApiError): string {
  const mapped = LOGIN_ERROR_MESSAGES[error.code]
  if (mapped) return mapped
  if (error.status >= 500) {
    return 'The server is temporarily unavailable. Please try again in a few minutes.'
  }
  if (error.status === 404) {
    return 'The login service is not available right now. Please try again later.'
  }
  return error.message || 'Something went wrong. Please try again.'
}

export interface PendingRegistrationResult {
  user: AuthUser
  status: 'PENDING'
  message: string
  hospitalCode?: string
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    try {
      const result = await apiPost<LoginResult>('/auth/login', credentials)
      sessionService.set({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        refreshTokenExpiresAt: result.refreshTokenExpiresAt,
      })
      return result
    } catch (error) {
      if (error instanceof ApiError) {
        throw new AuthError(loginErrorMessage(error), error.code, error.status, error.details)
      }
      throw error
    }
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

  async registerHospital(input: HospitalRegisterInput): Promise<PendingRegistrationResult> {
    const result = await apiPost<PendingRegistrationResult>(
      '/auth/register/hospital',
      input,
    )
    return result
  },

  async registerDoctor(input: DoctorRegisterInput): Promise<PendingRegistrationResult> {
    const result = await apiPost<PendingRegistrationResult>('/auth/register/doctor', input)
    return result
  },

  async registerReviewer(input: ReviewerRegisterInput): Promise<PendingRegistrationResult> {
    const result = await apiPost<PendingRegistrationResult>('/auth/register/reviewer', input)
    return result
  },

  async lookupHospitalCode(code: string): Promise<HospitalCodeLookup> {
    try {
      return await apiGet<HospitalCodeLookup>(
        `/auth/hospital-code/lookup?code=${encodeURIComponent(code)}`,
      )
    } catch (error) {
      if (error instanceof ApiError && error.code === 'INVALID_HOSPITAL_CODE') {
        throw new AuthError(
          HOSPITAL_CODE_LOOKUP_ERROR_MESSAGES.HOSPITAL_CODE_NOT_FOUND,
          'HOSPITAL_CODE_NOT_FOUND',
          404,
        )
      }
      if (
        error instanceof ApiError &&
        (error.code === 'HOSPITAL_CODE_INACTIVE' || error.code === 'HOSPITAL_CODE_EXPIRED')
      ) {
        throw new AuthError(HOSPITAL_CODE_LOOKUP_ERROR_MESSAGES[error.code], error.code, error.status)
      }
      throw error
    }
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

import { sessionService, type Session } from '@/services/sessionService'

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://127.0.0.1:5000/api'
const REQUEST_TIMEOUT_MS = 15_000

export interface ApiErrorPayload {
  code?: string
  message: string
  details?: unknown
}

export class ApiError extends Error {
  code: string
  status: number
  details?: unknown

  constructor(message: string, code = 'API_ERROR', status = 500, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.details = details
  }
}

interface ApiEnvelope<T> {
  success: boolean
  data: T
  error?: ApiErrorPayload
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

interface RequestOptions {
  method?: HttpMethod
  body?: unknown
  signal?: AbortSignal
}

let refreshPromise: Promise<string> | null = null

const PUBLIC_PATHS = new Set([
  '/health',
  '/auth/login',
  '/auth/register',
  '/auth/register/partner',
  '/auth/refresh',
  '/auth/logout',
  '/auth/verify-email/request',
  '/auth/verify-email',
  '/auth/forgot-password',
  '/auth/reset-password',
])

function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.has(path)
}

function readToken(): string | null {
  return sessionService.get()?.accessToken ?? null
}

function errorFromResponse(payload: ApiErrorPayload, status: number): ApiError {
  return new ApiError(payload.message, payload.code ?? 'API_ERROR', status, payload.details)
}

async function parseError(response: Response): Promise<ApiError> {
  let payload: ApiErrorPayload | null = null
  try {
    const body = (await response.json()) as { error?: ApiErrorPayload }
    payload = body.error ?? null
  } catch {
    // Ignore malformed JSON; fall through to a generic error.
  }

  if (payload) return errorFromResponse(payload, response.status)
  return new ApiError(
    response.status >= 500 ? 'Something went wrong. Please try again.' : 'Request failed.',
    'API_ERROR',
    response.status,
  )
}

async function refreshTokens(refreshToken?: string): Promise<string> {
  const session = sessionService.get()
  const token = refreshToken ?? session?.refreshToken
  if (!token) {
    throw new ApiError('Your session has expired. Please log in again.', 'AUTH_TOKEN_MISSING', 401)
  }

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: token }),
  })

  if (!res.ok) {
    sessionService.clear()
    throw await parseError(res)
  }

  const envelope = (await res.json()) as ApiEnvelope<{
    user: Session['user']
    accessToken: string
    refreshToken: string
    refreshTokenExpiresAt: string
  }>
  const { user, accessToken, refreshToken: nextRefresh, refreshTokenExpiresAt } = envelope.data
  sessionService.set({ user, accessToken, refreshToken: nextRefresh, refreshTokenExpiresAt })
  return accessToken
}

function getAccessToken(): Promise<string> {
  const current = readToken()
  if (current) return Promise.resolve(current)

  const session = sessionService.get()
  refreshPromise ??= refreshTokens(session?.refreshToken)
    .catch(error => {
      throw error
    })
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
  retryOnAuth: boolean = true,
): Promise<T> {
  const publicRequest = isPublicPath(path)
  const accessToken = publicRequest ? null : await getAccessToken()
  const url = `${BASE_URL}${path}`
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  const externalSignal = options.signal
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort()
    externalSignal.addEventListener('abort', () => controller.abort(), { once: true })
  }

  try {
    const res = await fetch(url, {
      method: options.method ?? (options.body !== undefined ? 'POST' : 'GET'),
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    })

    if (res.status === 401 && !publicRequest && retryOnAuth && path !== '/auth/refresh') {
      const refreshToken = sessionService.get()?.refreshToken
      sessionService.clear()
      refreshPromise = null
      await refreshTokens(refreshToken)
      return apiRequest<T>(path, options, false)
    }

    if (!res.ok) {
      throw await parseError(res)
    }

    const envelope = (await res.json()) as ApiEnvelope<T>
    return envelope.data
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('The request timed out. Please try again.', 'REQUEST_TIMEOUT', 408)
    }
    throw new ApiError('Could not reach the server. Please check your connection.', 'NETWORK_ERROR', 0)
  } finally {
    clearTimeout(timeoutId)
  }
}

export function apiGet<T>(path: string, options?: RequestOptions): Promise<T> {
  return apiRequest<T>(path, { ...options, method: 'GET' })
}

export function apiPost<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
  return apiRequest<T>(path, { ...options, method: 'POST', body })
}

export function apiPatch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
  return apiRequest<T>(path, { ...options, method: 'PATCH', body })
}

export function apiPut<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
  return apiRequest<T>(path, { ...options, method: 'PUT', body })
}

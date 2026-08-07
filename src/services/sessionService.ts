import type { AuthUser, LoginResult } from '@/types/rbac'

export interface Session {
  user: AuthUser
  token: string
}

const STORAGE_KEY = 'imgprep.session'

export const sessionService = {
  get(): Session | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as Session) : null
    } catch {
      return null
    }
  },

  set(session: Session): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  },

  update(patch: Partial<AuthUser>): Session | null {
    const current = this.get()
    if (!current) return null
    const next: Session = { ...current, user: { ...current.user, ...patch } }
    this.set(next)
    return next
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY)
  },
}

/** @returns a { result, session } pair or null when no session exists. */
export function readSession(): { result: LoginResult; session: Session } | null {
  const session = sessionService.get()
  if (!session) return null
  return { result: { user: session.user, token: session.token }, session }
}

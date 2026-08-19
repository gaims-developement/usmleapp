import type { AuthUser, RoleId } from '@/types/rbac'
import { apiDelete, apiFormPost, apiGet, apiPatch } from '@/lib/apiClient'

export interface CreateUserInput {
  name: string
  email: string
  role?: RoleId
  password?: string
  college?: string
  dob?: string
  electives?: string[]
  locations?: string[]
}

export interface UpdateUserInput {
  name?: string
  onboarded?: boolean
  college?: string | null
  dob?: string | null
  graduationYear?: number | null
  visaStatus?: string | null
  goals?: string[]
  electives?: string[]
  locations?: string[]
  earliestStart?: string | null
  durationPreference?: number | null
  travelReady?: boolean
}

export const userService = {
  async update(id: string, patch: UpdateUserInput): Promise<AuthUser> {
    void id
    const { user } = await apiPatch<{ user: AuthUser }>(`/users/me`, patch)
    return user
  },
  async findById(id: string): Promise<AuthUser | null> {
    const { user } = await apiGet<{ user: AuthUser }>(`/users/me`)
    return user.id === id ? user : null
  },

  async uploadAvatar(file: File): Promise<AuthUser> {
    const formData = new FormData()
    formData.append('avatar', file)
    const { user } = await apiFormPost<{ user: AuthUser }>(`/users/me/avatar`, formData)
    return user
  },

  async removeAvatar(): Promise<AuthUser> {
    const { user } = await apiDelete<{ user: AuthUser }>(`/users/me/avatar`)
    return user
  },

  async findByEmail(email: string): Promise<AuthUser | null> {
    const { user } = await apiGet<{ user: AuthUser }>(`/users/me`)
    return user.email.toLowerCase() === email.toLowerCase() ? user : null
  },
}

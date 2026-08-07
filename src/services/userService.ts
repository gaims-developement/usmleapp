import { seedUsers, type MockUserRecord } from '@/mock/users'
import type { AuthUser, RoleId } from '@/types/rbac'

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

let users: MockUserRecord[] = [...seedUsers]

function sanitize(record: MockUserRecord): AuthUser {
  const { password: _password, ...user } = record
  return user
}

function nextId() {
  return `usr-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

export const userService = {
  findByCredentials(email: string, password: string): AuthUser | null {
    const match = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
    return match ? sanitize(match) : null
  },

  findByEmail(email: string): AuthUser | null {
    const match = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    return match ? sanitize(match) : null
  },

  findById(id: string): AuthUser | null {
    const match = users.find(u => u.id === id)
    return match ? sanitize(match) : null
  },

  list(): AuthUser[] {
    return users.map(sanitize)
  },

  create(input: CreateUserInput): AuthUser {
    const existing = users.some(u => u.email.toLowerCase() === input.email.toLowerCase())
    if (existing) throw new Error('A user with this email already exists')
    const record: MockUserRecord = {
      id: nextId(),
      name: input.name,
      email: input.email,
      password: input.password ?? '',
      role: input.role ?? 'STUDENT',
      onboarded: input.role === 'STUDENT' ? false : true,
      college: input.college,
      dob: input.dob,
      electives: input.electives,
      locations: input.locations,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    users = [record, ...users]
    return sanitize(record)
  },

  update(id: string, patch: Partial<AuthUser>): AuthUser | null {
    const index = users.findIndex(u => u.id === id)
    if (index === -1) return null
    users[index] = { ...users[index], ...patch }
    return sanitize(users[index])
  },
}

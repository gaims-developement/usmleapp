import { announcements, type Announcement } from '@/mocks/announcements'
import { studyResources, type StudyResource } from '@/mocks/study-resources'
import { studentNotifications, type StudentNotification } from '@/mocks/student/notifications'
import { apiGet, apiPatch, apiPost } from '@/lib/apiClient'
import { sessionService } from '@/services/sessionService'
import { userService, type UpdateUserInput } from '@/services/userService'
import type { AuthUser } from '@/types/rbac'

export interface StudentNotificationPrefs {
  applicationUpdates: boolean
  announcements: boolean
  deadlineReminders: boolean
  marketing: boolean
}

export interface StudentSettings {
  notifications: StudentNotificationPrefs
  privacy: {
    showProfile: boolean
  }
}

export type StudentLogbookEntryStatus = 'pending' | 'approved' | 'rejected'

export interface StudentLogbookEntry {
  id: string
  date: string
  type: string
  description: string
  status: StudentLogbookEntryStatus
  comments: string
}

export interface StudentLogbook {
  doctor: { id: string; name: string; specialty: string } | null
  entries: StudentLogbookEntry[]
}

export interface SubmitLogbookInput {
  type: string
  description: string
  date: string
}

let settings: StudentSettings = {
  notifications: {
    applicationUpdates: true,
    announcements: true,
    deadlineReminders: true,
    marketing: false,
  },
  privacy: {
    showProfile: true,
  },
}

const latency = (ms = 350) => new Promise(resolve => setTimeout(resolve, ms))

let notifications: StudentNotification[] = studentNotifications.map(n => ({ ...n }))

export function addStudentNotification(title: string, message: string) {
  notifications.unshift({
    id: `sn-${Date.now()}`,
    type: 'document',
    title,
    message,
    time: 'Just now',
    read: false,
  })
}

interface BackendNotification {
  id: string
  tone: 'info' | 'success' | 'warning' | 'critical'
  title: string
  body: string
  details?: Record<string, unknown> | null
  read: boolean
  time?: string
  createdAt?: string | null
  rejectedAt?: string | null
  applicationId?: string | null
  documentId?: string | null
  documentName?: string | null
  rejectionReason?: string | null
}

const backendToneToType: Record<BackendNotification['tone'], StudentNotification['type']> = {
  success: 'document',
  info: 'application',
  warning: 'document',
  critical: 'system',
}

function mapNotification(n: BackendNotification): StudentNotification {
  return {
    id: n.id,
    type: backendToneToType[n.tone] ?? 'application',
    title: n.title,
    message: n.body,
    time: n.time ?? '',
    read: n.read,
    applicationId: n.applicationId ?? null,
    documentId: n.documentId ?? null,
    documentName: n.documentName ?? null,
    rejectionReason: n.rejectionReason ?? null,
    createdAt: n.createdAt ?? null,
    rejectedAt: n.rejectedAt ?? null,
    details: n.details ?? null,
  }
}

export const studentService = {
  async fetchStudyResources(): Promise<StudyResource[]> {
    await latency()
    return [...studyResources]
  },

  async fetchAnnouncements(): Promise<Announcement[]> {
    const data = await apiGet<Array<{ id: string; title: string; body: string; author: string | null; publishedAt: string }>>('/notifications/announcements')
    return data.map(a => ({
      id: a.id,
      title: a.title,
      summary: a.body?.slice(0, 150) || '',
      body: a.body || '',
      category: 'platform' as const,
      date: a.publishedAt?.slice(0, 10) || '',
      author: a.author || 'IMG Prep Team',
      pinned: false,
    }))
  },

  async updateProfile(patch: UpdateUserInput): Promise<AuthUser> {
    const session = sessionService.get()
    if (!session) throw new Error('You must be signed in to update your profile.')
    const updated = await userService.update(session.user.id, patch)
    sessionService.update(patch as Partial<AuthUser>)
    return updated
  },

  async fetchSettings(): Promise<StudentSettings> {
    await latency()
    return {
      notifications: { ...settings.notifications },
      privacy: { ...settings.privacy },
    }
  },

  async updateSettings(patch: Partial<StudentSettings>): Promise<StudentSettings> {
    await latency(400)
    settings = {
      notifications: { ...settings.notifications, ...patch.notifications },
      privacy: { ...settings.privacy, ...patch.privacy },
    }
    return {
      notifications: { ...settings.notifications },
      privacy: { ...settings.privacy },
    }
  },

  async fetchNotifications(): Promise<StudentNotification[]> {
    const data = await apiGet<BackendNotification[]>('/notifications')
    return data.map(mapNotification)
  },

  async markAllNotificationsRead(): Promise<StudentNotification[]> {
    await apiPost<void>('/notifications/read-all')
    return this.fetchNotifications()
  },

  async markNotificationRead(id: string): Promise<void> {
    await apiPatch<void>(`/notifications/${id}/read`)
  },

  async fetchLogbook(applicationId: string): Promise<StudentLogbook> {
    return apiGet<StudentLogbook>(`/applications/${applicationId}/logbook`)
  },

  async submitLogbookEntry(applicationId: string, input: SubmitLogbookInput): Promise<StudentLogbookEntry> {
    return apiPost<StudentLogbookEntry>(`/applications/${applicationId}/logbook`, input)
  },
}

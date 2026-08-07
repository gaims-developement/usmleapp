import { announcements, type Announcement } from '@/mocks/announcements'
import { studyResources, type StudyResource } from '@/mocks/study-resources'
import { studentNotifications, type StudentNotification } from '@/mocks/student/notifications'
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

export const studentService = {
  async fetchStudyResources(): Promise<StudyResource[]> {
    await latency()
    return [...studyResources]
  },

  async fetchAnnouncements(): Promise<Announcement[]> {
    await latency()
    return [...announcements].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return b.date.localeCompare(a.date)
    })
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
    await latency()
    return notifications.map(n => ({ ...n }))
  },

  async markAllNotificationsRead(): Promise<StudentNotification[]> {
    await latency(200)
    notifications = notifications.map(n => ({ ...n, read: true }))
    return notifications.map(n => ({ ...n }))
  },
}

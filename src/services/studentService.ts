import { announcements, type Announcement } from '@/mocks/announcements'
import { studyResources, type StudyResource } from '@/mocks/study-resources'
import { sessionService } from '@/services/sessionService'
import { userService } from '@/services/userService'
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

  async updateProfile(patch: Partial<AuthUser>): Promise<AuthUser> {
    await latency(500)
    const session = sessionService.get()
    if (!session) throw new Error('You must be signed in to update your profile.')
    const updated = userService.update(session.user.id, patch)
    if (!updated) throw new Error('User not found.')
    sessionService.update(patch)
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
}

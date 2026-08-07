import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { studentService } from '@/services/studentService'
import type { StudentSettings } from '@/services/studentService'
import type { UpdateUserInput } from '@/services/userService'

export const studentQueryKeys = {
  resources: ['resources'] as const,
  announcements: ['announcements'] as const,
  profile: ['profile'] as const,
  settings: ['settings'] as const,
  notifications: ['student', 'notifications'] as const,
}

export function useStudyResources() {
  return useQuery({
    queryKey: studentQueryKeys.resources,
    queryFn: studentService.fetchStudyResources,
    placeholderData: keepPreviousData,
  })
}

export function useAnnouncements() {
  return useQuery({
    queryKey: studentQueryKeys.announcements,
    queryFn: studentService.fetchAnnouncements,
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (patch: UpdateUserInput) => studentService.updateProfile(patch),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: studentQueryKeys.profile })
    },
  })
}

export function useStudentSettings() {
  return useQuery({
    queryKey: studentQueryKeys.settings,
    queryFn: studentService.fetchSettings,
  })
}

export function useUpdateStudentSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (patch: Partial<StudentSettings>) => studentService.updateSettings(patch),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: studentQueryKeys.settings })
    },
  })
}

export function useStudentNotifications() {
  return useQuery({
    queryKey: studentQueryKeys.notifications,
    queryFn: studentService.fetchNotifications,
  })
}

export function useMarkStudentNotificationsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => studentService.markAllNotificationsRead(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: studentQueryKeys.notifications })
    },
  })
}

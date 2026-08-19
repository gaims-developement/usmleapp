import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createHospitalAnnouncement,
  createHospitalDepartment,
  createHospitalDoctor,
  createHospitalProgram,
  decideApplication,
  deleteHospitalAnnouncement,
  deleteHospitalDepartment,
  fetchHospitalAnnouncements,
  fetchHospitalApplication,
  fetchHospitalApplications,
  fetchHospitalCalendarEvents,
  fetchHospitalDoctors,
  fetchHospitalNotifications,
  fetchHospitalOrganization,
  fetchHospitalProfile,
  fetchHospitalProgram,
  fetchHospitalPrograms,
  fetchHospitalStudents,
  fetchPendingDoctors,
  fetchPendingReviewers,
  approveMember,
  rejectMember,
  markAllHospitalNotificationsRead,
  regenerateHospitalCode,
  scheduleApplication,
  setProgramStatus,
  updateHospitalAnnouncement,
  updateHospitalProgram,
  updateInternalNotes,
  type HospitalAnnouncementInput,
  type HospitalDecision,
  type HospitalDoctorInput,
  type HospitalProgramInput,
} from '@/services/hospitalService'

export const hospitalQueryKeys = {
  applications: ['hospital', 'applications'] as const,
  application: (id: string) => ['hospital', 'application', id] as const,
  programs: ['hospital', 'programs'] as const,
  program: (id: string) => ['hospital', 'program', id] as const,
  doctors: ['hospital', 'doctors'] as const,
  students: ['hospital', 'students'] as const,
  profile: ['hospital', 'profile'] as const,
  organization: ['hospital', 'organization'] as const,
  notifications: ['hospital', 'notifications'] as const,
  announcements: ['hospital', 'announcements'] as const,
  calendar: ['hospital', 'calendar'] as const,
  pendingDoctors: ['hospital', 'pending-doctors'] as const,
  pendingReviewers: ['hospital', 'pending-reviewers'] as const,
}

const invalidateApplication = (queryClient: ReturnType<typeof useQueryClient>, id: string) => {
  queryClient.invalidateQueries({ queryKey: hospitalQueryKeys.applications })
  queryClient.invalidateQueries({ queryKey: hospitalQueryKeys.application(id) })
  queryClient.invalidateQueries({ queryKey: hospitalQueryKeys.calendar })
}

export const useHospitalApplications = () =>
  useQuery({ queryKey: hospitalQueryKeys.applications, queryFn: fetchHospitalApplications })

export const useHospitalApplication = (id: string) =>
  useQuery({ queryKey: hospitalQueryKeys.application(id), queryFn: () => fetchHospitalApplication(id) })

export const useHospitalPrograms = () =>
  useQuery({ queryKey: hospitalQueryKeys.programs, queryFn: fetchHospitalPrograms })

export const useHospitalProgram = (id: string) =>
  useQuery({
    queryKey: hospitalQueryKeys.program(id),
    queryFn: () => fetchHospitalProgram(id),
    enabled: id.length > 0,
  })

export const useHospitalDoctors = () =>
  useQuery({ queryKey: hospitalQueryKeys.doctors, queryFn: fetchHospitalDoctors })

export const useCreateHospitalDoctor = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: HospitalDoctorInput) => createHospitalDoctor(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hospitalQueryKeys.doctors })
    },
  })
}

export const useHospitalStudents = () =>
  useQuery({ queryKey: hospitalQueryKeys.students, queryFn: fetchHospitalStudents })

export const useHospitalProfile = () =>
  useQuery({ queryKey: hospitalQueryKeys.profile, queryFn: fetchHospitalProfile })

export const useHospitalOrganization = () =>
  useQuery({ queryKey: hospitalQueryKeys.organization, queryFn: fetchHospitalOrganization })

export const useCreateHospitalDepartment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => createHospitalDepartment(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hospitalQueryKeys.organization })
    },
  })
}

export const useDeleteHospitalDepartment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteHospitalDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hospitalQueryKeys.organization })
    },
  })
}

export const useRegenerateHospitalCode = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => regenerateHospitalCode(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hospitalQueryKeys.organization })
    },
  })
}

export const useHospitalNotifications = () =>
  useQuery({ queryKey: hospitalQueryKeys.notifications, queryFn: fetchHospitalNotifications })

export const useHospitalAnnouncements = () =>
  useQuery({ queryKey: hospitalQueryKeys.announcements, queryFn: fetchHospitalAnnouncements })

export const useHospitalCalendarEvents = () =>
  useQuery({ queryKey: hospitalQueryKeys.calendar, queryFn: fetchHospitalCalendarEvents })

export const useDecideApplication = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ applicationId, decision, note }: { applicationId: string; decision: HospitalDecision; note: string }) =>
      decideApplication(applicationId, decision, note),
    onSuccess: (app: any) => invalidateApplication(queryClient, app.id),
  })
}

export const useScheduleApplication = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ applicationId, doctorId, start, end }: { applicationId: string; doctorId: string; start: string; end: string }) =>
      scheduleApplication(applicationId, doctorId, start, end),
    onSuccess: (app: any) => invalidateApplication(queryClient, app.id),
  })
}

export const useUpdateInternalNotes = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ applicationId, notes }: { applicationId: string; notes: string }) =>
      updateInternalNotes(applicationId, notes),
    onSuccess: (app: any) => invalidateApplication(queryClient, app.id),
  })
}

export const useCreateHospitalProgram = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: HospitalProgramInput) => createHospitalProgram(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hospitalQueryKeys.programs })
    },
  })
}

export const useUpdateHospitalProgram = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ programId, patch }: { programId: string; patch: Partial<HospitalProgramInput> }) =>
      updateHospitalProgram(programId, patch),
    onSuccess: (p: any) => {
      queryClient.invalidateQueries({ queryKey: hospitalQueryKeys.programs })
      queryClient.invalidateQueries({ queryKey: hospitalQueryKeys.program(p.id) })
    },
  })
}

export const useSetProgramStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ programId, status }: { programId: string; status: 'published' | 'paused' | 'archived' | 'draft' }) =>
      setProgramStatus(programId, status),
    onSuccess: (p: any) => {
      queryClient.invalidateQueries({ queryKey: hospitalQueryKeys.programs })
      queryClient.invalidateQueries({ queryKey: hospitalQueryKeys.program(p.id) })
    },
  })
}

export const useCreateHospitalAnnouncement = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: HospitalAnnouncementInput) => createHospitalAnnouncement(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hospitalQueryKeys.announcements })
    },
  })
}

export const useUpdateHospitalAnnouncement = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ announcementId, patch }: { announcementId: string; patch: Partial<HospitalAnnouncementInput> }) =>
      updateHospitalAnnouncement(announcementId, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hospitalQueryKeys.announcements })
    },
  })
}

export const useDeleteHospitalAnnouncement = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (announcementId: string) => deleteHospitalAnnouncement(announcementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hospitalQueryKeys.announcements })
    },
  })
}

export const useMarkHospitalNotificationsRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => markAllHospitalNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hospitalQueryKeys.notifications })
    },
  })
}

export const usePendingDoctors = () =>
  useQuery({ queryKey: hospitalQueryKeys.pendingDoctors, queryFn: fetchPendingDoctors })

export const usePendingReviewers = () =>
  useQuery({ queryKey: hospitalQueryKeys.pendingReviewers, queryFn: fetchPendingReviewers })

export const useApproveMember = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: 'DOCTOR' | 'REVIEWER' }) =>
      approveMember(memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hospitalQueryKeys.pendingDoctors })
      queryClient.invalidateQueries({ queryKey: hospitalQueryKeys.pendingReviewers })
      queryClient.invalidateQueries({ queryKey: hospitalQueryKeys.doctors })
    },
  })
}

export const useRejectMember = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ memberId, role, reason }: { memberId: string; role: 'DOCTOR' | 'REVIEWER'; reason?: string }) =>
      rejectMember(memberId, role, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hospitalQueryKeys.pendingDoctors })
      queryClient.invalidateQueries({ queryKey: hospitalQueryKeys.pendingReviewers })
    },
  })
}

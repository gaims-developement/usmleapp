import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  assignReviewer,
  createAnnouncement,
  createDoctor,
  createHospital,
  createProgram,
  createTicket,
  deleteAnnouncement,
  fetchAdminApplications,
  fetchAdminDocuments,
  fetchAdminDoctors,
  fetchAdminHospitals,
  fetchAdminKpis,
  fetchAdminPayments,
  fetchAdminPrograms,
  fetchAdminReviewers,
  fetchAdminStudents,
  fetchAdminUsers,
  fetchAdminAnalytics,
  fetchAnnouncements,
  fetchAuditLogs,
  fetchCmsPages,
  fetchDocument,
  fetchStudentDocumentsGrouped,
  fetchNotifications,
  fetchOpsKpis,
  fetchPlatformSettings,
  fetchPlatformUptime,
  fetchRecentActivity,
  fetchRecentApplications,
  fetchReportCatalog,
  fetchRoleSummaries,
  fetchSupportTickets,
  forwardApplication,
  markAllNotificationsRead,
  removeHospital,
  setDocStatus,
  setHospitalStatus,
  setProgramStatus,
  setTicketStatus,
  toggleFlagApplication,
  updateAnnouncement,
  type AssignReviewerInput,
  type ForwardApplicationInput,
  type NewAnnouncementInput,
  type NewDoctorInput,
  type NewHospitalInput,
  type NewProgramInput,
  type NewTicketInput,
  sendAnnouncement,
  type SendAnnouncementInput,
} from '@/services/adminService'
import type { AnnouncementStatus, SupportStatus } from '@/mocks/admin/content'
import type { HospitalStatus } from '@/mocks/admin/people'
import type { DocVerificationStatus, ProgramStatus } from '@/mocks/admin/operations'

export const adminQueryKeys = {
  kpis: ['admin', 'kpis'] as const,
  analytics: ['admin', 'analytics'] as const,
  uptime: ['admin', 'uptime'] as const,
  activity: ['admin', 'activity'] as const,
  applications: ['admin', 'applications'] as const,
  recentApplications: ['admin', 'applications', 'recent'] as const,
  users: ['admin', 'users'] as const,
  hospitals: ['admin', 'hospitals'] as const,
  doctors: ['admin', 'doctors'] as const,
  reviewers: ['admin', 'reviewers'] as const,
  programs: ['admin', 'programs'] as const,
  documents: ['admin', 'documents'] as const,
  document: (id: string) => ['admin', 'documents', id] as const,
  payments: ['admin', 'payments'] as const,
  announcements: ['admin', 'announcements'] as const,
  cms: ['admin', 'cms'] as const,
  auditLogs: ['admin', 'audit-logs'] as const,
  support: ['admin', 'support'] as const,
  roles: ['admin', 'roles'] as const,
  settings: ['admin', 'settings'] as const,
  students: ['admin', 'students'] as const,
  opsKpis: ['admin', 'ops-kpis'] as const,
  notifications: ['admin', 'notifications'] as const,
  reportCatalog: ['admin', 'reports'] as const,
}

export const useAdminKpis = () =>
  useQuery({ queryKey: adminQueryKeys.kpis, queryFn: fetchAdminKpis })

export const useAdminAnalytics = () =>
  useQuery({ queryKey: adminQueryKeys.analytics, queryFn: fetchAdminAnalytics })

export const usePlatformUptime = () =>
  useQuery({ queryKey: adminQueryKeys.uptime, queryFn: fetchPlatformUptime })

export const useRecentActivity = () =>
  useQuery({ queryKey: adminQueryKeys.activity, queryFn: fetchRecentActivity })

export const useAdminApplications = () =>
  useQuery({ queryKey: adminQueryKeys.applications, queryFn: fetchAdminApplications })

export const useRecentApplications = () =>
  useQuery({ queryKey: adminQueryKeys.recentApplications, queryFn: fetchRecentApplications })

export const useAdminUsers = () =>
  useQuery({ queryKey: adminQueryKeys.users, queryFn: fetchAdminUsers })

export const useAdminHospitals = () =>
  useQuery({ queryKey: adminQueryKeys.hospitals, queryFn: fetchAdminHospitals })

export const useAdminDoctors = () =>
  useQuery({ queryKey: adminQueryKeys.doctors, queryFn: fetchAdminDoctors })

export const useAdminReviewers = () =>
  useQuery({ queryKey: adminQueryKeys.reviewers, queryFn: fetchAdminReviewers })

export const useAdminPrograms = () =>
  useQuery({ queryKey: adminQueryKeys.programs, queryFn: fetchAdminPrograms })

export const useAdminDocuments = () =>
  useQuery({ queryKey: adminQueryKeys.documents, queryFn: fetchAdminDocuments })

export const useStudentGroupedDocuments = () =>
  useQuery({
    queryKey: [...adminQueryKeys.documents, 'students'],
    queryFn: fetchStudentDocumentsGrouped,
  })

export const useAdminDocument = (id: string | null) =>
  useQuery({
    queryKey: adminQueryKeys.document(id ?? ''),
    queryFn: () => fetchDocument(id ?? ''),
    enabled: !!id,
  })

export function useSetDocStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: DocVerificationStatus; note?: string }) => setDocStatus(id, status, note),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminQueryKeys.documents })
    },
  })
}

export const useAdminPayments = () =>
  useQuery({ queryKey: adminQueryKeys.payments, queryFn: fetchAdminPayments })

export const useAnnouncements = () =>
  useQuery({ queryKey: adminQueryKeys.announcements, queryFn: fetchAnnouncements })

export const useCmsPages = () =>
  useQuery({ queryKey: adminQueryKeys.cms, queryFn: fetchCmsPages })

export const useAuditLogs = () =>
  useQuery({ queryKey: adminQueryKeys.auditLogs, queryFn: fetchAuditLogs })

export const useSupportTickets = () =>
  useQuery({ queryKey: adminQueryKeys.support, queryFn: fetchSupportTickets })

export const useRoleSummaries = () =>
  useQuery({ queryKey: adminQueryKeys.roles, queryFn: fetchRoleSummaries })

export const usePlatformSettings = () =>
  useQuery({ queryKey: adminQueryKeys.settings, queryFn: fetchPlatformSettings })

export const useAdminStudents = () =>
  useQuery({ queryKey: adminQueryKeys.students, queryFn: fetchAdminStudents })

export const useOpsKpis = () =>
  useQuery({ queryKey: adminQueryKeys.opsKpis, queryFn: fetchOpsKpis })

export const useNotifications = () =>
  useQuery({ queryKey: adminQueryKeys.notifications, queryFn: fetchNotifications })

export const useReportCatalog = () =>
  useQuery({ queryKey: adminQueryKeys.reportCatalog, queryFn: fetchReportCatalog })

const invalidate = (queryClient: ReturnType<typeof useQueryClient>, keys: readonly (readonly string[])[]) => {
  for (const key of keys) queryClient.invalidateQueries({ queryKey: key })
}

export const useCreateHospital = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: NewHospitalInput) => createHospital(input),
    onSuccess: () => {
      invalidate(queryClient, [adminQueryKeys.hospitals, adminQueryKeys.opsKpis])
    },
  })
}

export const useAssignReviewer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: AssignReviewerInput) => assignReviewer(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.applications })
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.notifications })
    },
  })
}

export const useForwardApplication = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ForwardApplicationInput) => forwardApplication(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.applications })
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.notifications })
    },
  })
}

export const useToggleFlagApplication = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (applicationId: string) => toggleFlagApplication(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.applications })
    },
  })
}

export const useSetHospitalStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { hospitalId: string; status: HospitalStatus }) =>
      setHospitalStatus(input.hospitalId, input.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.hospitals })
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.opsKpis })
    },
  })
}

export const useRemoveHospital = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (hospitalId: string) => removeHospital(hospitalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.hospitals })
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.opsKpis })
    },
  })
}

export const useCreateProgram = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: NewProgramInput) => createProgram(input),
    onSuccess: () => {
      invalidate(queryClient, [adminQueryKeys.programs, adminQueryKeys.opsKpis])
    },
  })
}

export const useSetProgramStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { programId: string; status: ProgramStatus }) =>
      setProgramStatus(input.programId, input.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.programs })
    },
  })
}

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: NewAnnouncementInput) => createAnnouncement(input),
    onSuccess: () => {
      invalidate(queryClient, [adminQueryKeys.announcements, adminQueryKeys.opsKpis])
    },
  })
}

export const useSendAnnouncement = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SendAnnouncementInput) => sendAnnouncement(input),
    onSuccess: () => {
      invalidate(queryClient, [adminQueryKeys.announcements, adminQueryKeys.notifications, adminQueryKeys.opsKpis])
    },
  })
}

export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { announcementId: string; data: Partial<NewAnnouncementInput> }) =>
      updateAnnouncement(input.announcementId, input.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.announcements })
    },
  })
}

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (announcementId: string) => deleteAnnouncement(announcementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.announcements })
    },
  })
}

export const useSetTicketStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { ticketId: string; status: SupportStatus }) =>
      setTicketStatus(input.ticketId, input.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.support })
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.opsKpis })
    },
  })
}

export const useCreateTicket = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: NewTicketInput) => createTicket(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.support })
    },
  })
}

export const useMarkNotificationsRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.notifications })
    },
  })
}

export const useCreateDoctor = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: NewDoctorInput) => createDoctor(input),
    onSuccess: () => {
      invalidate(queryClient, [adminQueryKeys.doctors, adminQueryKeys.opsKpis])
    },
  })
}

export type { NewAnnouncementInput, AnnouncementStatus }


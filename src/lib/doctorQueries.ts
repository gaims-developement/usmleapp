import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchCertificates,
  fetchDoctorConversations,
  fetchDoctorMessageTemplates,
  fetchDoctorNotifications,
  fetchDoctorProfile,
  fetchDoctorStudentDetail,
  fetchDoctorStudents,
  fetchEvaluations,
  fetchLetters,
  fetchLogbookEntries,
  fetchTodaySchedule,
  fetchUpcomingRotationStarts,
  markAllDoctorNotificationsRead,
  markDoctorConversationRead,
  saveEvaluation,
  saveLetter,
  sendDoctorMessage,
  sendDoctorMessageToStudent,
  setCertificateStatus,
  setLetterStatus,
  setLogbookStatus,
  submitEvaluation,
  type EvaluationDraft,
  type LetterDraft,
} from '@/services/doctorService'
import type { CertificateStatus } from '@/mocks/doctor/certificates'
import type { LogbookStatus } from '@/mocks/doctor/logbook'
import type { LorStatus } from '@/mocks/doctor/letters'

export const doctorQueryKeys = {
  students: ['doctor', 'students'] as const,
  student: (id: string) => ['doctor', 'student', id] as const,
  profile: ['doctor', 'profile'] as const,
  schedule: ['doctor', 'schedule'] as const,
  upcoming: ['doctor', 'upcoming'] as const,
  logbook: ['doctor', 'logbook'] as const,
  evaluations: ['doctor', 'evaluations'] as const,
  certificates: ['doctor', 'certificates'] as const,
  letters: ['doctor', 'letters'] as const,
  conversations: ['doctor', 'conversations'] as const,
  templates: ['doctor', 'templates'] as const,
  notifications: ['doctor', 'notifications'] as const,
}

export const useDoctorStudents = () =>
  useQuery({ queryKey: doctorQueryKeys.students, queryFn: fetchDoctorStudents })

export const useDoctorStudentDetail = (id: string) =>
  useQuery({ queryKey: doctorQueryKeys.student(id), queryFn: () => fetchDoctorStudentDetail(id) })

export const useDoctorProfile = () =>
  useQuery({ queryKey: doctorQueryKeys.profile, queryFn: fetchDoctorProfile })

export const useTodaySchedule = () =>
  useQuery({ queryKey: doctorQueryKeys.schedule, queryFn: fetchTodaySchedule })

export const useUpcomingRotationStarts = () =>
  useQuery({ queryKey: doctorQueryKeys.upcoming, queryFn: fetchUpcomingRotationStarts })

export const useLogbookEntries = () =>
  useQuery({ queryKey: doctorQueryKeys.logbook, queryFn: fetchLogbookEntries })

export const useEvaluations = () =>
  useQuery({ queryKey: doctorQueryKeys.evaluations, queryFn: fetchEvaluations })

export const useCertificates = () =>
  useQuery({ queryKey: doctorQueryKeys.certificates, queryFn: fetchCertificates })

export const useLetters = () =>
  useQuery({ queryKey: doctorQueryKeys.letters, queryFn: fetchLetters })

export const useDoctorConversations = () =>
  useQuery({ queryKey: doctorQueryKeys.conversations, queryFn: fetchDoctorConversations })

export const useDoctorMessageTemplates = () =>
  useQuery({ queryKey: doctorQueryKeys.templates, queryFn: fetchDoctorMessageTemplates })

export const useDoctorNotifications = () =>
  useQuery({ queryKey: doctorQueryKeys.notifications, queryFn: fetchDoctorNotifications })

export const useSetLogbookStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ entryId, status, comments }: { entryId: string; status: LogbookStatus; comments?: string }) =>
      setLogbookStatus(entryId, status, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorQueryKeys.logbook })
      queryClient.invalidateQueries({ queryKey: ['doctor', 'student'] })
    },
  })
}

export const useSaveEvaluation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ evaluationId, draft }: { evaluationId: string; draft: EvaluationDraft }) =>
      saveEvaluation(evaluationId, draft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorQueryKeys.evaluations })
    },
  })
}

export const useSubmitEvaluation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ evaluationId, draft }: { evaluationId: string; draft: EvaluationDraft }) =>
      submitEvaluation(evaluationId, draft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorQueryKeys.evaluations })
    },
  })
}

export const useSetCertificateStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ certificateId, status }: { certificateId: string; status: CertificateStatus }) =>
      setCertificateStatus(certificateId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorQueryKeys.certificates })
    },
  })
}

export const useSaveLetter = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ letterId, draft }: { letterId: string; draft: LetterDraft }) =>
      saveLetter(letterId, draft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorQueryKeys.letters })
    },
  })
}

export const useSetLetterStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ letterId, status }: { letterId: string; status: LorStatus }) =>
      setLetterStatus(letterId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorQueryKeys.letters })
    },
  })
}

export const useSendDoctorMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, text, attachment }: { conversationId: string; text: string; attachment?: { name: string; size: string } }) =>
      sendDoctorMessage(conversationId, text, attachment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorQueryKeys.conversations })
    },
  })
}

export const useSendDoctorMessageToStudent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studentId, text }: { studentId: string; text: string }) =>
      sendDoctorMessageToStudent(studentId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorQueryKeys.conversations })
    },
  })
}

export const useMarkDoctorConversationRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (conversationId: string) => markDoctorConversationRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorQueryKeys.conversations })
    },
  })
}

export const useMarkDoctorNotificationsRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => markAllDoctorNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorQueryKeys.notifications })
    },
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  approveApplication,
  fetchConversations,
  fetchMessageTemplates,
  fetchReviewerApplication,
  fetchReviewerApplications,
  fetchReviewerNotifications,
  fetchReviewerProfile,
  forwardToHospital,
  markAllReviewerNotificationsRead,
  markConversationRead,
  rejectApplication,
  requestChanges,
  saveDraft,
  sendMessage,
  sendMessageToStudent,
  setDocumentNote,
  setDocumentVerification,
  startReview,
  type ReviewDraft,
} from '@/services/reviewerService'
import type { DocVerification, ReviewDocument, ReviewerApplication } from '@/mocks/reviewer/applications'

export const reviewerQueryKeys = {
  applications: ['reviewer', 'applications'] as const,
  application: (id: string) => ['reviewer', 'application', id] as const,
  profile: ['reviewer', 'profile'] as const,
  conversations: ['reviewer', 'conversations'] as const,
  templates: ['reviewer', 'templates'] as const,
  notifications: ['reviewer', 'notifications'] as const,
}

const invalidateApplication = (queryClient: ReturnType<typeof useQueryClient>, id: string) => {
  queryClient.invalidateQueries({ queryKey: reviewerQueryKeys.applications })
  queryClient.invalidateQueries({ queryKey: reviewerQueryKeys.application(id) })
}

const patchDocumentInCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  applicationId: string,
  documentId: string,
  patch: Partial<Pick<ReviewDocument, 'verification' | 'note'>>,
) => {
  const applyToApp = (app?: ReviewerApplication): ReviewerApplication | undefined => {
    if (!app) return app
    return {
      ...app,
      documents: (app.documents ?? []).map(d =>
        d.applicationDocumentId === documentId ? { ...d, ...patch } : d,
      ),
    }
  }

  queryClient.setQueryData<ReviewerApplication[]>(reviewerQueryKeys.applications, old =>
    (old ?? []).map(a => (a.id === applicationId ? applyToApp(a)! : a)),
  )
  queryClient.setQueryData<ReviewerApplication>(reviewerQueryKeys.application(applicationId), old =>
    applyToApp(old)!,
  )
}

export const useReviewerApplications = () =>
  useQuery({ queryKey: reviewerQueryKeys.applications, queryFn: fetchReviewerApplications })

export const useReviewerApplication = (id: string) =>
  useQuery({ queryKey: reviewerQueryKeys.application(id), queryFn: () => fetchReviewerApplication(id) })

export const useReviewerProfile = () =>
  useQuery({ queryKey: reviewerQueryKeys.profile, queryFn: fetchReviewerProfile })

export const useConversations = () =>
  useQuery({ queryKey: reviewerQueryKeys.conversations, queryFn: fetchConversations })

export const useMessageTemplates = () =>
  useQuery({ queryKey: reviewerQueryKeys.templates, queryFn: fetchMessageTemplates })

export const useReviewerNotifications = () =>
  useQuery({ queryKey: reviewerQueryKeys.notifications, queryFn: fetchReviewerNotifications })

export const useStartReview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (applicationId: string) => startReview(applicationId),
    onSuccess: (app) => invalidateApplication(queryClient, app.id),
  })
}

export const useSaveDraft = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ applicationId, draft }: { applicationId: string; draft: ReviewDraft }) =>
      saveDraft(applicationId, draft),
    onSuccess: (app) => invalidateApplication(queryClient, app.id),
  })
}

export const useApproveApplication = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ applicationId, draft }: { applicationId: string; draft?: ReviewDraft }) =>
      approveApplication(applicationId, draft),
    onSuccess: (app) => invalidateApplication(queryClient, app.id),
  })
}

export const useRejectApplication = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ applicationId, draft, message }: { applicationId: string; draft?: ReviewDraft; message?: string }) =>
      rejectApplication(applicationId, draft, message),
    onSuccess: (app) => {
      invalidateApplication(queryClient, app.id)
      queryClient.invalidateQueries({ queryKey: reviewerQueryKeys.conversations })
    },
  })
}

export const useRequestChanges = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ applicationId, draft, message }: { applicationId: string; draft?: ReviewDraft; message?: string }) =>
      requestChanges(applicationId, draft, message),
    onSuccess: (app) => {
      invalidateApplication(queryClient, app.id)
      queryClient.invalidateQueries({ queryKey: reviewerQueryKeys.conversations })
    },
  })
}

export const useForwardToHospital = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ applicationId, draft }: { applicationId: string; draft?: ReviewDraft }) =>
      forwardToHospital(applicationId, draft),
    onSuccess: (app) => {
      invalidateApplication(queryClient, app.id)
      queryClient.invalidateQueries({ queryKey: reviewerQueryKeys.conversations })
    },
  })
}

export const useSetDocumentVerification = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ applicationId, documentId, verification, note }: { applicationId: string; documentId: string; verification: DocVerification; note?: string }) =>
      setDocumentVerification(applicationId, documentId, verification, note),
    onMutate: async ({ applicationId, documentId, verification, note }) => {
      await queryClient.cancelQueries({ queryKey: reviewerQueryKeys.applications })
      await queryClient.cancelQueries({ queryKey: reviewerQueryKeys.application(applicationId) })
      patchDocumentInCache(queryClient, applicationId, documentId, {
        verification,
        ...(note !== undefined ? { note } : {}),
      })
    },
    onError: (_err, { applicationId }) => {
      invalidateApplication(queryClient, applicationId)
    },
    onSuccess: (_data, { applicationId }) => {
      invalidateApplication(queryClient, applicationId)
    },
  })
}

export const useSetDocumentNote = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ applicationId, documentId, note }: { applicationId: string; documentId: string; note: string }) =>
      setDocumentNote(applicationId, documentId, note),
    onMutate: async ({ applicationId, documentId, note }) => {
      await queryClient.cancelQueries({ queryKey: reviewerQueryKeys.applications })
      await queryClient.cancelQueries({ queryKey: reviewerQueryKeys.application(applicationId) })
      patchDocumentInCache(queryClient, applicationId, documentId, { note })
    },
    onError: (_err, { applicationId }) => {
      invalidateApplication(queryClient, applicationId)
    },
    onSuccess: (_data, { applicationId }) => {
      invalidateApplication(queryClient, applicationId)
    },
  })
}

export const useMarkReviewerNotificationsRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => markAllReviewerNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewerQueryKeys.notifications })
    },
  })
}

export const useSendMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, text, attachment }: { conversationId: string; text: string; attachment?: { name: string; size: string } }) =>
      sendMessage(conversationId, text, attachment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewerQueryKeys.conversations })
    },
  })
}

export const useSendMessageToStudent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studentId, applicationId, text }: { studentId: string; applicationId: string; text: string }) =>
      sendMessageToStudent(studentId, applicationId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewerQueryKeys.conversations })
    },
  })
}

export const useMarkConversationRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (conversationId: string) => markConversationRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewerQueryKeys.conversations })
    },
  })
}

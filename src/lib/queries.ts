import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/apiClient'
import type { Application, Elective, UserDocument } from '@/lib/types'

export interface ElectiveFilters {
  search?: string
  specialty?: string
  city?: string
  duration?: number
  sort?: 'rating' | 'fee' | 'soonest'
}

export interface ApplicationInput {
  electiveId: string
  startDate: string
  durationWeeks: number
  documentsIncluded: string[]
  paymentMethod: string
  transactionId: string
}

export interface OnboardingData {
  graduationYear?: number
  visaStatus: string
  goals: string[]
  earliestStart: string
  durationPreference: number
  travelReady: boolean
  onboarded?: boolean
}

export const queryKeys = {
  electives: ['electives'] as const,
  elective: (id: string) => ['electives', id] as const,
  applications: ['applications'] as const,
  documents: ['documents'] as const,
  onboarding: ['onboarding'] as const,
}

export function useElectives(filters: ElectiveFilters = {}) {
  return useQuery({
    queryKey: ['electives', filters],
    queryFn: async () => {
      const sp = new URLSearchParams()
      if (filters.search) sp.set('search', filters.search)
      if (filters.specialty) sp.set('specialty', filters.specialty)
      if (filters.city) sp.set('city', filters.city)
      if (filters.duration) sp.set('duration', String(filters.duration))
      const queryStr = sp.toString() ? `?${sp.toString()}` : ''
      return apiGet<Elective[]>(`/programs${queryStr}`)
    },
    placeholderData: keepPreviousData,
  })
}

export function useElective(id: string) {
  return useQuery({
    queryKey: queryKeys.elective(id),
    queryFn: () => apiGet<Elective>(`/programs/${id}`),
    enabled: Boolean(id),
  })
}

export function useApplications() {
  return useQuery({
    queryKey: queryKeys.applications,
    queryFn: () => apiGet<Application[]>(`/applications`),
  })
}

export function useSubmitApplication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ApplicationInput) => apiPost<Application>('/applications', input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.applications })
      void qc.invalidateQueries({ queryKey: ['admin', 'applications'] })
      void qc.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
    },
  })
}

export function useWithdrawApplication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiPatch<Application>(`/applications/${id}/withdraw`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.applications })
      void qc.invalidateQueries({ queryKey: ['admin', 'applications'] })
      void qc.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
    },
  })
}

export function useDocuments() {
  return useQuery({
    queryKey: queryKeys.documents,
    queryFn: () => apiGet<UserDocument[]>('/documents'),
  })
}

export function useUploadDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      apiPost<{ status: string }>(`/documents/${id}`, { fileName: file.name }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.documents })
      void qc.invalidateQueries({ queryKey: ['admin', 'students'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'documents'] })
      void qc.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
    },
  })
}

export function useRemoveDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete<void>(`/documents/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.documents })
      void qc.invalidateQueries({ queryKey: ['admin', 'students'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'documents'] })
      void qc.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
    },
  })
}

export function useCompleteOnboarding() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: OnboardingData) => apiPatch<{ success: boolean }>('/users/me', { onboarded: true, ...data }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.onboarding })
    },
  })
}

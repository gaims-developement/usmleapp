import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  completeOnboarding,
  fetchApplications,
  fetchDocuments,
  fetchElectiveById,
  fetchElectives,
  removeDocument,
  submitApplication,
  uploadDocument,
  withdrawApplication,
  type ApplicationInput,
  type ElectiveFilters,
  type OnboardingData,
} from '@/lib/api'

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
    queryFn: () => fetchElectives(filters),
    placeholderData: keepPreviousData,
  })
}

export function useElective(id: string) {
  return useQuery({
    queryKey: queryKeys.elective(id),
    queryFn: () => fetchElectiveById(id),
    enabled: Boolean(id),
  })
}

export function useApplications() {
  return useQuery({
    queryKey: queryKeys.applications,
    queryFn: fetchApplications,
  })
}

export function useSubmitApplication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ApplicationInput) => submitApplication(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.applications }),
  })
}

export function useWithdrawApplication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => withdrawApplication(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.applications }),
  })
}

export function useDocuments() {
  return useQuery({
    queryKey: queryKeys.documents,
    queryFn: fetchDocuments,
  })
}

export function useUploadDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => uploadDocument(id, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.documents }),
  })
}

export function useRemoveDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => removeDocument(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.documents }),
  })
}

export function useCompleteOnboarding() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: OnboardingData) => completeOnboarding(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.onboarding }),
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  partnerService,
  type DoctorRegistrationInput,
  type HospitalCodeLookup,
  type HospitalRegistrationInput,
  type ReviewerRegistrationInput,
} from '@/services/partnerService'

export const partnerQueryKeys = {
  hospitals: ['partner', 'hospitals'] as const,
  doctors: ['partner', 'doctors'] as const,
  reviewers: ['partner', 'reviewers'] as const,
  approvals: ['partner', 'approvals'] as const,
  lastRegistration: ['partner', 'last-registration'] as const,
}

export function usePartnerHospitals() {
  return useQuery({
    queryKey: partnerQueryKeys.hospitals,
    queryFn: partnerService.listHospitals,
  })
}

export function usePartnerDoctors() {
  return useQuery({
    queryKey: partnerQueryKeys.doctors,
    queryFn: partnerService.listDoctors,
  })
}

export function usePartnerReviewers() {
  return useQuery({
    queryKey: partnerQueryKeys.reviewers,
    queryFn: partnerService.listReviewers,
  })
}

export function useApprovalRequests() {
  return useQuery({
    queryKey: partnerQueryKeys.approvals,
    queryFn: partnerService.fetchApprovalRequests,
  })
}

export function useRegisterHospital() {
  return useMutation({
    mutationFn: (input: HospitalRegistrationInput) => partnerService.registerHospital(input),
  })
}

export function useRegisterDoctor() {
  return useMutation({
    mutationFn: (input: DoctorRegistrationInput) => partnerService.registerDoctor(input),
  })
}

export function useRegisterReviewer() {
  return useMutation({
    mutationFn: (input: ReviewerRegistrationInput) => partnerService.registerReviewer(input),
  })
}

export function useLastRegistration() {
  return useQuery({
    queryKey: partnerQueryKeys.lastRegistration,
    queryFn: partnerService.getLastRegistration,
  })
}

export function useValidateHospitalCode() {
  return useMutation({
    mutationFn: (code: string): Promise<HospitalCodeLookup> => partnerService.validateHospitalCode(code),
  })
}

export function useApproveRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => partnerService.approveRequest(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: partnerQueryKeys.approvals })
      void qc.invalidateQueries({ queryKey: partnerQueryKeys.hospitals })
      void qc.invalidateQueries({ queryKey: partnerQueryKeys.doctors })
      void qc.invalidateQueries({ queryKey: partnerQueryKeys.reviewers })
    },
  })
}

export function useRejectRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      partnerService.rejectRequest(id, message),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: partnerQueryKeys.approvals })
    },
  })
}

export function useRequestInfo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      partnerService.requestInfo(id, message),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: partnerQueryKeys.approvals })
    },
  })
}

export function useRegenerateHospitalCode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (hospitalId: string) => partnerService.regenerateHospitalCode(hospitalId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: partnerQueryKeys.hospitals })
      void qc.invalidateQueries({ queryKey: partnerQueryKeys.approvals })
    },
  })
}

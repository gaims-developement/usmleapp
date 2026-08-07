export type CompletionStatus = 'in_progress' | 'completed'
export type CertificateStatus = 'not_started' | 'generated' | 'approved' | 'issued'

export interface Certificate {
  id: string
  studentId: string
  department: string
  duration: string
  completionStatus: CompletionStatus
  certificateStatus: CertificateStatus
  completedAt?: string
  issuedAt?: string
}

export const doctorCertificates: Certificate[] = [
  { id: 'CERT-101', studentId: 'dstu-1', department: 'Internal Medicine', duration: '8 weeks', completionStatus: 'in_progress', certificateStatus: 'not_started' },
  { id: 'CERT-102', studentId: 'dstu-2', department: 'Internal Medicine', duration: '8 weeks', completionStatus: 'in_progress', certificateStatus: 'not_started' },
  { id: 'CERT-103', studentId: 'dstu-3', department: 'Internal Medicine', duration: '8 weeks', completionStatus: 'in_progress', certificateStatus: 'not_started' },
  { id: 'CERT-104', studentId: 'dstu-4', department: 'Internal Medicine', duration: '8 weeks', completionStatus: 'in_progress', certificateStatus: 'generated' },
  { id: 'CERT-105', studentId: 'dstu-5', department: 'Internal Medicine', duration: '6 weeks', completionStatus: 'in_progress', certificateStatus: 'not_started' },
  { id: 'CERT-106', studentId: 'dstu-6', department: 'Internal Medicine', duration: '6 weeks', completionStatus: 'in_progress', certificateStatus: 'not_started' },
  { id: 'CERT-107', studentId: 'dstu-7', department: 'Internal Medicine', duration: '6 weeks', completionStatus: 'completed', certificateStatus: 'approved', completedAt: '2026-11-12', issuedAt: '2026-11-14' },
  { id: 'CERT-108', studentId: 'dstu-8', department: 'Internal Medicine', duration: '6 weeks', completionStatus: 'in_progress', certificateStatus: 'not_started' },
  { id: 'CERT-109', studentId: 'dstu-9', department: 'Internal Medicine', duration: '8 weeks', completionStatus: 'in_progress', certificateStatus: 'generated' },
  { id: 'CERT-110', studentId: 'dstu-10', department: 'Internal Medicine', duration: '8 weeks', completionStatus: 'in_progress', certificateStatus: 'not_started' },
  { id: 'CERT-111', studentId: 'dstu-11', department: 'Internal Medicine', duration: '8 weeks', completionStatus: 'in_progress', certificateStatus: 'generated' },
  { id: 'CERT-112', studentId: 'dstu-12', department: 'Internal Medicine', duration: '6 weeks', completionStatus: 'in_progress', certificateStatus: 'not_started' },
  { id: 'CERT-113', studentId: 'dstu-13', department: 'Internal Medicine', duration: '8 weeks', completionStatus: 'in_progress', certificateStatus: 'not_started' },
  { id: 'CERT-114', studentId: 'dstu-14', department: 'Internal Medicine', duration: '8 weeks', completionStatus: 'in_progress', certificateStatus: 'not_started' },
  { id: 'CERT-115', studentId: 'dstu-15', department: 'Internal Medicine', duration: '8 weeks', completionStatus: 'completed', certificateStatus: 'issued', completedAt: '2026-11-12', issuedAt: '2026-11-15' },
]

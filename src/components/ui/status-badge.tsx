import type { RoleId } from '@/types/rbac'
import { cn } from '@/lib/utils'

export type BadgeTone = 'neutral' | 'brand' | 'amber' | 'violet' | 'red' | 'sky' | 'emerald'

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-ink-100 text-ink-600',
  brand: 'bg-brand-100 text-brand-800',
  amber: 'bg-amber-100 text-amber-800',
  violet: 'bg-violet-100 text-violet-800',
  red: 'bg-red-100 text-red-700',
  sky: 'bg-sky-100 text-sky-800',
  emerald: 'bg-emerald-100 text-emerald-800',
}

export function StatusBadge({
  label,
  tone = 'neutral',
  className,
}: {
  label: string
  tone?: BadgeTone
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
        tones[tone],
        className,
      )}
    >
      {label}
    </span>
  )
}

export function applicationStatusMeta(status: string): { label: string; tone: BadgeTone } {
  switch (status) {
    case 'submitted':
      return { label: 'Submitted', tone: 'sky' }
    case 'under_review':
      return { label: 'Under review', tone: 'amber' }
    case 'additional_info':
      return { label: 'Info needed', tone: 'red' }
    case 'approved':
      return { label: 'Approved', tone: 'emerald' }
    case 'offered':
      return { label: 'Offer received', tone: 'violet' }
    case 'confirmed':
      return { label: 'Confirmed', tone: 'brand' }
    case 'withdrawn':
      return { label: 'Withdrawn', tone: 'neutral' }
    case 'rejected':
      return { label: 'Not selected', tone: 'red' }
    case 'forwarded':
      return { label: 'Forwarded', tone: 'sky' }
    case 'waitlisted':
      return { label: 'Waitlisted', tone: 'amber' }
    case 'completed':
      return { label: 'Completed', tone: 'emerald' }
    default:
      return { label: status, tone: 'neutral' }
  }
}

export function documentStatusMeta(status: string): { label: string; tone: BadgeTone } {
  switch (status) {
    case 'uploaded':
      return { label: 'Uploaded', tone: 'brand' }
    case 'expiring':
      return { label: 'Expires soon', tone: 'amber' }
    default:
      return { label: 'Not uploaded', tone: 'neutral' }
  }
}

export function roleBadgeMeta(role: RoleId): { label: string; tone: BadgeTone } {
  switch (role) {
    case 'SUPER_ADMIN':
      return { label: 'Super Admin', tone: 'violet' }
    case 'ADMIN':
      return { label: 'Admin', tone: 'brand' }
    case 'REVIEWER':
      return { label: 'Reviewer', tone: 'sky' }
    case 'HOSPITAL':
      return { label: 'Hospital', tone: 'amber' }
    case 'DOCTOR':
      return { label: 'Doctor', tone: 'neutral' }
    case 'STUDENT':
      return { label: 'Student', tone: 'brand' }
  }
}

export function userStatusMeta(status: string): { label: string; tone: BadgeTone } {
  switch (status) {
    case 'active':
      return { label: 'Active', tone: 'brand' }
    case 'invited':
      return { label: 'Invited', tone: 'amber' }
    default:
      return { label: 'Suspended', tone: 'red' }
  }
}

export function hospitalStatusMeta(status: string): { label: string; tone: BadgeTone } {
  switch (status) {
    case 'active':
      return { label: 'Active', tone: 'brand' }
    case 'paused':
      return { label: 'Paused', tone: 'amber' }
    default:
      return { label: 'Onboarding', tone: 'sky' }
  }
}

export function doctorStatusMeta(status: string): { label: string; tone: BadgeTone } {
  switch (status) {
    case 'active':
      return { label: 'Active', tone: 'brand' }
    case 'busy':
      return { label: 'Busy', tone: 'amber' }
    default:
      return { label: 'Inactive', tone: 'neutral' }
  }
}

export function reviewerStatusMeta(status: string): { label: string; tone: BadgeTone } {
  switch (status) {
    case 'active':
      return { label: 'Active', tone: 'brand' }
    case 'busy':
      return { label: 'Busy', tone: 'amber' }
    default:
      return { label: 'On leave', tone: 'neutral' }
  }
}

export function programStatusMeta(status: string): { label: string; tone: BadgeTone } {
  switch (status) {
    case 'published':
      return { label: 'Published', tone: 'brand' }
    case 'draft':
      return { label: 'Draft', tone: 'neutral' }
    default:
      return { label: 'Closed', tone: 'red' }
  }
}

export function docVerificationMeta(status: string): { label: string; tone: BadgeTone } {
  switch (status) {
    case 'pending':
      return { label: 'Pending', tone: 'amber' }
    case 'verified':
      return { label: 'Verified', tone: 'brand' }
    case 'rejected':
      return { label: 'Rejected', tone: 'red' }
    default:
      return { label: 'Expiring', tone: 'sky' }
  }
}

export function paymentStatusMeta(status: string): { label: string; tone: BadgeTone } {
  switch (status) {
    case 'paid':
      return { label: 'Paid', tone: 'brand' }
    case 'under_verification':
      return { label: 'Verifying', tone: 'amber' }
    case 'awaiting_payment':
    case 'payment_submitted':
    case 'pending':
      return { label: 'Pending', tone: 'amber' }
    case 'refunded':
      return { label: 'Refunded', tone: 'neutral' }
    case 'rejected':
      return { label: 'Rejected', tone: 'red' }
    default:
      return { label: 'Failed', tone: 'red' }
  }
}

export function announcementStatusMeta(status: string): { label: string; tone: BadgeTone } {
  switch (status) {
    case 'published':
      return { label: 'Published', tone: 'brand' }
    case 'scheduled':
      return { label: 'Scheduled', tone: 'amber' }
    default:
      return { label: 'Draft', tone: 'neutral' }
  }
}

export function cmsStatusMeta(status: string): { label: string; tone: BadgeTone } {
  switch (status) {
    case 'published':
      return { label: 'Published', tone: 'brand' }
    default:
      return { label: 'Draft', tone: 'neutral' }
  }
}

export function auditSeverityMeta(severity: string): { label: string; tone: BadgeTone } {
  switch (severity) {
    case 'critical':
      return { label: 'Critical', tone: 'red' }
    case 'warn':
      return { label: 'Warning', tone: 'amber' }
    default:
      return { label: 'Info', tone: 'neutral' }
  }
}

export function supportPriorityMeta(priority: string): { label: string; tone: BadgeTone } {
  switch (priority) {
    case 'urgent':
      return { label: 'Urgent', tone: 'red' }
    case 'high':
      return { label: 'High', tone: 'amber' }
    case 'medium':
      return { label: 'Medium', tone: 'sky' }
    default:
      return { label: 'Low', tone: 'neutral' }
  }
}

export function supportStatusMeta(status: string): { label: string; tone: BadgeTone } {
  switch (status) {
    case 'resolved':
      return { label: 'Resolved', tone: 'brand' }
    case 'in-progress':
      return { label: 'In progress', tone: 'amber' }
    default:
      return { label: 'Open', tone: 'sky' }
  }
}

export function tierMeta(tier: string): { label: string; tone: BadgeTone } {
  return tier === 'premier'
    ? { label: 'Premier', tone: 'violet' }
    : { label: 'Standard', tone: 'neutral' }
}

export function reviewerAvailabilityMeta(level: string): { label: string; tone: BadgeTone } {
  switch (level) {
    case 'High':
      return { label: 'High', tone: 'brand' }
    case 'Medium':
      return { label: 'Medium', tone: 'amber' }
    default:
      return { label: 'Low', tone: 'neutral' }
  }
}

export function reviewerAppStatusMeta(status: string): { label: string; tone: BadgeTone } {
  switch (status) {
    case 'submitted':
      return { label: 'Submitted', tone: 'sky' }
    case 'under_review':
      return { label: 'Under review', tone: 'amber' }
    case 'changes_requested':
      return { label: 'Changes requested', tone: 'violet' }
    case 'approved':
      return { label: 'Approved', tone: 'brand' }
    case 'rejected':
      return { label: 'Rejected', tone: 'red' }
    case 'forwarded':
      return { label: 'Forwarded', tone: 'emerald' }
    default:
      return { label: status, tone: 'neutral' }
  }
}

export function reviewDocMeta(status: string): { label: string; tone: BadgeTone } {
  switch (status) {
    case 'verified':
      return { label: 'Verified', tone: 'brand' }
    case 'pending':
      return { label: 'Pending', tone: 'amber' }
    case 'rejected':
      return { label: 'Rejected', tone: 'red' }
    case 'requires_update':
      return { label: 'Requires update', tone: 'sky' }
    default:
      return { label: status, tone: 'neutral' }
  }
}

export function reviewerRecommendationMeta(value: string): { label: string; tone: BadgeTone } {
  switch (value) {
    case 'approve':
      return { label: 'Approve', tone: 'brand' }
    case 'reject':
      return { label: 'Reject', tone: 'red' }
    case 'request_changes':
      return { label: 'Request changes', tone: 'sky' }
    case 'forward':
      return { label: 'Forward', tone: 'emerald' }
    default:
      return { label: 'Not set', tone: 'neutral' }
  }
}

export function hospitalAppStatusMeta(status: string): { label: string; tone: BadgeTone } {
  switch (status) {
    case 'awaiting_decision':
      return { label: 'Awaiting decision', tone: 'amber' }
    case 'accepted':
      return { label: 'Accepted', tone: 'brand' }
    case 'rejected':
      return { label: 'Rejected', tone: 'red' }
    case 'waitlisted':
      return { label: 'Waitlisted', tone: 'sky' }
    case 'scheduled':
      return { label: 'Scheduled', tone: 'violet' }
    case 'completed':
      return { label: 'Completed', tone: 'emerald' }
    default:
      return { label: status, tone: 'neutral' }
  }
}

export function hospitalProgramMeta(status: string): { label: string; tone: BadgeTone } {
  switch (status) {
    case 'published':
      return { label: 'Published', tone: 'brand' }
    case 'paused':
      return { label: 'Paused', tone: 'amber' }
    case 'archived':
      return { label: 'Archived', tone: 'neutral' }
    default:
      return { label: 'Draft', tone: 'sky' }
  }
}

export function doctorAvailabilityMeta(level: string): { label: string; tone: BadgeTone } {
  switch (level) {
    case 'High':
      return { label: 'High', tone: 'emerald' }
    case 'Medium':
      return { label: 'Medium', tone: 'amber' }
    default:
      return { label: 'Low', tone: 'red' }
  }
}

export function logbookStatusMeta(status: string): { label: string; tone: BadgeTone } {
  switch (status) {
    case 'approved':
      return { label: 'Approved', tone: 'brand' }
    case 'rejected':
      return { label: 'Rejected', tone: 'red' }
    default:
      return { label: 'Pending', tone: 'amber' }
  }
}

export function evaluationStatusMeta(status: string): { label: string; tone: BadgeTone } {
  switch (status) {
    case 'completed':
      return { label: 'Completed', tone: 'brand' }
    default:
      return { label: 'Draft', tone: 'amber' }
  }
}

export function certificateStatusMeta(status: string): { label: string; tone: BadgeTone } {
  switch (status) {
    case 'issued':
      return { label: 'Issued', tone: 'brand' }
    case 'approved':
      return { label: 'Approved', tone: 'sky' }
    case 'generated':
      return { label: 'Generated', tone: 'amber' }
    default:
      return { label: 'Not started', tone: 'neutral' }
  }
}

export function lorStatusMeta(status: string): { label: string; tone: BadgeTone } {
  switch (status) {
    case 'delivered':
      return { label: 'Delivered', tone: 'brand' }
    case 'signed':
      return { label: 'Signed', tone: 'sky' }
    case 'pending_review':
      return { label: 'Pending review', tone: 'amber' }
    default:
      return { label: 'Draft', tone: 'neutral' }
  }
}

export function attendanceStatusMeta(status: string): { label: string; tone: BadgeTone } {
  switch (status) {
    case 'present':
      return { label: 'Present', tone: 'brand' }
    case 'late':
      return { label: 'Late', tone: 'amber' }
    case 'excused':
      return { label: 'Excused', tone: 'sky' }
    default:
      return { label: 'Absent', tone: 'red' }
  }
}

export function completionStatusMeta(status: string): { label: string; tone: BadgeTone } {
  switch (status) {
    case 'completed':
      return { label: 'Completed', tone: 'brand' }
    default:
      return { label: 'In progress', tone: 'amber' }
  }
}

export function recommendationMeta(value: string): { label: string; tone: BadgeTone } {
  switch (value) {
    case 'recommend':
      return { label: 'Recommend', tone: 'brand' }
    case 'recommend_with_reservation':
      return { label: 'Recommend w/ reservation', tone: 'amber' }
    default:
      return { label: 'Not recommended', tone: 'red' }
  }
}

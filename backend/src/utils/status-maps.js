// Maps between DB enums and the status shapes the frontend consumes.
// Keeping these in one place avoids drifting copies across route files.

export const PROGRAM_STATUS_TO_FRONTEND = {
  DRAFT: 'draft',
  ACTIVE: 'published',
  PAUSED: 'paused',
  CLOSED: 'archived',
}

export const PROGRAM_STATUS_TO_DB = {
  draft: 'DRAFT',
  published: 'ACTIVE',
  paused: 'PAUSED',
  archived: 'CLOSED',
}

// Application status -> the simplified hospital-facing decision status.
export function toHospitalDecision(dbStatus) {
  switch (dbStatus) {
    case 'ACCEPTED': return 'accepted'
    case 'WAITLISTED': return 'waitlisted'
    case 'REJECTED': return 'rejected'
    case 'SCHEDULED': return 'scheduled'
    case 'COMPLETED': return 'completed'
    default: return 'awaiting_decision'
  }
}

export const HOSPITAL_DECISION_TO_DB = {
  awaiting_decision: 'AWAITING_DECISION',
  accepted: 'ACCEPTED',
  waitlisted: 'WAITLISTED',
  rejected: 'REJECTED',
  scheduled: 'SCHEDULED',
  completed: 'COMPLETED',
}

export const DATE_ONLY = date => (date ? new Date(date).toISOString().slice(0, 10) : '')

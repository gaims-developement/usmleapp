export interface ReviewerProfile {
  id: string
  name: string
  email: string
  department: string
  title: string
  applicationsReviewed: number
  avgReviewTime: string
  approvalRate: number
  onTimeRate: number
  documentsVerified: number
  specialties: string[]
}

export const reviewerProfile: ReviewerProfile = {
  id: 'rev-1',
  name: 'Rita Reviewer',
  email: 'reviewer@imgprep.com',
  department: 'Application Review & Credentialing',
  title: 'Senior Application Reviewer',
  applicationsReviewed: 1284,
  avgReviewTime: '26 min',
  approvalRate: 74,
  onTimeRate: 96,
  documentsVerified: 8420,
  specialties: ['Internal Medicine', 'Pediatrics', 'Cardiology', 'Obstetrics & Gynecology'],
}

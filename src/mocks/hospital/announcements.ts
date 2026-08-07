export type AnnouncementStatus = 'published' | 'draft' | 'archived'
export type AnnouncementAudience = 'All Students' | 'Departments' | 'Coordinators'

export interface HospitalAnnouncement {
  id: string
  title: string
  body: string
  audience: AnnouncementAudience
  status: AnnouncementStatus
  author: string
  publishedAt: string
}

export const hospitalAnnouncements: HospitalAnnouncement[] = [
  {
    id: 'HANN-1',
    title: 'Winter cohort rotation dates confirmed',
    body: 'Rotation windows for the December cohort have been confirmed. Students should report to the electives office by 8:00 AM on their start date. Orientation will be held in the North Wing auditorium.',
    audience: 'All Students',
    status: 'published',
    author: 'Karen Mitchell',
    publishedAt: '2026-08-02',
  },
  {
    id: 'HANN-2',
    title: 'Updated vaccination policy',
    body: 'All students must submit updated vaccination records at least 3 weeks before rotation start. Flu shots are mandatory for all clinical rotations this season.',
    audience: 'All Students',
    status: 'published',
    author: 'Karen Mitchell',
    publishedAt: '2026-07-28',
  },
  {
    id: 'HANN-3',
    title: 'Call room scheduling change',
    body: 'Effective this month, overnight call sign-out will move to the 4th floor workroom. Please update your team accordingly.',
    audience: 'Departments',
    status: 'published',
    author: 'Dr. Alan Cross',
    publishedAt: '2026-07-22',
  },
  {
    id: 'HANN-4',
    title: 'Draft — Onboarding checklist update',
    body: 'Proposed changes to the student onboarding checklist for review by department coordinators. Feedback due by Friday.',
    audience: 'Coordinators',
    status: 'draft',
    author: 'Karen Mitchell',
    publishedAt: '2026-08-04',
  },
  {
    id: 'HANN-5',
    title: 'Summer cohort wrap-up',
    body: 'Summer 2026 cohort has concluded. Thank you to all faculty mentors. Evaluations are due within 14 days.',
    audience: 'Departments',
    status: 'archived',
    author: 'Karen Mitchell',
    publishedAt: '2026-08-01',
  },
]

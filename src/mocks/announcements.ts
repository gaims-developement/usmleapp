export type AnnouncementCategory =
  | 'platform'
  | 'deadline'
  | 'resources'
  | 'match'
  | 'community'

export interface Announcement {
  id: string
  title: string
  summary: string
  body: string
  category: AnnouncementCategory
  date: string
  author: string
  pinned: boolean
}

export const announcementCategoryMeta: Record<AnnouncementCategory, { label: string }> = {
  platform: { label: 'Platform' },
  deadline: { label: 'Deadline' },
  resources: { label: 'Resources' },
  match: { label: 'Match' },
  community: { label: 'Community' },
}

export const announcements: Announcement[] = [
  {
    id: 'ann-1001',
    title: 'New: Study Resources library is live',
    summary:
      'Browse curated guides, checklists, and courses for Step 1, Step 2 CK, rotations, ERAS, and interviews.',
    body:
      'We\u2019ve added a Study Resources library to your dashboard. You can now browse curated guides, printable checklists, short courses, and video walkthroughs organized by stage of your journey — from USMLE prep to interview season. New resources are added every week, and everything you open is marked to help us recommend what to try next.',
    category: 'platform',
    date: '2026-08-05',
    author: 'IMG Prep Team',
    pinned: true,
  },
  {
    id: 'ann-1002',
    title: 'Fall elective application deadline approaching',
    summary:
      'Most programs close October applications on September 15. Submit your documents early.',
    body:
      'If you\u2019re planning a fall or early-spring elective, most participating programs close their next application windows by September 15. Make sure your required documents are uploaded and verified before then — a complete file vault makes your application significantly more competitive. Check the deadlines on each elective page for exact dates.',
    category: 'deadline',
    date: '2026-08-03',
    author: 'Programs Team',
    pinned: true,
  },
  {
    id: 'ann-1003',
    title: 'Step 1 blueprint guide updated for 2026',
    summary:
      'The content blueprint guide now reflects the current question distribution by system and physician task.',
    body:
      'We\u2019ve updated our USMLE Step 1 blueprint guide with the latest question distribution data. If you\u2019re in the early planning phase, this guide helps you prioritize systems and topics with the highest yield. Access it anytime from Study Resources under the USMLE Step 1 category.',
    category: 'resources',
    date: '2026-07-28',
    author: 'IMG Prep Team',
    pinned: false,
  },
  {
    id: 'ann-1004',
    title: 'Mock interview sign-ups are open',
    summary:
      'Reserve a 1-on-1 mock interview with an IMG mentor who matched into a U.S. residency.',
    body:
      'Interview season is approaching. Sign up for a live virtual mock interview with an IMG mentor who successfully matched. You\u2019ll get a realistic interview experience followed by structured feedback on your answers, delivery, and follow-up questions. Slots are limited and fill quickly each cycle.',
    category: 'community',
    date: '2026-07-21',
    author: 'Mentorship Team',
    pinned: false,
  },
  {
    id: 'ann-1005',
    title: 'Document expiry reminders now in your dashboard',
    summary:
      'Documents nearing expiration are highlighted so you can renew them before applications.',
    body:
      'We\u2019ve added expiry tracking to the Documents page. Documents like immunization records and TB screenings are now flagged when they are close to expiring, so you can renew them well ahead of application deadlines. Upload a new version from the Documents page to clear the flag.',
    category: 'platform',
    date: '2026-07-15',
    author: 'IMG Prep Team',
    pinned: false,
  },
  {
    id: 'ann-1006',
    title: 'ERAS 2026 cycle deadlines published',
    summary:
      'Review the month-by-month ERAS timeline we\u2019ve published for the upcoming cycle.',
    body:
      'The ERAS 2026 timeline is now available in Study Resources. It covers token distribution, MSPE upload dates, program signals, and the interview invite window. Bookmark it — missing a single deadline can delay your entire application.',
    category: 'match',
    date: '2026-07-10',
    author: 'Match Team',
    pinned: false,
  },
]

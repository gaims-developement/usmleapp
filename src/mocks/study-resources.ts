export type ResourceType = 'guide' | 'checklist' | 'course' | 'article' | 'video'

export interface StudyResource {
  id: string
  title: string
  category: string
  type: ResourceType
  description: string
  duration: string
  tags: string[]
  free: boolean
  recommended: boolean
  url: string
}

export const resourceCategories = [
  'USMLE Step 1',
  'USMLE Step 2 CK',
  'Clinical Rotations',
  'ERAS & Match',
  'Interview Prep',
  'English Proficiency',
] as const

export const studyResources: StudyResource[] = [
  {
    id: 'res-step1-blueprint',
    title: 'USMLE Step 1 Content Blueprint',
    category: 'USMLE Step 1',
    type: 'guide',
    description:
      'A breakdown of the Step 1 exam blueprint by system and physician task, with a prioritized study order based on recent question distribution.',
    duration: '15 min read',
    tags: ['Step 1', 'Blueprint', 'Planning'],
    free: true,
    recommended: true,
    url: '#',
  },
  {
    id: 'res-step1-schedule',
    title: '12-Week Step 1 Study Schedule',
    category: 'USMLE Step 1',
    type: 'checklist',
    description:
      'A day-by-day 12-week plan built around UWorld and First Aid that balances dedicated question blocks with weekly NBME practice exams.',
    duration: 'Printable plan',
    tags: ['Step 1', 'Schedule', 'Study plan'],
    free: true,
    recommended: true,
    url: '#',
  },
  {
    id: 'res-step1-missed-qs',
    title: 'How to Review Missed Questions Effectively',
    category: 'USMLE Step 1',
    type: 'article',
    description:
      'Stop re-reading explanations. Learn a structured two-pass review method for incorrect questions that targets concept gaps instead of memorizing answers.',
    duration: '8 min read',
    tags: ['Step 1', 'UWorld', 'Review'],
    free: true,
    recommended: false,
    url: '#',
  },
  {
    id: 'res-step2ck-path',
    title: 'USMLE Step 2 CK Resource Path',
    category: 'USMLE Step 2 CK',
    type: 'guide',
    description:
      'Which resources to use first for Step 2 CK, when to take NBMEs, and how to pace content review around your clerkship rotations.',
    duration: '12 min read',
    tags: ['Step 2 CK', 'Planning', 'NBME'],
    free: true,
    recommended: true,
    url: '#',
  },
  {
    id: 'res-step2ck-uworld',
    title: 'Step 2 CK UWorld First-Pass Strategy',
    category: 'USMLE Step 2 CK',
    type: 'course',
    description:
      'A guided walkthrough of organizing your first UWorld pass by subject, timing blocks, and creating a targeted incorrect bank for the final weeks.',
    duration: '45 min course',
    tags: ['Step 2 CK', 'UWorld', 'Strategy'],
    free: false,
    recommended: false,
    url: '#',
  },
  {
    id: 'res-clinical-rotation',
    title: 'How to Excel on Your First U.S. Rotation',
    category: 'Clinical Rotations',
    type: 'guide',
    description:
      'Practical advice for IMGs starting a U.S. clinical rotation: how to prepare before day one, what to bring, and how to earn a strong letter of recommendation.',
    duration: '20 min read',
    tags: ['Rotations', 'IMG', 'LoR'],
    free: true,
    recommended: true,
    url: '#',
  },
  {
    id: 'res-rotation-check',
    title: 'Rotation Readiness Checklist',
    category: 'Clinical Rotations',
    type: 'checklist',
    description:
      'Everything to pack, prepare, and practice before your rotation starts — from paperwork and insurance to common clinical questions to review.',
    duration: 'Printable checklist',
    tags: ['Rotations', 'Preparation'],
    free: true,
    recommended: true,
    url: '#',
  },
  {
    id: 'res-progress-note',
    title: 'Writing a Solid Progress Note',
    category: 'Clinical Rotations',
    type: 'video',
    description:
      'A short video on the SOAP format, common attending preferences, and the mistakes students make that hurt their rotation evaluations.',
    duration: '12 min video',
    tags: ['Rotations', 'Clinical skills'],
    free: true,
    recommended: false,
    url: '#',
  },
  {
    id: 'res-eras-guide',
    title: 'The Complete ERAS Application Guide',
    category: 'ERAS & Match',
    type: 'guide',
    description:
      'Step-by-step walkthrough of the ERAS application timeline, the documents you need, and how to organize your experience section for maximum impact.',
    duration: '25 min read',
    tags: ['ERAS', 'Application', 'Match'],
    free: true,
    recommended: true,
    url: '#',
  },
  {
    id: 'res-personal-statement',
    title: 'Personal Statement Workbook',
    category: 'ERAS & Match',
    type: 'course',
    description:
      'A structured workbook with prompts and examples to help you draft a personal statement that tells a focused, memorable story.',
    duration: '3-part course',
    tags: ['ERAS', 'Personal statement'],
    free: false,
    recommended: false,
    url: '#',
  },
  {
    id: 'res-eras-timeline',
    title: 'ERAS 2026 Timeline At-a-Glance',
    category: 'ERAS & Match',
    type: 'checklist',
    description:
      'Month-by-month deadlines for the upcoming ERAS cycle, including tokens, MSPE upload, program signals, and interview season dates.',
    duration: '1-page timeline',
    tags: ['ERAS', 'Deadlines'],
    free: true,
    recommended: true,
    url: '#',
  },
  {
    id: 'res-interview-questions',
    title: '100 Residency Interview Questions',
    category: 'Interview Prep',
    type: 'guide',
    description:
      'The most commonly asked residency interview questions, grouped by theme, with notes on how to structure strong, concise answers.',
    duration: '30 min read',
    tags: ['Interviews', 'Behavioral'],
    free: true,
    recommended: true,
    url: '#',
  },
  {
    id: 'res-interview-mock',
    title: 'Mock Interview Practice Sessions',
    category: 'Interview Prep',
    type: 'course',
    description:
      'Live virtual mock interviews with IMG mentors who matched successfully, including personalized feedback on delivery and content.',
    duration: '1-on-1 sessions',
    tags: ['Interviews', 'Practice'],
    free: false,
    recommended: false,
    url: '#',
  },
  {
    id: 'res-toefl-oet',
    title: 'TOEFL & OET: Which Exam Do You Need?',
    category: 'English Proficiency',
    type: 'article',
    description:
      'Compare the two English proficiency exams accepted by ECFMG, including scoring, cost, availability, and how programs treat each one.',
    duration: '10 min read',
    tags: ['TOEFL', 'OET', 'ECFMG'],
    free: true,
    recommended: false,
    url: '#',
  },
  {
    id: 'res-english-study',
    title: 'English Proficiency Study Plan',
    category: 'English Proficiency',
    type: 'checklist',
    description:
      'A 6-week prep plan covering the speaking and writing sections that IMGs typically struggle with, with practice task lists for each week.',
    duration: 'Printable plan',
    tags: ['TOEFL', 'OET', 'Study plan'],
    free: true,
    recommended: false,
    url: '#',
  },
]

export const resourceTypeMeta: Record<ResourceType, { label: string }> = {
  guide: { label: 'Guide' },
  checklist: { label: 'Checklist' },
  course: { label: 'Course' },
  article: { label: 'Article' },
  video: { label: 'Video' },
}

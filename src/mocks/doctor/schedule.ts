export interface ScheduleItem {
  time: string
  title: string
  type: 'orientation' | 'ward_round' | 'clinical_skills' | 'evaluation' | 'feedback' | 'lecture' | 'meeting'
  location: string
  studentIds?: string[]
}

export const SCHEDULE_TYPES: Record<ScheduleItem['type'], string> = {
  orientation: 'Student Orientation',
  ward_round: 'Ward Round',
  clinical_skills: 'Clinical Skills Session',
  evaluation: 'Student Evaluation',
  feedback: 'Feedback Session',
  lecture: 'Department Lecture',
  meeting: 'Team Meeting',
}

export const todaySchedule: ScheduleItem[] = [
  { time: '09:00', title: 'Student Orientation', type: 'orientation', location: 'North Wing Auditorium', studentIds: ['dstu-5', 'dstu-6', 'dstu-8'] },
  { time: '10:30', title: 'Ward Round', type: 'ward_round', location: 'Ward 3A' },
  { time: '12:00', title: 'Department Lecture', type: 'lecture', location: 'Conference Room B' },
  { time: '13:00', title: 'Clinical Skills Session', type: 'clinical_skills', location: 'Skills Lab 2', studentIds: ['dstu-1', 'dstu-2', 'dstu-3'] },
  { time: '15:00', title: 'Student Evaluation', type: 'evaluation', location: 'Office', studentIds: ['dstu-1'] },
  { time: '16:00', title: 'Team Meeting', type: 'meeting', location: 'Ward 3A' },
  { time: '17:00', title: 'Feedback Session', type: 'feedback', location: 'Office', studentIds: ['dstu-3', 'dstu-4'] },
]

export const upcomingRotationStarts = [
  { studentId: 'dstu-5', date: '2026-11-02' },
  { studentId: 'dstu-6', date: '2026-11-02' },
  { studentId: 'dstu-8', date: '2026-11-02' },
  { studentId: 'dstu-12', date: '2026-11-02' },
  { studentId: 'dstu-16', date: '2026-11-02' },
  { studentId: 'dstu-20', date: '2026-11-02' },
]

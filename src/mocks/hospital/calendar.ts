export type CalendarEventKind = 'rotation' | 'orientation' | 'meeting' | 'deadline' | 'exam'

export interface HospitalCalendarEvent {
  id: string
  kind: CalendarEventKind
  title: string
  date: string
  startTime: string
  endTime: string
  location: string
  notes: string
  linkedRotationId?: string
}

export const hospitalCalendarEvents: HospitalCalendarEvent[] = [
  { id: 'evt-1', kind: 'rotation', title: 'IM Core Clerkship — hstu-10', date: '2026-10-05', startTime: '08:00', endTime: '17:00', location: 'Ward 3A', notes: 'Orientation day.', linkedRotationId: 'AP-2142' },
  { id: 'evt-2', kind: 'rotation', title: 'OB/GYN Clerkship — hstu-7', date: '2026-10-05', startTime: '08:00', endTime: '17:00', location: 'Labor & Delivery', notes: 'First rotation day.', linkedRotationId: 'AP-2138' },
  { id: 'evt-3', kind: 'orientation', title: 'October cohort orientation', date: '2026-10-02', startTime: '08:30', endTime: '12:00', location: 'North Wing Auditorium', notes: 'Hospital tour, EMR training, badge pickup.' },
  { id: 'evt-4', kind: 'meeting', title: 'Electives coordination meeting', date: '2026-08-08', startTime: '13:00', endTime: '14:00', location: 'Conference Room B', notes: 'Monthly, all coordinators.' },
  { id: 'evt-5', kind: 'deadline', title: 'Winter cohort application review deadline', date: '2026-09-15', startTime: '17:00', endTime: '18:00', location: 'Online', notes: 'IM Core Clerkship applications.' },
  { id: 'evt-6', kind: 'rotation', title: 'Cardiology Elective — hstu-4', date: '2026-10-26', startTime: '07:30', endTime: '16:30', location: 'Cath Lab', notes: '', linkedRotationId: 'AP-2134' },
  { id: 'evt-7', kind: 'rotation', title: 'General Surgery Clerkship — hstu-28', date: '2026-10-19', startTime: '07:00', endTime: '16:00', location: 'OR Suite', notes: '', linkedRotationId: 'AP-2143' },
  { id: 'evt-8', kind: 'meeting', title: 'Faculty mentor check-in', date: '2026-08-20', startTime: '15:00', endTime: '16:00', location: 'Zoom', notes: 'Quarterly mentor feedback session.' },
  { id: 'evt-9', kind: 'exam', title: 'USMLE Step 2 CK study room booking', date: '2026-08-25', startTime: '09:00', endTime: '17:00', location: 'Library, 2nd Floor', notes: 'Reserved for scheduled students.' },
  { id: 'evt-10', kind: 'rotation', title: 'Pediatrics Rotation — hstu-5', date: '2026-10-12', startTime: '08:00', endTime: '17:00', location: 'Pediatrics Ward', notes: '', linkedRotationId: 'AP-2135' },
]

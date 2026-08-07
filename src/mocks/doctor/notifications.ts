export interface DoctorNotification {
  id: string
  type: 'student' | 'logbook' | 'evaluation' | 'certificate' | 'lor' | 'system'
  title: string
  message: string
  time: string
  read: boolean
}

export const doctorNotifications: DoctorNotification[] = [
  { id: 'dn1', type: 'logbook', title: 'Logbook entries awaiting review', message: '6 new entries need verification before Thursday.', time: '10 minutes ago', read: false },
  { id: 'dn2', type: 'evaluation', title: 'Mid-rotation evaluation due', message: 'Priya Sharma\'s evaluation is due for submission.', time: '32 minutes ago', read: false },
  { id: 'dn3', type: 'student', title: 'New student assigned', message: 'Yuki Tanaka starts the IM rotation next cycle.', time: '2 hours ago', read: false },
  { id: 'dn4', type: 'lor', title: 'LoR update', message: 'LOR-1 for Hana Kim was delivered to the program.', time: '5 hours ago', read: false },
  { id: 'dn5', type: 'certificate', title: 'Certificate approved', message: 'CERT-107 was approved by hospital administration.', time: 'Yesterday', read: true },
  { id: 'dn6', type: 'system', title: 'Schedule updated', message: 'The Clinical Skills session moved to 1:00 PM.', time: 'Yesterday', read: true },
  { id: 'dn7', type: 'student', title: 'Attendance report ready', message: 'October attendance reports are available to download.', time: '2 days ago', read: true },
  { id: 'dn8', type: 'system', title: 'Profile verified', message: 'Your mentor profile was verified by hospital administration.', time: '3 days ago', read: true },
]

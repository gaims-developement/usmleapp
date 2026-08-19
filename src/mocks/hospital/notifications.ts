export interface HospitalNotification {
  id: string
  type: 'application' | 'scheduled' | 'program' | 'announcement' | 'system'
  title: string
  message: string
  time: string
  read: boolean
  createdAt?: string | null
}

export const hospitalNotifications: HospitalNotification[] = [
  { id: 'n1', type: 'application', title: 'New application received', message: 'hstu-1 applied to IM Core Clerkship (PRG-201).', time: '10 minutes ago', read: false },
  { id: 'n2', type: 'application', title: 'New application received', message: 'hstu-2 applied to OB/GYN Clerkship (PRG-209).', time: '32 minutes ago', read: false },
  { id: 'n3', type: 'scheduled', title: 'Rotation scheduled', message: 'hstu-4 rotation scheduled under Dr. Nia Johnson (Cardiology).', time: '2 hours ago', read: false },
  { id: 'n4', type: 'program', title: 'Program near capacity', message: 'Anesthesiology Observership (PRG-211) has reached 5/5 seats.', time: '5 hours ago', read: false },
  { id: 'n5', type: 'system', title: 'Account verification', message: 'Your hospital profile was verified by the platform team.', time: 'Yesterday', read: true },
  { id: 'n6', type: 'scheduled', title: 'Rotation completed', message: 'hstu-6 completed General Pediatrics Rotation with Dr. Emily Chen.', time: 'Yesterday', read: true },
  { id: 'n7', type: 'announcement', title: 'Department meeting', message: 'Monthly electives coordinator meeting scheduled for Friday.', time: '2 days ago', read: true },
  { id: 'n8', type: 'system', title: 'Report ready', message: 'Your monthly electives summary report is available to download.', time: '3 days ago', read: true },
]

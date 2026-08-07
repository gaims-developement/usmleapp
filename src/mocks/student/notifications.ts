export interface StudentNotification {
  id: string
  type: 'document' | 'application' | 'rotation' | 'system'
  title: string
  message: string
  time: string
  read: boolean
}

export const studentNotifications: StudentNotification[] = [
  { id: 'sn1', type: 'document', title: 'Document approved', message: 'Your USMLE Step 1 score report was approved.', time: 'Yesterday', read: true },
  { id: 'sn2', type: 'application', title: 'Application under review', message: 'Mount Sinai Beth Israel is reviewing your application.', time: 'Yesterday', read: true },
  { id: 'sn3', type: 'system', title: 'Profile updated', message: 'Your onboarding answers were saved successfully.', time: '2 days ago', read: true },
  { id: 'sn4', type: 'rotation', title: 'Rotation reminder', message: 'Your rotation at Lurie Children’s Hospital starts soon.', time: '3 days ago', read: true },
]

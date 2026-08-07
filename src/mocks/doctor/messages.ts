export interface DoctorMessage {
  id: string
  from: 'doctor' | 'student' | 'coordinator' | 'admin'
  text: string
  time: string
  attachment?: { name: string; size: string }
}

export interface DoctorConversation {
  id: string
  counterpartId: string
  counterpartName: string
  counterpartRole: 'student' | 'coordinator' | 'admin'
  lastMessage: string
  lastTime: string
  unread: number
  messages: DoctorMessage[]
}

export const doctorConversations: DoctorConversation[] = [
  {
    id: 'dcon-1',
    counterpartId: 'dstu-1',
    counterpartName: 'Ahmed Hassan',
    counterpartRole: 'student',
    lastMessage: 'Thank you, doctor. I will revise the presentation.',
    lastTime: '10m ago',
    unread: 2,
    messages: [
      { id: 'm1', from: 'doctor', text: 'Great history taking today on the unstable angina case.', time: 'Yesterday' },
      { id: 'm2', from: 'student', text: 'Thank you! Should I include the TIMI score in my presentation?', time: 'Yesterday' },
      { id: 'm3', from: 'doctor', text: 'Yes, and be ready to discuss how it changes management.', time: 'Yesterday' },
      { id: 'm4', from: 'student', text: 'Thank you, doctor. I will revise the presentation.', time: '10m ago' },
    ],
  },
  {
    id: 'dcon-2',
    counterpartId: 'dstu-15',
    counterpartName: 'Priya Sharma',
    counterpartRole: 'student',
    lastMessage: 'Confirmed. See you at 15:00.',
    lastTime: '2h ago',
    unread: 0,
    messages: [
      { id: 'm1', from: 'doctor', text: 'Your DKA presentation was excellent. Let us schedule a feedback session.', time: '2 days ago' },
      { id: 'm2', from: 'student', text: 'That would be great. When works best for you?', time: '2 days ago' },
      { id: 'm3', from: 'doctor', text: 'Friday at 15:00 in my office.', time: '2h ago' },
      { id: 'm4', from: 'student', text: 'Confirmed. See you at 15:00.', time: '2h ago' },
    ],
  },
  {
    id: 'dcon-3',
    counterpartId: 'coord-1',
    counterpartName: 'Karen Mitchell',
    counterpartRole: 'coordinator',
    lastMessage: 'Please approve the logbook entries by Thursday.',
    lastTime: 'Yesterday',
    unread: 1,
    messages: [
      { id: 'm1', from: 'coordinator', text: 'The new cohort starts next week. Orientation materials are ready.', time: '3 days ago' },
      { id: 'm2', from: 'doctor', text: 'Great, I will review the materials today.', time: '3 days ago' },
      { id: 'm3', from: 'coordinator', text: 'Please approve the logbook entries by Thursday.', time: 'Yesterday' },
    ],
  },
  {
    id: 'dcon-4',
    counterpartId: 'dstu-7',
    counterpartName: 'Hana Kim',
    counterpartRole: 'student',
    lastMessage: 'I shared the completed evaluation summary.',
    lastTime: 'Yesterday',
    unread: 0,
    messages: [
      { id: 'm1', from: 'student', text: 'Doctor, is there anything else needed for my certificate?', time: '2 days ago' },
      { id: 'm2', from: 'doctor', text: 'The final evaluation has been submitted.', time: '2 days ago' },
      { id: 'm3', from: 'student', text: 'I shared the completed evaluation summary.', time: 'Yesterday' },
    ],
  },
  {
    id: 'dcon-5',
    counterpartId: 'admin-1',
    counterpartName: 'Operations Team',
    counterpartRole: 'admin',
    lastMessage: 'LoR status updated to Delivered for LOR-1.',
    lastTime: '2 days ago',
    unread: 0,
    messages: [
      { id: 'm1', from: 'admin', text: 'Your LoR for Hana Kim has been processed.', time: '2 days ago' },
      { id: 'm2', from: 'doctor', text: 'Thank you for the update.', time: '2 days ago' },
      { id: 'm3', from: 'admin', text: 'LoR status updated to Delivered for LOR-1.', time: '2 days ago' },
    ],
  },
]

export const doctorMessageTemplates = [
  { id: 't1', label: 'Approval notice', text: 'Your logbook entry has been approved. Keep up the great work.' },
  { id: 't2', label: 'Evaluation reminder', text: 'Reminder: please submit your mid-rotation self-evaluation by Friday.' },
  { id: 't3', label: 'Feedback request', text: 'Let us schedule a feedback session to review your rotation progress.' },
  { id: 't4', label: 'Certificate update', text: 'Your completion certificate has been generated and sent for approval.' },
  { id: 't5', label: 'LoR update', text: 'I have started your letter of recommendation. It will be submitted once finalized.' },
]

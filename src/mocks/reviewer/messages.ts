export interface ReviewerMessage {
  id: string
  from: 'reviewer' | 'student'
  text: string
  time: string
  attachment?: { name: string; size: string }
}

export interface ReviewerConversation {
  id: string
  studentId: string
  studentName: string
  country: string
  applicationId: string
  lastMessage: string
  lastTime: string
  unread: number
  messages: ReviewerMessage[]
}

export const reviewerConversations: ReviewerConversation[] = [
  {
    id: 'con-1',
    studentId: 'stu-6',
    studentName: 'Meherun Nesa',
    country: 'Bangladesh',
    applicationId: 'RV-1006',
    lastMessage: 'I have uploaded the updated transcript.',
    lastTime: '2h',
    unread: 1,
    messages: [
      {
        id: 'm-1',
        from: 'reviewer',
        text: 'Hi Meherun — two documents are blocking your application for the Pediatrics rotation at UCLA Health. Could you re-upload a clearer transcript scan?',
        time: '3d',
      },
      {
        id: 'm-2',
        from: 'student',
        text: 'I will re-scan it today and upload.',
        time: '3d',
      },
      {
        id: 'm-3',
        from: 'reviewer',
        text: 'Thanks! Also, please add the hepatitis B series documentation to your vaccination records.',
        time: '2d',
      },
      {
        id: 'm-4',
        from: 'student',
        text: 'I have uploaded the updated transcript.',
        time: '2h',
        attachment: { name: 'transcript_updated.pdf', size: '1.2 MB' },
      },
    ],
  },
  {
    id: 'con-2',
    studentId: 'stu-8',
    studentName: 'Juan Pérez',
    country: 'Mexico',
    applicationId: 'RV-1008',
    lastMessage: 'Passport renewal takes 3 weeks — will that affect my seat?',
    lastTime: '5h',
    unread: 0,
    messages: [
      {
        id: 'm-5',
        from: 'reviewer',
        text: 'Hi Juan — your passport expires within 6 months, which is below our requirement. You will need to upload the renewed passport before we can approve.',
        time: '4d',
      },
      {
        id: 'm-6',
        from: 'student',
        text: 'Passport renewal takes 3 weeks — will that affect my seat?',
        time: '5h',
      },
    ],
  },
  {
    id: 'con-3',
    studentId: 'stu-11',
    studentName: 'James Kimani',
    country: 'Kenya',
    applicationId: 'RV-1011',
    lastMessage: 'Working on the TOEFL — booked for next week.',
    lastTime: '1d',
    unread: 0,
    messages: [
      {
        id: 'm-7',
        from: 'reviewer',
        text: 'Hello James — your transcript needs a certified English translation, and the elective requires a USMLE Step 1 score. Please plan accordingly.',
        time: '5d',
      },
      {
        id: 'm-8',
        from: 'student',
        text: 'Working on the TOEFL — booked for next week.',
        time: '1d',
      },
    ],
  },
  {
    id: 'con-4',
    studentId: 'stu-13',
    studentName: 'Sara Rahimi',
    country: 'Iran',
    applicationId: 'RV-1013',
    lastMessage: 'Uploaded the revised CV.',
    lastTime: '3h',
    unread: 2,
    messages: [
      {
        id: 'm-9',
        from: 'student',
        text: 'I added my clinical rotations and publications to the CV.',
        time: '3h',
        attachment: { name: 'cv_revised.pdf', size: '640 KB' },
      },
      {
        id: 'm-10',
        from: 'student',
        text: 'Uploaded the revised CV.',
        time: '3h',
      },
    ],
  },
  {
    id: 'con-5',
    studentId: 'stu-17',
    studentName: 'Grace Wanjiku',
    country: 'Kenya',
    applicationId: 'RV-1017',
    lastMessage: 'Congratulations — your application has been approved.',
    lastTime: '6h',
    unread: 0,
    messages: [
      {
        id: 'm-11',
        from: 'reviewer',
        text: 'Congratulations Grace — your application for the OB/GYN rotation at Johns Hopkins has been approved and forwarded to the hospital for seat confirmation.',
        time: '6h',
      },
    ],
  },
]

export interface MessageTemplate {
  id: string
  title: string
  body: string
}

export const messageTemplates: MessageTemplate[] = [
  {
    id: 'tpl-1',
    title: 'Request document update',
    body: 'Hi {name} — one or more documents on your application need your attention. Please review the feedback in your document list and upload the corrected version at your earliest convenience.',
  },
  {
    id: 'tpl-2',
    title: 'Documents verified',
    body: 'Hi {name} — all of your documents have been verified. We are proceeding with the review of your application.',
  },
  {
    id: 'tpl-3',
    title: 'Application approved',
    body: 'Congratulations {name}! Your application has been approved. We will forward it to the hospital for the next step.',
  },
  {
    id: 'tpl-4',
    title: 'Forwarded to hospital',
    body: 'Hi {name} — your application has been forwarded to {hospital}. The hospital will confirm your seat and rotation dates shortly.',
  },
  {
    id: 'tpl-5',
    title: 'Request more information',
    body: 'Hi {name} — we need a little more information to complete the review of your application. Please reply with the details requested below.',
  },
  {
    id: 'tpl-6',
    title: 'Application deadline',
    body: 'Hi {name} — this is a friendly reminder that your application deadline for {hospital} is approaching. Please complete any pending items before then.',
  },
]

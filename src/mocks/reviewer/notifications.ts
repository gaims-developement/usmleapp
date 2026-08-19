import type { NotificationTone } from '@/mocks/admin/ops'

export interface ReviewerNotification {
  id: string
  tone: NotificationTone
  title: string
  body: string
  time: string
  read: boolean
  createdAt?: string | null
}

export const reviewerNotifications: ReviewerNotification[] = [
  {
    id: 'rntf-1',
    tone: 'info',
    title: 'New application assigned',
    body: 'RV-1004 · Fatima El-Sayed (Cardiology) has been added to your queue.',
    time: '18m ago',
    read: false,
  },
  {
    id: 'rntf-2',
    tone: 'success',
    title: 'Student updated documents',
    body: 'Meherun Nesa re-uploaded her transcript for RV-1006.',
    time: '2h ago',
    read: false,
  },
  {
    id: 'rntf-3',
    tone: 'warning',
    title: 'Application deadline approaching',
    body: 'RV-1009 · Mayo Clinic rotation starts 2026-10-12 — pending docs remain.',
    time: '3h ago',
    read: false,
  },
  {
    id: 'rntf-4',
    tone: 'info',
    title: 'Admin message',
    body: 'Operations: please prioritize RV-1003 — hospital seat confirmation is time-sensitive.',
    time: '5h ago',
    read: false,
  },
  {
    id: 'rntf-5',
    tone: 'success',
    title: 'Application approved',
    body: 'You approved RV-1017 · Grace Wanjiku (OB/GYN).',
    time: '6h ago',
    read: true,
  },
  {
    id: 'rntf-6',
    tone: 'warning',
    title: 'Student updated documents',
    body: 'Sara Rahimi uploaded a revised CV for RV-1013.',
    time: '7h ago',
    read: true,
  },
  {
    id: 'rntf-7',
    tone: 'critical',
    title: 'Compliance flag',
    body: 'RV-1012 was closed after a rejected vaccination record — review before re-application.',
    time: '1d ago',
    read: true,
  },
  {
    id: 'rntf-8',
    tone: 'info',
    title: 'Admin message',
    body: 'Reviewer workload review on Friday — complete pending evaluations.',
    time: '1d ago',
    read: true,
  },
]

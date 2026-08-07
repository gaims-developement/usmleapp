import {
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileClock,
  GraduationCap,
  LifeBuoy,
  Stethoscope,
  UserCheck,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface OpsKpi {
  id: string
  label: string
  value: number
  hint: string
  icon: LucideIcon
  tone: 'brand' | 'accent' | 'amber' | 'violet' | 'sky' | 'rose'
  to: string
}

export const adminOpsKpis: OpsKpi[] = [
  {
    id: 'pending-apps',
    label: 'Pending Applications',
    value: 12,
    hint: 'awaiting review assignment',
    icon: ClipboardList,
    tone: 'amber',
    to: '/dashboard/admin/applications',
  },
  {
    id: 'under-review',
    label: 'Applications Under Review',
    value: 8,
    hint: '3 aging over 48 hours',
    icon: FileClock,
    tone: 'sky',
    to: '/dashboard/admin/applications',
  },
  {
    id: 'approved-today',
    label: 'Applications Approved Today',
    value: 6,
    hint: 'target 10',
    icon: CheckCircle2,
    tone: 'brand',
    to: '/dashboard/admin/applications',
  },
  {
    id: 'hospital-approval',
    label: 'Hospitals Awaiting Approval',
    value: 4,
    hint: '2 waiting over 7 days',
    icon: Building2,
    tone: 'violet',
    to: '/dashboard/admin/hospitals',
  },
  {
    id: 'pending-tickets',
    label: 'Pending Support Tickets',
    value: 7,
    hint: '2 urgent',
    icon: LifeBuoy,
    tone: 'rose',
    to: '/dashboard/admin/support',
  },
  {
    id: 'active-programs',
    label: 'Active Elective Programs',
    value: 148,
    hint: 'across 96 hospitals',
    icon: GraduationCap,
    tone: 'accent',
    to: '/dashboard/admin/programs',
  },
  {
    id: 'doctors-available',
    label: 'Doctors Available',
    value: 261,
    hint: '51 currently on rotation',
    icon: Stethoscope,
    tone: 'brand',
    to: '/dashboard/admin/doctors',
  },
  {
    id: 'reviewers-online',
    label: 'Reviewers Online',
    value: 11,
    hint: 'of 14 total',
    icon: UserCheck,
    tone: 'violet',
    to: '/dashboard/admin/reviewers',
  },
]

export type NotificationTone = 'success' | 'warning' | 'info' | 'critical'

export interface AdminNotification {
  id: string
  tone: NotificationTone
  title: string
  body: string
  time: string
  read: boolean
}

export const adminNotifications: AdminNotification[] = [
  {
    id: 'ntf-1',
    tone: 'warning',
    title: 'Support ticket escalated',
    body: 'TK-207 · Payment charged twice is now flagged as urgent.',
    time: '4m ago',
    read: false,
  },
  {
    id: 'ntf-2',
    tone: 'info',
    title: 'Application forwarded',
    body: 'AP-1039 was forwarded to Dr. Alan Cross by Dr. Maria Gomez.',
    time: '22m ago',
    read: false,
  },
  {
    id: 'ntf-3',
    tone: 'success',
    title: 'Application approved',
    body: 'AP-1042 · Mount Sinai Beth Israel marked as offered.',
    time: '41m ago',
    read: false,
  },
  {
    id: 'ntf-4',
    tone: 'critical',
    title: 'New hospital awaiting approval',
    body: 'Northside Medical Center submitted its onboarding documents.',
    time: '1h ago',
    read: true,
  },
  {
    id: 'ntf-5',
    tone: 'info',
    title: 'Reviewer workload high',
    body: 'Dr. Nia Johnson has 12 pending applications.',
    time: '2h ago',
    read: true,
  },
  {
    id: 'ntf-6',
    tone: 'warning',
    title: 'Document expiring',
    body: 'Passport for Aarav Patel expires within 60 days.',
    time: '3h ago',
    read: true,
  },
  {
    id: 'ntf-7',
    tone: 'success',
    title: 'New student registered',
    body: 'Priya Sharma joined from Armed Forces Medical College.',
    time: '4h ago',
    read: true,
  },
  {
    id: 'ntf-8',
    tone: 'info',
    title: 'Program published',
    body: 'IM Core Clerkship · Cleveland Clinic is now live.',
    time: '6h ago',
    read: true,
  },
]

export type ReportCategory =
  | 'Applications'
  | 'Hospitals'
  | 'Students'
  | 'Doctors'
  | 'Programs'
  | 'Reviewers'

export interface ReportDefinition {
  id: string
  title: string
  description: string
  category: ReportCategory
  icon: LucideIcon
  tone: 'brand' | 'accent' | 'amber' | 'violet' | 'sky' | 'rose'
}

export const reportCatalog: ReportDefinition[] = [
  { id: 'rpt-app-queue', title: 'Application queue', description: 'All active applications with status, reviewer, priority, and flags.', category: 'Applications', icon: ClipboardList, tone: 'amber' },
  { id: 'rpt-app-approvals', title: 'Daily approvals', description: 'Applications approved per day over the trailing 30 days.', category: 'Applications', icon: CheckCircle2, tone: 'brand' },
  { id: 'rpt-hospital-roster', title: 'Hospital roster', description: 'Partner hospitals with tier, status, program and doctor counts.', category: 'Hospitals', icon: Building2, tone: 'violet' },
  { id: 'rpt-hospital-approvals', title: 'Hospital onboarding', description: 'Hospitals awaiting approval and onboarding progress.', category: 'Hospitals', icon: CalendarClock, tone: 'sky' },
  { id: 'rpt-student-roster', title: 'Student roster', description: 'Registered students with application counts and document completeness.', category: 'Students', icon: Users, tone: 'brand' },
  { id: 'rpt-student-docs', title: 'Document completeness', description: 'Students with missing or expiring documents.', category: 'Students', icon: FileClock, tone: 'rose' },
  { id: 'rpt-doctor-roster', title: 'Doctor roster', description: 'Attending physicians with specialty, hospital, and availability.', category: 'Doctors', icon: Stethoscope, tone: 'accent' },
  { id: 'rpt-program-listing', title: 'Program listing', description: 'All elective programs with fill rates, fees, and start dates.', category: 'Programs', icon: GraduationCap, tone: 'violet' },
  { id: 'rpt-reviewer-load', title: 'Reviewer workload', description: 'Assigned, pending, and completed applications per reviewer.', category: 'Reviewers', icon: UserCheck, tone: 'sky' },
]

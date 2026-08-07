import {
  Activity,
  Building2,
  ClipboardList,
  DollarSign,
  FileCheck2,
  GraduationCap,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface AdminKpi {
  id: string
  label: string
  value: string
  delta: string
  deltaTone: 'up' | 'down' | 'neutral'
  hint: string
  icon: LucideIcon
}

export const adminKpis: AdminKpi[] = [
  {
    id: 'students',
    label: 'Registered Students',
    value: '4,286',
    delta: '12.4%',
    deltaTone: 'up',
    hint: 'vs last month',
    icon: Users,
  },
  {
    id: 'applications',
    label: 'Active Applications',
    value: '1,134',
    delta: '8.2%',
    deltaTone: 'up',
    hint: 'vs last month',
    icon: ClipboardList,
  },
  {
    id: 'hospitals',
    label: 'Partner Hospitals',
    value: '96',
    delta: '+3',
    deltaTone: 'up',
    hint: '2 currently onboarding',
    icon: Building2,
  },
  {
    id: 'doctors',
    label: 'Active Doctors',
    value: '312',
    delta: '+14',
    deltaTone: 'up',
    hint: 'this quarter',
    icon: Stethoscope,
  },
  {
    id: 'pending',
    label: 'Pending Reviews',
    value: '87',
    delta: '5.6%',
    deltaTone: 'down',
    hint: 'aging 3+ days: 12',
    icon: ShieldAlert,
  },
  {
    id: 'programs',
    label: 'Programs Available',
    value: '148',
    delta: '+9',
    deltaTone: 'up',
    hint: 'across 96 hospitals',
    icon: GraduationCap,
  },
  {
    id: 'revenue',
    label: 'Monthly Revenue',
    value: '$48,920',
    delta: '15.3%',
    deltaTone: 'up',
    hint: 'Feb–Aug trend',
    icon: DollarSign,
  },
  {
    id: 'health',
    label: 'Platform Health',
    value: '99.9%',
    delta: 'Stable',
    deltaTone: 'neutral',
    hint: 'All systems nominal',
    icon: Activity,
  },
]

export interface ChartDatum {
  label: string
  value: number
}

export interface StatusSlice {
  label: string
  value: number
  color: string
}

export interface AdminAnalytics {
  applicationsByStatus: StatusSlice[]
  applicationsBySpecialty: (ChartDatum & { color: string })[]
  applicationsByCountry: StatusSlice[]
  monthlyRegistrations: ChartDatum[]
  electivesFilled: { label: string; filled: number; available: number }[]
  revenueTrend: ChartDatum[]
}

export const adminAnalytics: AdminAnalytics = {
  applicationsByStatus: [
    { label: 'Submitted', value: 420, color: '#0ea5e9' },
    { label: 'Under review', value: 312, color: '#f59e0b' },
    { label: 'Info needed', value: 87, color: '#f43f5e' },
    { label: 'Offered', value: 214, color: '#8b5cf6' },
    { label: 'Confirmed', value: 101, color: '#0d9488' },
  ],
  applicationsBySpecialty: [
    { label: 'Internal Medicine', value: 268, color: '#0d9488' },
    { label: 'Family Medicine', value: 194, color: '#6366f1' },
    { label: 'Pediatrics', value: 176, color: '#0ea5e9' },
    { label: 'Surgery', value: 143, color: '#f59e0b' },
    { label: 'Emergency Medicine', value: 121, color: '#f43f5e' },
    { label: 'Psychiatry', value: 88, color: '#8b5cf6' },
    { label: 'Radiology', value: 74, color: '#10b981' },
    { label: 'Neurology', value: 62, color: '#f97316' },
  ],
  applicationsByCountry: [
    { label: 'India', value: 1420, color: '#0d9488' },
    { label: 'Pakistan', value: 512, color: '#6366f1' },
    { label: 'Nigeria', value: 388, color: '#0ea5e9' },
    { label: 'Egypt', value: 302, color: '#f59e0b' },
    { label: 'Philippines', value: 240, color: '#8b5cf6' },
    { label: 'Other', value: 1424, color: '#cbd5e1' },
  ],
  monthlyRegistrations: [
    { label: 'Jan', value: 210 },
    { label: 'Feb', value: 245 },
    { label: 'Mar', value: 290 },
    { label: 'Apr', value: 330 },
    { label: 'May', value: 402 },
    { label: 'Jun', value: 458 },
    { label: 'Jul', value: 511 },
    { label: 'Aug', value: 590 },
  ],
  electivesFilled: [
    { label: 'IM', filled: 122, available: 150 },
    { label: 'Family', filled: 96, available: 120 },
    { label: 'Peds', filled: 88, available: 110 },
    { label: 'Surgery', filled: 74, available: 100 },
    { label: 'EM', filled: 68, available: 90 },
    { label: 'Psych', filled: 51, available: 70 },
    { label: 'Rad', filled: 45, available: 60 },
    { label: 'Neuro', filled: 38, available: 50 },
  ],
  revenueTrend: [
    { label: 'Jan', value: 22400 },
    { label: 'Feb', value: 25800 },
    { label: 'Mar', value: 27900 },
    { label: 'Apr', value: 31200 },
    { label: 'May', value: 35400 },
    { label: 'Jun', value: 39800 },
    { label: 'Jul', value: 44300 },
    { label: 'Aug', value: 48920 },
  ],
}

export interface UptimeService {
  name: string
  uptime: number
  tone: 'good' | 'warn'
}

export const platformUptime: UptimeService[] = [
  { name: 'Core API', uptime: 99.98, tone: 'good' },
  { name: 'Database', uptime: 99.96, tone: 'good' },
  { name: 'File storage', uptime: 99.91, tone: 'good' },
  { name: 'Email delivery', uptime: 99.74, tone: 'warn' },
]

export interface AdminActivityItem {
  id: string
  icon: LucideIcon
  title: string
  detail?: string
  time: string
  iconClassName?: string
}

export const recentActivity: AdminActivityItem[] = [
  {
    id: 'act-1',
    icon: FileCheck2,
    title: 'Application AP-1042 marked offered',
    detail: 'Mount Sinai Beth Israel · Internal Medicine',
    time: '12m ago',
    iconClassName: 'bg-violet-50 text-violet-600',
  },
  {
    id: 'act-2',
    icon: Users,
    title: 'New student registered',
    detail: 'Aarav Patel · India',
    time: '38m ago',
    iconClassName: 'bg-brand-50 text-brand-600',
  },
  {
    id: 'act-3',
    icon: ShieldAlert,
    title: 'Document flagged as expiring',
    detail: 'Passport · U-1092',
    time: '1h ago',
    iconClassName: 'bg-amber-50 text-amber-600',
  },
  {
    id: 'act-4',
    icon: Building2,
    title: 'Hospital joined the network',
    detail: 'Northside Medical Center · Atlanta, GA',
    time: '2h ago',
    iconClassName: 'bg-sky-50 text-sky-600',
  },
  {
    id: 'act-5',
    icon: DollarSign,
    title: 'Payment received',
    detail: '$2,400 · Pro plan · U-1084',
    time: '3h ago',
    iconClassName: 'bg-brand-50 text-brand-600',
  },
  {
    id: 'act-6',
    icon: ScrollText,
    title: 'Role updated',
    detail: 'Reviewer batch 6 promoted by A. Admin',
    time: '4h ago',
    iconClassName: 'bg-ink-100 text-ink-600',
  },
  {
    id: 'act-7',
    icon: ShieldCheck,
    title: 'New reviewer onboarded',
    detail: 'Dr. Sarah Kim · 14 applications assigned',
    time: '6h ago',
    iconClassName: 'bg-violet-50 text-violet-600',
  },
  {
    id: 'act-8',
    icon: GraduationCap,
    title: 'Program published',
    detail: 'IM Core Clerkship · Cleveland Clinic',
    time: '8h ago',
    iconClassName: 'bg-accent-50 text-accent-600',
  },
]

import type { AppNavItem } from '@/components/layout/app-layout'
import {
  Building2,
  CalendarDays,
  ClipboardList,
  Clock,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Repeat,
  Stethoscope,
  Users,
} from 'lucide-react'

export const hospitalPendingNav: AppNavItem[] = [
  { to: '/dashboard/hospital', label: 'Dashboard', icon: LayoutDashboard, section: 'Overview', end: true },
  { to: '/dashboard/hospital/announcements', label: 'Announcements', icon: Megaphone, section: 'General' },
]

export const hospitalNav: AppNavItem[] = [
  { to: '/dashboard/hospital', label: 'Dashboard', icon: LayoutDashboard, section: 'Overview', end: true },
  { to: '/dashboard/hospital/programs', label: 'Elective Programs', icon: GraduationCap, section: 'Programs' },
  { to: '/dashboard/hospital/applications', label: 'Applications', icon: ClipboardList, section: 'Programs' },
  { to: '/dashboard/hospital/rotations', label: 'Current Rotations', icon: Repeat, section: 'Programs' },
  { to: '/dashboard/hospital/doctors', label: 'Doctors', icon: Stethoscope, section: 'Team' },
  { to: '/dashboard/hospital/pending', label: 'Pending Registrations', icon: Clock, section: 'Team' },
  { to: '/dashboard/hospital/students', label: 'Students', icon: Users, section: 'Team' },
  { to: '/dashboard/hospital/calendar', label: 'Calendar', icon: CalendarDays, section: 'Team' },
  { to: '/dashboard/hospital/announcements', label: 'Announcements', icon: Megaphone, section: 'Team' },
  { to: '/forum', label: 'Forum', icon: MessageSquare, section: 'Community' },
  { to: '/dashboard/hospital/organization', label: 'Organization', icon: Building2, section: 'Account', end: true },
  { to: '/dashboard/hospital/profile', label: 'Hospital Profile', icon: Building2, section: 'Account', end: true },
]

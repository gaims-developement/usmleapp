import type { AppNavItem } from '@/components/layout/app-layout'
import {
  Building2,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  Repeat,
  Stethoscope,
  Users,
} from 'lucide-react'

export const hospitalNav: AppNavItem[] = [
  { to: '/dashboard/hospital', label: 'Dashboard', icon: LayoutDashboard, section: 'Overview', end: true },
  { to: '/dashboard/hospital/programs', label: 'Elective Programs', icon: GraduationCap, section: 'Programs' },
  { to: '/dashboard/hospital/applications', label: 'Applications', icon: ClipboardList, section: 'Programs' },
  { to: '/dashboard/hospital/rotations', label: 'Current Rotations', icon: Repeat, section: 'Programs' },
  { to: '/dashboard/hospital/doctors', label: 'Doctors', icon: Stethoscope, section: 'Team' },
  { to: '/dashboard/hospital/students', label: 'Students', icon: Users, section: 'Team' },
  { to: '/dashboard/hospital/calendar', label: 'Calendar', icon: CalendarDays, section: 'Team' },
  { to: '/dashboard/hospital/announcements', label: 'Announcements', icon: Megaphone, section: 'Team' },
  { to: '/dashboard/hospital/profile', label: 'Hospital Profile', icon: Building2, section: 'Account', end: true },
]

import type { AppNavItem } from '@/components/layout/app-layout'
import {
  Award,
  CalendarDays,
  ClipboardList,
  FileSignature,
  LayoutDashboard,
  MessageSquare,
  MessageSquareText,
  RotateCw,
  Stethoscope,
  UserCircle,
  Users,
} from 'lucide-react'

export const doctorPendingNav: AppNavItem[] = [
  { to: '/dashboard/doctor', label: 'Dashboard', icon: LayoutDashboard, section: 'Overview', end: true },
]

export const doctorNav: AppNavItem[] = [
  { to: '/dashboard/doctor', label: 'Dashboard', icon: LayoutDashboard, section: 'Overview', end: true },
  { to: '/dashboard/doctor/students', label: 'My Students', icon: Users, section: 'Students' },
  { to: '/dashboard/doctor/rotations', label: 'Current Rotations', icon: RotateCw, section: 'Students' },
  { to: '/dashboard/doctor/schedule', label: 'Schedule', icon: CalendarDays, section: 'Students' },
  { to: '/dashboard/doctor/logbooks', label: 'Clinical Logbooks', icon: ClipboardList, section: 'Assessments' },
  { to: '/dashboard/doctor/evaluations', label: 'Evaluations', icon: Stethoscope, section: 'Assessments' },
  { to: '/dashboard/doctor/letters', label: 'Letters of Recommendation', icon: FileSignature, section: 'Assessments' },
  { to: '/dashboard/doctor/certificates', label: 'Certificates', icon: Award, section: 'Assessments' },
  { to: '/dashboard/doctor/messages', label: 'Messages', icon: MessageSquareText, section: 'Communication' },
  { to: '/forum', label: 'Forum', icon: MessageSquare, section: 'Communication' },
  { to: '/dashboard/doctor/profile', label: 'Profile', icon: UserCircle, section: 'Account', end: true },
]

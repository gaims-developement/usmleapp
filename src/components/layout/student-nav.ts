import type { AppNavItem } from '@/components/layout/app-layout'
import {
  CalendarDays,
  ClipboardList,
  FolderOpen,
  LayoutDashboard,
  Megaphone,
  Search,
  Settings,
  UserCircle,
} from 'lucide-react'

export const studentNav: AppNavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Overview', end: true },
  { to: '/electives', label: 'Browse Electives', icon: Search, section: 'Electives' },
  { to: '/applications', label: 'My Applications', icon: ClipboardList, section: 'Electives' },
  { to: '/documents', label: 'Documents', icon: FolderOpen, section: 'Documents' },
  { to: '/planner', label: 'Study Planner', icon: CalendarDays, section: 'Planning' },
  { to: '/announcements', label: 'Announcements', icon: Megaphone, section: 'Planning' },
  { to: '/profile', label: 'Profile', icon: UserCircle, section: 'Account', end: true },
  { to: '/settings', label: 'Settings', icon: Settings, section: 'Account', end: true },
]

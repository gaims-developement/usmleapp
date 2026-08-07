import type { AppNavItem } from '@/components/layout/app-layout'
import {
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  LayoutDashboard,
  MessageSquare,
  ThumbsDown,
  User,
  XCircle,
} from 'lucide-react'

export const reviewerNav: AppNavItem[] = [
  { to: '/dashboard/reviewer', label: 'Dashboard', icon: LayoutDashboard, section: 'Overview', end: true },
  { to: '/dashboard/reviewer/applications', label: 'Applications', icon: ClipboardList, section: 'Review' },
  { to: '/dashboard/reviewer/pending', label: 'Pending Reviews', icon: XCircle, section: 'Review' },
  { to: '/dashboard/reviewer/approved', label: 'Approved Applications', icon: CheckCircle2, section: 'Review' },
  { to: '/dashboard/reviewer/rejected', label: 'Rejected Applications', icon: ThumbsDown, section: 'Review' },
  { to: '/dashboard/reviewer/documents', label: 'Document Verification', icon: FileCheck2, section: 'Review' },
  { to: '/dashboard/reviewer/messages', label: 'Messages', icon: MessageSquare, section: 'Communication' },
  { to: '/dashboard/reviewer/profile', label: 'Profile', icon: User, section: 'Account', end: true },
]

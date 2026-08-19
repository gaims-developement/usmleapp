import { AppLayout } from '@/components/layout/app-layout'
import { hospitalNav, hospitalPendingNav } from '@/components/layout/hospital-nav'
import { useAuth } from '@/hooks/useAuth'

/**
 * Renders the correct hospital sidebar based on approval status.
 * Pending hospitals see only Dashboard + Announcements.
 * Active hospitals see the full navigation.
 */
export function HospitalLayout() {
  const { user } = useAuth()
  const isPending = user?.hospital?.status !== 'active'
  return <AppLayout nav={isPending ? hospitalPendingNav : hospitalNav} />
}

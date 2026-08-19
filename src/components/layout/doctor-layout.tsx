import { AppLayout } from '@/components/layout/app-layout'
import { doctorNav, doctorPendingNav } from '@/components/layout/doctor-nav'
import { useAuth } from '@/hooks/useAuth'

/**
 * Renders the correct doctor sidebar based on approval status.
 * Pending doctors see only Dashboard.
 * Active doctors see the full navigation.
 */
export function DoctorLayout() {
  const { user } = useAuth()
  const isPending = user?.doctor?.status !== 'active'
  return <AppLayout nav={isPending ? doctorPendingNav : doctorNav} />
}

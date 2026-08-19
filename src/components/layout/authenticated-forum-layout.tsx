import { AppLayout } from '@/components/layout/app-layout'
import { studentNav } from '@/components/layout/student-nav'
import { adminNav, superAdminNav } from '@/components/layout/admin-nav'
import { doctorNav, doctorPendingNav } from '@/components/layout/doctor-nav'
import { hospitalNav, hospitalPendingNav } from '@/components/layout/hospital-nav'
import { reviewerNav, reviewerPendingNav } from '@/components/layout/reviewer-nav'
import { useAuth } from '@/hooks/useAuth'

/**
 * Renders the Forum layout with appropriate navigation sidebar for any authenticated user role.
 */
export function AuthenticatedForumLayout() {
  const { user } = useAuth()
  const role = user?.role

  let nav = studentNav
  if (role === 'SUPER_ADMIN') {
    nav = superAdminNav
  } else if (role === 'ADMIN') {
    nav = adminNav
  } else if (role === 'DOCTOR') {
    const isPending = user?.doctor?.status !== 'active'
    nav = isPending ? doctorPendingNav : doctorNav
  } else if (role === 'HOSPITAL') {
    const isPending = user?.hospital?.status !== 'active'
    nav = isPending ? hospitalPendingNav : hospitalNav
  } else if (role === 'REVIEWER') {
    const isPending = user?.reviewer?.status !== 'active'
    nav = isPending ? reviewerPendingNav : reviewerNav
  }

  return <AppLayout nav={nav} />
}

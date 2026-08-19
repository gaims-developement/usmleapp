import { AppLayout } from '@/components/layout/app-layout'
import { reviewerNav, reviewerPendingNav } from '@/components/layout/reviewer-nav'
import { useAuth } from '@/hooks/useAuth'

/**
 * Renders the correct reviewer sidebar based on approval status.
 * Pending reviewers see only Dashboard.
 * Active reviewers see the full navigation.
 */
export function ReviewerLayout() {
  const { user } = useAuth()
  const isPending = user?.reviewer?.status !== 'active'
  return <AppLayout nav={isPending ? reviewerPendingNav : reviewerNav} />
}

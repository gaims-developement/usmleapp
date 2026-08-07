import { useMemo } from 'react'
import { XCircle } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { PageLoader } from '@/components/ui/spinner'
import { ReviewerApplicationsTable } from '@/components/reviewer/applications-table'
import { useReviewerApplications } from '@/lib/reviewerQueries'

export function ReviewerPendingPage() {
  const applications = useReviewerApplications()

  const pending = useMemo(
    () => (applications.data ?? []).filter(a => a.status === 'submitted' || a.status === 'under_review'),
    [applications.data],
  )

  if (applications.isLoading) return <PageLoader label="Loading pending reviews…" />

  const submitted = pending.filter(a => a.status === 'submitted').length
  const underReview = pending.filter(a => a.status === 'under_review').length

  return (
    <div>
      <PageHeader
        title="Pending Reviews"
        subtitle="Applications waiting on your decision."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Submitted — not yet started</p>
          <p className="mt-2 font-display text-2xl font-bold text-sky-600">{submitted}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Under review — in progress</p>
          <p className="mt-2 font-display text-2xl font-bold text-amber-600">{underReview}</p>
        </div>
      </div>

      <div className="mt-6">
        <ReviewerApplicationsTable data={pending} pageSize={10} />
      </div>

      {pending.length === 0 && (
        <p className="mt-4 flex items-center gap-2 text-sm text-ink-400">
          <XCircle className="size-4" aria-hidden />
          You're all caught up — no pending applications.
        </p>
      )}
    </div>
  )
}

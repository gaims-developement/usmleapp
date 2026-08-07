import { useMemo } from 'react'
import { ThumbsDown } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { PageLoader } from '@/components/ui/spinner'
import { ReviewerApplicationsTable } from '@/components/reviewer/applications-table'
import { useReviewerApplications } from '@/lib/reviewerQueries'

export function ReviewerRejectedPage() {
  const applications = useReviewerApplications()

  const rejected = useMemo(
    () => (applications.data ?? []).filter(a => a.status === 'rejected'),
    [applications.data],
  )

  if (applications.isLoading) return <PageLoader label="Loading rejected applications…" />

  return (
    <div>
      <PageHeader
        title="Rejected Applications"
        subtitle="Applications you closed after review. Students may reapply with updated documents."
      />

      <div className="mt-6 rounded-3xl border border-ink-200 bg-white p-5 shadow-soft sm:w-80">
        <p className="text-sm text-ink-500">Rejected applications</p>
        <p className="mt-2 font-display text-2xl font-bold text-red-600">{rejected.length}</p>
      </div>

      <div className="mt-6">
        <ReviewerApplicationsTable data={rejected} pageSize={10} />
      </div>

      {rejected.length === 0 && (
        <p className="mt-4 flex items-center gap-2 text-sm text-ink-400">
          <ThumbsDown className="size-4" aria-hidden />
          No rejected applications.
        </p>
      )}
    </div>
  )
}

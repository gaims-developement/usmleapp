import { useMemo } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { PageLoader } from '@/components/ui/spinner'
import { ReviewerApplicationsTable } from '@/components/reviewer/applications-table'
import { useReviewerApplications } from '@/lib/reviewerQueries'

export function ReviewerApprovedPage() {
  const applications = useReviewerApplications()

  const approved = useMemo(
    () => (applications.data ?? []).filter(a => a.status === 'approved'),
    [applications.data],
  )

  if (applications.isLoading) return <PageLoader label="Loading approved applications…" />

  return (
    <div>
      <PageHeader
        title="Approved Applications"
        subtitle="Applications you have approved and cleared for the next step."
      />

      <div className="mt-6 rounded-3xl border border-ink-200 bg-white p-5 shadow-soft sm:w-80">
        <p className="text-sm text-ink-500">Approved applications</p>
        <p className="mt-2 font-display text-2xl font-bold text-brand-600">{approved.length}</p>
      </div>

      <div className="mt-6">
        <ReviewerApplicationsTable data={approved} pageSize={10} />
      </div>

      {approved.length === 0 && (
        <p className="mt-4 flex items-center gap-2 text-sm text-ink-400">
          <CheckCircle2 className="size-4" aria-hidden />
          No approved applications yet.
        </p>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CheckCircle2, ClipboardList, X } from 'lucide-react'
import { useApplications, useWithdrawApplication } from '@/lib/queries'
import { PageHeader } from '@/components/ui/page-header'
import { PageLoader } from '@/components/ui/spinner'
import { ApplicationCard } from '@/components/applications/application-card'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'

type Filter = 'all' | 'active' | 'offers' | 'confirmed' | 'ended'

const activeStatuses = ['submitted', 'under_review', 'additional_info', 'offered']
const offeredStatuses = ['offered', 'confirmed']

const filters: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'In progress' },
  { key: 'offers', label: 'Offers' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'ended', label: 'Ended' },
]

export function ApplicationsPage() {
  const location = useLocation()
  const justApplied = (location.state as { justApplied?: string } | null)?.justApplied
  const [bannerOpen, setBannerOpen] = useState(Boolean(justApplied))
  const [filter, setFilter] = useState<Filter>('all')
  const { data, isPending } = useApplications()
  const withdraw = useWithdrawApplication()

  if (isPending) return <PageLoader label="Loading applications…" />

  const apps = data ?? []
  const filtered = apps.filter(app => {
    switch (filter) {
      case 'active':
        return activeStatuses.includes(app.status)
      case 'offers':
        return offeredStatuses.includes(app.status)
      case 'confirmed':
        return app.status === 'confirmed'
      case 'ended':
        return app.status === 'withdrawn' || app.status === 'rejected'
      default:
        return true
    }
  })

  function handleWithdraw(id: string) {
    if (window.confirm('Withdraw this application? You can re-apply later.')) {
      withdraw.mutate(id)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Applications"
        subtitle="Track the status of every elective application you've submitted."
      />

      {bannerOpen && justApplied && (
        <div className="flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-800">
          <CheckCircle2 className="size-5 shrink-0" aria-hidden />
          <p>
            Application <span className="font-semibold">{justApplied}</span> submitted successfully.
            The program will review your documents and you can track progress below.
          </p>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setBannerOpen(false)}
            className="ml-auto grid size-7 shrink-0 cursor-pointer place-items-center rounded-lg text-brand-700 hover:bg-brand-100"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {filters.map(f => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
              filter === f.key
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-ink-300 bg-white text-ink-700 hover:border-brand-400',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-5">
          {filtered.map(app => (
            <ApplicationCard
              key={app.id}
              app={app}
              onWithdraw={() => handleWithdraw(app.id)}
              withdrawPending={withdraw.isPending}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<ClipboardList className="size-7" />}
          title={apps.length === 0 ? 'No applications yet' : 'Nothing in this view'}
          description={
            apps.length === 0
              ? 'Browse verified electives and submit your first application to get started.'
              : 'Try a different filter to see more applications.'
          }
          actionLabel={apps.length === 0 ? 'Browse electives' : undefined}
          actionTo={apps.length === 0 ? '/electives' : undefined}
        />
      )}
    </div>
  )
}

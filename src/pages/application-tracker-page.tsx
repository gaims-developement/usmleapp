import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
} from 'lucide-react'
import { useApplications, useWithdrawApplication } from '@/lib/queries'
import { PageHeader } from '@/components/ui/page-header'
import { PageLoader } from '@/components/ui/spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { applicationStatusMeta, StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button'
import { formatDate } from '@/components/electives/elective-card'
import { cn } from '@/lib/utils'

export function ApplicationTrackerPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isPending } = useApplications()
  const withdraw = useWithdrawApplication()

  if (isPending) return <PageLoader label="Loading application…" />

  const app = (data ?? []).find(a => a.id === id)

  if (!app) {
    return (
      <div className="space-y-6">
        <PageHeader title="Application tracker" />
        <EmptyState
          icon={<ClipboardList className="size-7" />}
          title="Application not found"
          description="This application could not be found or has been removed."
          actionLabel="Back to applications"
          actionTo="/applications"
        />
      </div>
    )
  }

  const meta = applicationStatusMeta(app.status)
  const doneCount = app.timeline.filter(t => t.done).length
  const canWithdraw = !['withdrawn', 'rejected', 'confirmed'].includes(app.status)
  const applicationId = app.id

  function handleWithdraw() {
    if (window.confirm('Withdraw this application? You can re-apply later.')) {
      withdraw.mutate(applicationId)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/applications"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-ink-900"
        >
          <ArrowLeft className="size-4" aria-hidden />
          All applications
        </Link>
      </div>

      <PageHeader
        title={app.specialty}
        subtitle={`${app.hospital} · ${app.city}, ${app.state}`}
        actions={
          <div className="flex items-center gap-2">
            {canWithdraw && (
              <Button
                variant="outline"
                onClick={handleWithdraw}
                disabled={withdraw.isPending}
                className="text-ink-500 hover:text-red-700"
              >
                {withdraw.isPending ? 'Withdrawing…' : 'Withdraw application'}
              </Button>
            )}
            <ButtonLink to={`/electives/${app.electiveId}`} variant="outline">
              View elective
            </ButtonLink>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <section className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold text-ink-900">Application timeline</h2>
              <StatusBadge label={meta.label} tone={meta.tone} />
            </div>
            <p className="mt-1 text-sm text-ink-500">
              {doneCount} of {app.timeline.length} steps complete
            </p>

            <ol className="mt-6 space-y-0">
              {app.timeline.map((step, i) => {
                const last = i === app.timeline.length - 1
                return (
                  <li key={step.label} className="relative flex gap-4 pb-8 last:pb-0">
                    {!last && (
                      <span
                        className={cn(
                          'absolute left-4 top-9 h-full w-0.5 -translate-x-1/2',
                          step.done ? 'bg-brand-400' : 'bg-ink-200',
                        )}
                        aria-hidden
                      />
                    )}
                    <span
                      className={cn(
                        'grid size-8 shrink-0 place-items-center rounded-full',
                        step.done ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-400',
                      )}
                    >
                      {step.done ? <Check className="size-4" aria-hidden /> : <Clock className="size-4" aria-hidden />}
                    </span>
                    <div className="min-w-0 pt-1">
                      <p className={cn('text-sm font-semibold', step.done ? 'text-ink-900' : 'text-ink-500')}>
                        {step.label}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-400">{formatDate(step.date)}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold text-ink-900">Application details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <DetailRow icon={ClipboardList} label="Application ID" value={app.id} mono />
              <DetailRow
                icon={CalendarDays}
                label="Rotation dates"
                value={`Starts ${formatDate(app.startDate)} · ${app.durationWeeks} weeks`}
              />
              <DetailRow icon={CheckCircle2} label="Submitted" value={formatDate(app.submittedAt)} />
              <DetailRow
                icon={FileText}
                label="Documents included"
                value={`${app.documentsIncluded.length} documents`}
              />
            </dl>
          </section>

          <section className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold text-ink-900">Documents included</h2>
            <ul className="mt-4 space-y-2">
              {app.documentsIncluded.map(doc => (
                <li
                  key={doc}
                  className="flex items-center gap-2.5 rounded-xl border border-ink-100 bg-ink-50/50 px-4 py-2.5 text-sm text-ink-700"
                >
                  <FileText className="size-4 shrink-0 text-ink-400" aria-hidden />
                  {doc}
                </li>
              ))}
            </ul>
            <ButtonLink to="/documents" variant="outline" size="sm" className="mt-4 w-full">
              Manage documents
            </ButtonLink>
          </section>
        </div>
      </div>
    </div>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: typeof ClipboardList
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="size-4 shrink-0 text-ink-400" aria-hidden />
      <dt className="text-ink-500">{label}</dt>
      <dd className={cn('ml-auto text-right font-semibold text-ink-900', mono && 'font-mono text-xs')}>
        {value}
      </dd>
    </div>
  )
}

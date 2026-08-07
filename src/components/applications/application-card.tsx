import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, Check, Clock, FileText } from 'lucide-react'
import type { Application } from '@/mocks/applications'
import { applicationStatusMeta, StatusBadge } from '@/components/ui/status-badge'
import { formatDate } from '@/components/electives/elective-card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ApplicationCard({
  app,
  onWithdraw,
  withdrawPending,
}: {
  app: Application
  onWithdraw?: () => void
  withdrawPending?: boolean
}) {
  const meta = applicationStatusMeta(app.status)
  const canWithdraw = !['withdrawn', 'rejected', 'confirmed'].includes(app.status)
  const doneCount = app.timeline.filter(t => t.done).length

  return (
    <div className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-bold text-ink-900">{app.specialty}</h3>
            <StatusBadge label={meta.label} tone={meta.tone} />
          </div>
          <p className="mt-0.5 text-sm text-ink-600">
            {app.hospital} · {app.city}, {app.state}
          </p>
        </div>
        <span className="text-xs text-ink-500">ID {app.id}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-700">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-4 text-ink-400" aria-hidden />
          Starts {formatDate(app.startDate)} · {app.durationWeeks} weeks
        </span>
        <span className="inline-flex items-center gap-1.5">
          <FileText className="size-4 text-ink-400" aria-hidden />
          {app.documentsIncluded.length} documents attached
        </span>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Application timeline
          </span>
          <span className="text-xs font-medium text-ink-500">
            {doneCount} of {app.timeline.length} complete
          </span>
        </div>
        <ol className="mt-3 flex items-start">
          {app.timeline.map((step, i) => (
            <li key={step.label} className={cn('flex-1', i > 0 && 'relative')}>
              <div className="flex items-center">
                {i > 0 && (
                  <span
                    className={cn(
                      'h-0.5 flex-1 rounded',
                      step.done ? 'bg-brand-500' : 'bg-ink-200',
                    )}
                  />
                )}
                <span
                  className={cn(
                    'grid size-6 shrink-0 place-items-center rounded-full',
                    step.done ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-400',
                  )}
                >
                  {step.done ? <Check className="size-3.5" aria-hidden /> : <Clock className="size-3" aria-hidden />}
                </span>
                {i < app.timeline.length - 1 && (
                  <span
                    className={cn(
                      'h-0.5 flex-1 rounded',
                      app.timeline[i + 1].done ? 'bg-brand-500' : 'bg-ink-200',
                    )}
                  />
                )}
              </div>
              <div className="mt-2 pr-2">
                <p className={cn('text-xs font-semibold', step.done ? 'text-ink-800' : 'text-ink-400')}>
                  {step.label}
                </p>
                <p className="mt-0.5 text-[11px] text-ink-400">{formatDate(step.date)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4">
        <Link
          to={`/electives/${app.electiveId}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          View elective <ArrowRight className="size-4" aria-hidden />
        </Link>
        {canWithdraw && onWithdraw && (
          <Button
            variant="ghost"
            size="sm"
            disabled={withdrawPending}
            onClick={onWithdraw}
            className="text-ink-500 hover:text-red-700"
          >
            {withdrawPending ? 'Withdrawing…' : 'Withdraw application'}
          </Button>
        )}
      </div>
    </div>
  )
}

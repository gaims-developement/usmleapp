import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
} from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { StatusBadge, reviewerAppStatusMeta } from '@/components/ui/status-badge'
import { formatDate } from '@/lib/utils'
import type { ReviewerApplication } from '@/mocks/reviewer/applications'

export function ReviewerQueueList({
  data,
  pageSize = 6,
  onReview,
}: {
  data: ReviewerApplication[]
  pageSize?: number
  onReview?: (applicationId: string) => void
}) {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)

  const pageCount = useMemo(() => Math.max(1, Math.ceil(data.length / pageSize)), [data.length, pageSize])
  const safePage = Math.min(page, pageCount - 1)
  const rows = data.slice(safePage * pageSize, safePage * pageSize + pageSize)

  const open = (id: string) => navigate(`/dashboard/reviewer/applications/${id}`)
  const review = (id: string) => (onReview ? onReview(id) : open(id))

  return (
    <div className="flex flex-col">
      <div className="overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-soft">
        <ul className="divide-y divide-ink-100">
          {rows.map(a => {
            const status = reviewerAppStatusMeta(a.status)
            return (
              <li key={a.id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => open(a.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      open(a.id)
                    }
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-ink-50/70 focus-visible:bg-ink-50/70 focus-visible:outline-none"
                >
                  <Avatar name={a.student.name} className="size-9" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-ink-900">{a.student.name}</p>
                      <span className="shrink-0 text-xs font-medium text-ink-400">{a.id}</span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-500">
                      <span className="inline-flex min-w-0 items-center gap-1">
                        <Building2 className="size-3.5 shrink-0 text-ink-400" aria-hidden />
                        <span className="truncate">{a.hospital}</span>
                      </span>
                      <span className="hidden min-w-0 items-center gap-1 sm:inline-flex">
                        <Stethoscope className="size-3.5 shrink-0 text-ink-400" aria-hidden />
                        <span className="truncate">{a.specialty}</span>
                      </span>
                      <span className="hidden min-w-0 items-center gap-1 md:inline-flex">
                        <CalendarDays className="size-3.5 shrink-0 text-ink-400" aria-hidden />
                        {formatDate(a.submittedAt)}
                      </span>
                    </div>
                  </div>
                  {a.status === 'approved' && (
                    <span
                      className="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600"
                      title="Approved"
                    >
                      <CheckCircle2 className="size-4" aria-hidden />
                    </span>
                  )}
                  <StatusBadge label={status.label} tone={status.tone} className="hidden sm:inline-flex" />
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation()
                      review(a.id)
                    }}
                    aria-label={`Review ${a.student.name}`}
                    title="Open review"
                    className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full border border-ink-200 text-ink-600 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
                  >
                    <ArrowRight className="size-4" aria-hidden />
                  </button>
                </div>
              </li>
            )
          })}
          {rows.length === 0 && (
            <li className="px-5 py-12 text-center">
              <p className="font-display text-sm font-bold text-ink-800">No applications in this view</p>
              <p className="mt-1 text-sm text-ink-500">Applications assigned to you will appear here.</p>
            </li>
          )}
        </ul>
      </div>
      {data.length > pageSize && (
        <div className="flex items-center justify-between gap-3 px-2 py-4">
          <p className="text-sm text-ink-500">
            Showing{' '}
            <span className="font-semibold text-ink-800">
              {safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, data.length)}
            </span>{' '}
            of {data.length}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage === 0}
              onClick={() => setPage(p => Math.max(0, p - 1))}
              className="grid size-8 cursor-pointer place-items-center rounded-xl border border-ink-200 text-ink-600 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <span className="px-2 text-sm font-semibold text-ink-700">
              {safePage + 1} / {pageCount}
            </span>
            <button
              type="button"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
              className="grid size-8 cursor-pointer place-items-center rounded-xl border border-ink-200 text-ink-600 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

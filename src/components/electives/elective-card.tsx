import { Link } from 'react-router-dom'
import { ArrowRight, Clock, DollarSign, MapPin, Star } from 'lucide-react'
import type { Elective } from '@/lib/types'
import { StatusBadge } from '@/components/ui/status-badge'

export function formatDate(iso?: string | null) {
  if (!iso) return '—'
  const date = new Date(iso + 'T00:00:00')
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function ElectiveCard({ elective }: { elective: Elective }) {
  const earliest = elective.startDates[0]
  const hasRating = typeof elective.rating === 'number'
  const durationLabel = elective.durationWeeks.length ? `${elective.durationWeeks.join(' / ')} weeks` : '—'
  return (
    <Link
      to={`/electives/${elective.id}`}
      className="group flex flex-col rounded-3xl border border-ink-200 bg-white p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold text-ink-900 group-hover:text-brand-800">
            {elective.specialty}
          </h3>
          <p className="mt-0.5 truncate text-sm text-ink-600">{elective.hospital}</p>
        </div>
        {hasRating && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
            <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
            {elective.rating!.toFixed(1)}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-ink-600">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="size-4 text-ink-400" aria-hidden />
          {elective.city}, {elective.state}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-4 text-ink-400" aria-hidden />
          {durationLabel}
        </span>
        <span className="inline-flex items-center gap-1.5 font-medium text-ink-800">
          <DollarSign className="size-4 text-ink-400" aria-hidden />
          ${elective.fee.toLocaleString()}
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-ink-100 pt-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-ink-500">Earliest start</span>
          <span className="text-sm font-semibold text-ink-800">{formatDate(earliest)}</span>
        </div>
        <StatusBadge
          label={elective.spots <= 4 ? `${elective.spots} spots left` : `${elective.spots} spots`}
          tone={elective.spots <= 4 ? 'amber' : 'brand'}
        />
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 transition-transform group-hover:translate-x-0.5">
          View <ArrowRight className="size-4" aria-hidden />
        </span>
      </div>
    </Link>
  )
}

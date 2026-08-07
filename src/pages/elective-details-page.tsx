import { Link, useNavigate, useParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  Clock,
  DollarSign,
  MapPin,
  ShieldCheck,
  Star,
} from 'lucide-react'
import { useApplications, useElective } from '@/lib/queries'
import { PageLoader } from '@/components/ui/spinner'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button, ButtonLink } from '@/components/ui/button'
import { formatDate } from '@/components/electives/elective-card'

export function ElectiveDetailsPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data: elective, isPending } = useElective(id)
  const { data: applications } = useApplications()

  if (isPending) return <PageLoader label="Loading elective…" />

  if (!elective) {
    return (
      <div className="py-24 text-center">
        <p className="text-lg font-semibold text-ink-900">Elective not found</p>
        <Link to="/electives" className="mt-2 inline-block text-sm font-semibold text-brand-700">
          Back to browse electives
        </Link>
      </div>
    )
  }

  const alreadyApplied = (applications ?? []).some(
    a => a.electiveId === elective.id && !['withdrawn', 'rejected'].includes(a.status),
  )

  return (
    <div className="space-y-6">
      <Link
        to="/electives"
        className="inline-flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-ink-900"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to electives
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-ink-900">{elective.specialty}</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
              <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
              {elective.rating.toFixed(1)}
            </span>
            <StatusBadge
              label={elective.spots <= 4 ? `${elective.spots} spots left` : `${elective.spots} spots available`}
              tone={elective.spots <= 4 ? 'amber' : 'brand'}
            />
            <StatusBadge label={elective.teachingType} tone="sky" />
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-600">
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="size-4 text-ink-400" aria-hidden />
              {elective.hospital}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4 text-ink-400" aria-hidden />
              {elective.city}, {elective.state}
            </span>
          </p>
        </div>
        <div className="flex gap-3">
          {alreadyApplied ? (
            <ButtonLink to="/applications" variant="outline" className="flex-1 sm:flex-none">
              View application
            </ButtonLink>
          ) : (
            <Button
              onClick={() => navigate(`/apply/${elective.id}`)}
              size="lg"
              className="flex-1 sm:flex-none"
            >
              Apply now <ArrowRight className="size-4" aria-hidden />
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold text-ink-900">About this rotation</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-700">{elective.description}</p>

            <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-ink-400">Highlights</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {elective.highlights.map(h => (
                <li key={h} className="flex items-start gap-2 text-sm text-ink-700">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                  {h}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900">
              <ShieldCheck className="size-5 text-brand-600" aria-hidden />
              Requirements
            </h2>
            <ul className="mt-3 space-y-2">
              {elective.requirements.map(r => (
                <li key={r} className="flex items-start gap-2 text-sm text-ink-700">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                  {r}
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-xl bg-ink-50 px-4 py-3 text-xs text-ink-600">
              Eligibility: <span className="font-semibold text-ink-800">{elective.eligibility}</span>
            </p>
          </div>

          <div className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold text-ink-900">Available start dates</h2>
            <p className="mt-1 text-xs text-ink-500">Select a date to begin your application.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {elective.startDates.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => navigate(`/apply/${elective.id}?start=${d}`)}
                  className="flex cursor-pointer flex-col items-start gap-1 rounded-xl border border-ink-200 bg-white px-4 py-3 text-left transition-colors hover:border-brand-500 hover:bg-brand-50/40"
                >
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-ink-800">
                    <CalendarDays className="size-4 text-ink-400" aria-hidden />
                    {formatDate(d)}
                  </span>
                  <span className="text-xs text-ink-500">
                    {elective.durationWeeks.map((w, i) => (
                      <span key={w}>
                        {i > 0 && ' · '}
                        {w}w
                      </span>
                    ))}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold text-ink-900">Program details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <FactRow
                icon={<Clock className="size-4 text-ink-400" aria-hidden />}
                label="Duration"
                value={`${elective.durationWeeks.join(' or ')} weeks`}
              />
              <FactRow
                icon={<DollarSign className="size-4 text-ink-400" aria-hidden />}
                label="Program fee"
                value={`$${elective.fee.toLocaleString()} / rotation`}
              />
              <FactRow
                icon={<CalendarDays className="size-4 text-ink-400" aria-hidden />}
                label="Application deadline"
                value={formatDate(elective.applicationDeadline)}
              />
              <FactRow
                icon={<Building2 className="size-4 text-ink-400" aria-hidden />}
                label="Teaching format"
                value={elective.teachingType}
              />
            </dl>
          </div>

          <div className="rounded-3xl bg-brand-600 p-6 text-white shadow-glow">
            <h2 className="font-display text-lg font-bold">Ready to apply?</h2>
            <p className="mt-1 text-sm text-brand-50">
              {alreadyApplied
                ? 'You already have an active application for this rotation.'
                : `Secure your ${elective.durationWeeks[0]}-week rotation with a quick, guided application.`}
            </p>
            {alreadyApplied ? (
              <ButtonLink to="/applications" variant="white" className="mt-4 w-full">
                Track application status
              </ButtonLink>
            ) : (
              <Button
                onClick={() => navigate(`/apply/${elective.id}`)}
                variant="white"
                className="mt-4 w-full"
              >
                Apply now <ArrowRight className="size-4" aria-hidden />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function FactRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="inline-flex items-center gap-2 text-ink-500">
        {icon}
        {label}
      </span>
      <span className="font-semibold text-ink-900">{value}</span>
    </div>
  )
}

import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileText,
  FolderOpen,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useApplications, useDocuments, useElectives } from '@/lib/queries'
import { PageLoader } from '@/components/ui/spinner'
import { ElectiveCard } from '@/components/electives/elective-card'
import { applicationStatusMeta, StatusBadge } from '@/components/ui/status-badge'
import { formatDate } from '@/components/electives/elective-card'
import { ButtonLink } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const activeStatuses = ['submitted', 'under_review', 'additional_info', 'offered']

export function DashboardPage() {
  const { user } = useAuth()
  const electives = useElectives({ sort: 'rating' })
  const apps = useApplications()
  const docs = useDocuments()

  const loading = electives.isPending || apps.isPending || docs.isPending

  if (loading) return <PageLoader label="Loading your dashboard…" />

  const applications = apps.data ?? []
  const documents = docs.data ?? []
  const active = applications.filter(a => activeStatuses.includes(a.status))
  const confirmed = applications.filter(a => a.status === 'confirmed')
  const docsReady = documents.filter(d => d.status === 'uploaded' || d.status === 'expiring').length
  const requiredDocs = documents.filter(d => d.required).length

  const firstInitial = user?.name?.[0] ?? 'I'

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-700">Good to see you, Dr. {firstInitial}</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink-900">
            Residency journey overview
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Track your rotations, documents, and applications in one place.
          </p>
        </div>
        <ButtonLink to="/electives">Browse electives</ButtonLink>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={ClipboardList} label="Active applications" value={active.length} />
        <StatCard icon={CheckCircle2} label="Confirmed rotations" value={confirmed.length} tone="brand" />
        <StatCard icon={FileText} label="Documents ready" value={`${docsReady}/${requiredDocs}`} tone="accent" />
        <StatCard icon={Sparkles} label="Applications submitted" value={applications.length} tone="violet" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <SectionHeading
            title="Recommended for you"
            subtitle="Top-rated electives based on your profile"
            action={{ to: '/electives', label: 'Browse all' }}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {(electives.data ?? []).slice(0, 4).map(e => (
              <ElectiveCard key={e.id} elective={e} />
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
            <SectionHeading title="Next steps" subtitle="Keep your journey moving" />
            <ol className="mt-4 space-y-3">
              <CheckStep done={true} label="Complete onboarding" />
              <CheckStep
                done={docsReady === requiredDocs}
                label="Upload required documents"
                detail={docsReady < requiredDocs ? `${requiredDocs - docsReady} remaining` : undefined}
              />
              <CheckStep done={applications.length > 0} label="Apply to your first elective" />
              <CheckStep done={confirmed.length > 0} label="Confirm a rotation" />
            </ol>
            <ButtonLink to="/documents" variant="outline" size="sm" className="mt-5 w-full">
              Manage documents
            </ButtonLink>
          </div>

          <div className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
            <SectionHeading title="Application snapshot" subtitle="Your latest statuses" />
            <ul className="mt-4 space-y-3">
              {applications.slice(0, 3).map(app => {
                const meta = applicationStatusMeta(app.status)
                return (
                  <li key={app.id}>
                    <Link
                      to="/applications"
                      className="flex items-center justify-between gap-3 rounded-xl border border-ink-100 px-4 py-3 transition-colors hover:border-brand-300 hover:bg-brand-50/40"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-ink-900">
                          {app.specialty}
                        </span>
                        <span className="block truncate text-xs text-ink-500">
                          {app.hospital} · starts {formatDate(app.startDate)}
                        </span>
                      </span>
                      <StatusBadge label={meta.label} tone={meta.tone} className="shrink-0" />
                    </Link>
                  </li>
                )
              })}
              {applications.length === 0 && (
                <li className="rounded-xl border border-dashed border-ink-200 px-4 py-6 text-center text-sm text-ink-500">
                  No applications yet —{' '}
                  <Link to="/electives" className="font-semibold text-brand-700">
                    find an elective
                  </Link>
                </li>
              )}
            </ul>
            <ButtonLink to="/applications" variant="ghost" size="sm" className="mt-4 w-full">
              View all applications
            </ButtonLink>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-ink-900 p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 font-display text-lg font-bold">
              <Building2 className="size-5 text-brand-400" aria-hidden />
              Residency preparation checklist
            </h3>
            <p className="mt-1 text-sm text-ink-300">
              Prepare a strong ERAS application: secure U.S. LoRs, refine your personal statement,
              and complete your profile early.
            </p>
          </div>
          <Link
            to="/planner"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/20"
          >
            <FolderOpen className="size-4 text-brand-400" aria-hidden />
            Open study planner
          </Link>
        </div>
      </div>
    </div>
  )
}

function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: { to: string; label: string }
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <div>
        <h2 className="font-display text-lg font-bold text-ink-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-ink-500">{subtitle}</p>}
      </div>
      {action && (
        <Link
          to={action.to}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          {action.label} <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone = 'neutral',
}: {
  icon: typeof ClipboardList
  label: string
  value: number | string
  tone?: 'neutral' | 'brand' | 'accent' | 'violet'
}) {
  const tones = {
    neutral: 'bg-ink-100 text-ink-700',
    brand: 'bg-brand-100 text-brand-700',
    accent: 'bg-accent-100 text-accent-700',
    violet: 'bg-violet-100 text-violet-700',
  }
  return (
    <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
      <span className={cn('grid size-10 place-items-center rounded-xl', tones[tone])}>
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="mt-3 font-display text-2xl font-bold text-ink-900">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-ink-500">{label}</p>
    </div>
  )
}

function CheckStep({
  done,
  label,
  detail,
}: {
  done: boolean
  label: string
  detail?: string
}) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={cn(
          'grid size-6 shrink-0 place-items-center rounded-full',
          done ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-400',
        )}
      >
        {done ? <CheckCircle2 className="size-4" aria-hidden /> : <span className="size-2 rounded-full bg-ink-300" />}
      </span>
      <div className="min-w-0">
        <p className={cn('text-sm font-semibold', done ? 'text-ink-800' : 'text-ink-600')}>{label}</p>
        {detail && <p className="text-xs text-amber-600">{detail}</p>}
      </div>
    </li>
  )
}

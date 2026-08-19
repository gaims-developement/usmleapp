import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileCheck2,
  FileWarning,
  FolderOpen,
  MessageSquare,
  Send,
  Timer,
  XCircle,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { KpiCard } from '@/components/ui/kpi-card'
import { PageLoader } from '@/components/ui/spinner'
import { StatusBadge, reviewerAppStatusMeta } from '@/components/ui/status-badge'
import { Avatar } from '@/components/ui/avatar'
import { ReviewerQueueList } from '@/components/reviewer/queue-list'
import { useReviewerApplications } from '@/lib/reviewerQueries'
import { formatDate } from '@/lib/utils'

const today = () => new Date().toISOString().slice(0, 10)

export function ReviewerOverviewPage() {
  const { user, logout } = useAuth()
  const reviewerStatus = user?.reviewer?.status

  if (reviewerStatus !== 'active') {
    return (
      <div>
        <PageHeader title="Reviewer Dashboard" subtitle="Your account is pending hospital approval." />
        <div className="mt-8 mx-auto max-w-lg">
          <div className="rounded-3xl border border-amber-200 bg-white p-8 shadow-soft text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-100 text-amber-600">
              <Clock className="size-7" aria-hidden />
            </span>
            <h2 className="mt-4 font-display text-xl font-bold text-ink-900">
              Account Awaiting Hospital Approval
            </h2>
            <p className="mt-2 text-sm text-ink-600 leading-relaxed">
              Your reviewer account has been created and is pending approval from your associated hospital.
              You will be notified once the hospital reviews your registration.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Status: {reviewerStatus === 'pending' ? 'Awaiting Approval' : reviewerStatus ?? 'Unknown'}
            </div>
            <p className="mt-4 text-xs text-ink-500">
              Please check your notifications for updates.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const applications = useReviewerApplications()
  const navigate = useNavigate()

  const hospitalName = user?.reviewer?.hospitalName ?? null

  const stats = useMemo(() => {
    const all = applications.data ?? []
    const pending = all.filter(a => a.status === 'submitted' || a.status === 'under_review')
    const reviewedToday = all.filter(a => a.reviewedAt === today())
    const awaiting = all.filter(a => a.documents.some(d => d.verification === 'requires_update' || d.verification === 'rejected'))
    const forwarded = all.filter(a => a.status === 'forwarded')
    const rejectedToday = all.filter(a => a.status === 'rejected' && a.reviewedAt === today())
    const decided = all.filter(a => a.reviewMinutes !== undefined)
    const avgMin = decided.length
      ? Math.round(decided.reduce((sum, a) => sum + (a.reviewMinutes ?? 0), 0) / decided.length)
      : 0
    return { pending, reviewedToday, awaiting, forwarded, rejectedToday, avgMin }
  }, [applications.data])

  if (applications.isLoading) return <PageLoader label="Loading your review queue…" />

  const all = applications.data ?? []
  const nextPending = all.find(a => a.status === 'submitted' || a.status === 'under_review')
  const awaitingList = stats.awaiting.slice(0, 4)
  const recentDecisions = all
    .filter(a => a.reviewedAt && (a.status === 'approved' || a.status === 'rejected' || a.status === 'forwarded'))
    .sort((a, b) => (b.reviewedAt ?? '').localeCompare(a.reviewedAt ?? ''))
    .slice(0, 4)

  return (
    <div>
      <PageHeader
        title="Reviewer Dashboard"
        subtitle={
          hospitalName
            ? `Welcome back, ${user?.name ?? 'Reviewer'}. You're affiliated with ${hospitalName}.`
            : "Today's workload — review, verify, and decide."
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {hospitalName && (
              <span className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700">
                <Building2 className="size-4 text-brand-600" aria-hidden />
                {hospitalName}
              </span>
            )}
            <Link
              to="/dashboard/reviewer/documents"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-brand-700"
            >
              <FileCheck2 className="size-4" aria-hidden />
              Verify documents
            </Link>
          </div>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          label="Pending Reviews"
          value={String(stats.pending.length)}
          icon={ClipboardList}
          delta="Needs attention"
          deltaTone="down"
          hint="Submitted + under review"
        />
        <KpiCard
          label="Applications Reviewed Today"
          value={String(stats.reviewedToday.length)}
          icon={CheckCircle2}
          delta="Today"
          hint="Your daily target is 8"
        />
        <KpiCard
          label="Average Review Time"
          value={stats.avgMin ? `${stats.avgMin} min` : '—'}
          icon={Timer}
          delta={stats.avgMin ? `${stats.avgMin}m avg` : '—'}
          hint="Across decided applications"
        />
        <KpiCard
          label="Applications Awaiting Documents"
          value={String(stats.awaiting.length)}
          icon={FileWarning}
          delta="Action required"
          deltaTone="down"
          hint="Blocked on student resubmission"
        />
        <KpiCard
          label="Forwarded to Hospital"
          value={String(stats.forwarded.length)}
          icon={Send}
          delta="All time"
          deltaTone="up"
          hint="Sent for seat confirmation"
        />
        <KpiCard
          label="Rejected Today"
          value={String(stats.rejectedToday.length)}
          icon={XCircle}
          delta="Today"
          deltaTone="neutral"
          hint="Applications closed"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-ink-900">My Review Queue</h2>
              <p className="text-sm text-ink-500">{all.length} applications assigned to you.</p>
            </div>
            <Link
              to="/dashboard/reviewer/applications"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-900"
            >
              View all
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <ReviewerQueueList data={all} pageSize={6} />
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
            <div className="flex items-center gap-2">
              <FolderOpen className="size-4.5 text-amber-600" aria-hidden />
              <h3 className="font-display text-sm font-bold text-ink-900">Awaiting documents</h3>
            </div>
            <p className="mt-1 text-xs text-ink-500">{stats.awaiting.length} applications blocked on student documents</p>
            <div className="mt-4 space-y-3">
              {awaitingList.map(a => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => navigate(`/dashboard/reviewer/applications/${a.id}`)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-ink-100 p-3 text-left transition-colors hover:border-amber-300 hover:bg-amber-50/40"
                >
                  <Avatar name={a.student.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-900">{a.student.name}</p>
                    <p className="text-xs text-ink-500">
                      {a.id} · {a.hospital}
                    </p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-ink-300" aria-hidden />
                </button>
              ))}
              {awaitingList.length === 0 && (
                <p className="text-sm text-ink-400">No applications are waiting on documents.</p>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4.5 text-brand-600" aria-hidden />
              <h3 className="font-display text-sm font-bold text-ink-900">Recent decisions</h3>
            </div>
            <div className="mt-4 space-y-3">
              {recentDecisions.map(a => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => navigate(`/dashboard/reviewer/applications/${a.id}`)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-ink-100 p-3 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-900">{a.student.name}</p>
                    <p className="text-xs text-ink-500">{a.id} · {a.reviewedAt ? formatDate(a.reviewedAt) : ''}</p>
                  </div>
                  <StatusBadge label={reviewerAppStatusMeta(a.status).label} tone={reviewerAppStatusMeta(a.status).tone} />
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
            <h3 className="font-display text-sm font-bold text-ink-900">Quick actions</h3>
            <div className="mt-4 space-y-2">
              <button
                type="button"
                disabled={!nextPending}
                onClick={() => navigate(`/dashboard/reviewer/applications/${nextPending!.id}`)}
                className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-ink-200 px-4 py-3 text-left text-sm font-semibold text-ink-800 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ClipboardList className="size-4.5 text-brand-600" aria-hidden />
                Review next pending
              </button>
              <Link
                to="/dashboard/reviewer/documents"
                className="flex items-center gap-3 rounded-2xl border border-ink-200 px-4 py-3 text-sm font-semibold text-ink-800 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
              >
                <FileCheck2 className="size-4.5 text-amber-600" aria-hidden />
                Verify documents
              </Link>
              <Link
                to="/dashboard/reviewer/messages"
                className="flex items-center gap-3 rounded-2xl border border-ink-200 px-4 py-3 text-sm font-semibold text-ink-800 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
              >
                <MessageSquare className="size-4.5 text-sky-600" aria-hidden />
                Open messages
              </Link>
              <Link
                to="/dashboard/reviewer/applications"
                className="flex items-center gap-3 rounded-2xl border border-ink-200 px-4 py-3 text-sm font-semibold text-ink-800 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
              >
                <Send className="size-4.5 text-violet-600" aria-hidden />
                View all applications
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

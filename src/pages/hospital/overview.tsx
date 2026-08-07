import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Copy,
  ClipboardList,
  GraduationCap,
  Inbox,
  Megaphone,
  Plus,
  Repeat,
  Users,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { KpiCard } from '@/components/ui/kpi-card'
import { PageLoader } from '@/components/ui/spinner'
import { StatusBadge, hospitalAppStatusMeta } from '@/components/ui/status-badge'
import { Avatar } from '@/components/ui/avatar'
import { HospitalApplicationsTable } from '@/components/hospital/applications-table'
import { useHospitalApplications, useHospitalPrograms } from '@/lib/hospitalQueries'
import { formatDate } from '@/lib/utils'

export function HospitalOverviewPage() {
  const applications = useHospitalApplications()
  const programs = useHospitalPrograms()
  const navigate = useNavigate()
  const [copiedCode, setCopiedCode] = useState(false)

  const stats = useMemo(() => {
    const all = applications.data ?? []
    const awaiting = all.filter(a => a.status === 'awaiting_decision')
    const accepted = all.filter(a => a.status === 'accepted')
    const scheduled = all.filter(a => a.status === 'scheduled')
    const completed = all.filter(a => a.status === 'completed')
    const openSeats = (programs.data ?? []).reduce((sum, p) => sum + Math.max(0, p.seats - p.filled), 0)
    return { awaiting, accepted, scheduled, completed, openSeats }
  }, [applications.data, programs.data])

  if (applications.isLoading || programs.isLoading) return <PageLoader label="Loading your hospital dashboard…" />

  const all = applications.data ?? []
  const decisionQueue = stats.awaiting.slice(0, 5)
  const upcoming = stats.scheduled
    .filter(a => (a.rotationStart ?? '') >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => (a.rotationStart ?? '').localeCompare(b.rotationStart ?? ''))
    .slice(0, 5)
  const activeStudents = stats.scheduled.map(a => a.student)
  const programCapacity = (programs.data ?? [])
    .filter(p => p.status === 'published' || p.status === 'paused')
    .slice(0, 6)
  const hospitalCode = 'IMGH-1001'

  async function copyHospitalCode() {
    try {
      await navigator.clipboard.writeText(hospitalCode)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } catch {
      setCopiedCode(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Hospital Dashboard"
        subtitle="St. Mary's University Hospital — electives operations at a glance."
        actions={
          <Link
            to="/dashboard/hospital/applications"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-brand-700"
          >
            <ClipboardList className="size-4" aria-hidden />
            Review applications
          </Link>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-3xl border border-brand-200 bg-brand-50 p-5 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-brand-800">Hospital Code</p>
              <p className="mt-2 font-mono text-2xl font-bold tracking-widest text-ink-900">{hospitalCode}</p>
              <p className="mt-1 text-xs text-brand-800/70">Doctors use this code during registration.</p>
            </div>
            <button
              type="button"
              onClick={() => void copyHospitalCode()}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-brand-200 bg-white px-3 py-2 text-xs font-semibold text-brand-700 transition-colors hover:border-brand-400"
            >
              <Copy className="size-3.5" aria-hidden />
              {copiedCode ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
        <KpiCard
          label="Awaiting Decision"
          value={String(stats.awaiting.length)}
          icon={Inbox}
          delta="Needs action"
          deltaTone="down"
          hint="Applications forwarded by reviewers"
        />
        <KpiCard
          label="Accepted"
          value={String(stats.accepted.length)}
          icon={BadgeCheck}
          delta="Pending scheduling"
          hint="Awaiting doctor assignment"
        />
        <KpiCard
          label="Active Rotations"
          value={String(stats.scheduled.length)}
          icon={Repeat}
          delta="Currently running"
          deltaTone="neutral"
          hint="Students on rotation"
        />
        <KpiCard
          label="Completed Rotations"
          value={String(stats.completed.length)}
          icon={GraduationCap}
          delta="All time"
          deltaTone="up"
          hint="Evaluations submitted"
        />
        <KpiCard
          label="Current Students"
          value={String(activeStudents.length)}
          icon={Users}
          delta="Unique"
          hint="Students scheduled this term"
        />
        <KpiCard
          label="Open Program Seats"
          value={String(stats.openSeats)}
          icon={CalendarDays}
          delta="Across programs"
          hint="Seats available to fill"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-ink-900">All Applications</h2>
              <p className="text-sm text-ink-500">{all.length} applications received from the review team.</p>
            </div>
            <Link
              to="/dashboard/hospital/applications"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-900"
            >
              View all
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <HospitalApplicationsTable data={all} pageSize={6} />
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
            <div className="flex items-center gap-2">
              <Inbox className="size-4.5 text-amber-600" aria-hidden />
              <h3 className="font-display text-sm font-bold text-ink-900">Decision queue</h3>
            </div>
            <p className="mt-1 text-xs text-ink-500">{stats.awaiting.length} applications waiting for your decision</p>
            <div className="mt-4 space-y-3">
              {decisionQueue.map(a => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => navigate(`/dashboard/hospital/applications/${a.id}`)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-ink-100 p-3 text-left transition-colors hover:border-amber-300 hover:bg-amber-50/40"
                >
                  <Avatar name={a.student.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-900">{a.student.name}</p>
                    <p className="text-xs text-ink-500">{a.id} · {a.program.name}</p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-ink-300" aria-hidden />
                </button>
              ))}
              {decisionQueue.length === 0 && (
                <p className="text-sm text-ink-400">No applications awaiting a decision.</p>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4.5 text-violet-600" aria-hidden />
              <h3 className="font-display text-sm font-bold text-ink-900">Upcoming rotations</h3>
            </div>
            <div className="mt-4 space-y-3">
              {upcoming.map(a => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => navigate(`/dashboard/hospital/applications/${a.id}`)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-ink-100 p-3 text-left transition-colors hover:border-violet-300 hover:bg-violet-50/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-900">{a.student.name}</p>
                    <p className="text-xs text-ink-500">
                      {a.rotationStart ? formatDate(a.rotationStart) : ''} → {a.rotationEnd ? formatDate(a.rotationEnd) : ''}
                    </p>
                  </div>
                  <StatusBadge label={hospitalAppStatusMeta(a.status).label} tone={hospitalAppStatusMeta(a.status).tone} />
                </button>
              ))}
              {upcoming.length === 0 && (
                <p className="text-sm text-ink-400">No upcoming rotations scheduled.</p>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
            <h3 className="font-display text-sm font-bold text-ink-900">Program capacity</h3>
            <div className="mt-4 space-y-3">
              {programCapacity.map(p => {
                const pct = p.seats ? Math.round((p.filled / p.seats) * 100) : 0
                return (
                  <div key={p.id}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-ink-800">{p.name}</p>
                      <p className="shrink-0 text-xs text-ink-500">{p.filled}/{p.seats}</p>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-100">
                      <div
                        className={pct >= 100 ? 'h-full rounded-full bg-red-500' : 'h-full rounded-full bg-brand-500'}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
            <h3 className="font-display text-sm font-bold text-ink-900">Quick actions</h3>
            <div className="mt-4 space-y-2">
              <Link
                to="/dashboard/hospital/applications"
                className="flex items-center gap-3 rounded-2xl border border-ink-200 px-4 py-3 text-sm font-semibold text-ink-800 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
              >
                <ClipboardList className="size-4.5 text-brand-600" aria-hidden />
                Review applications
              </Link>
              <Link
                to="/dashboard/hospital/programs"
                className="flex items-center gap-3 rounded-2xl border border-ink-200 px-4 py-3 text-sm font-semibold text-ink-800 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
              >
                <Plus className="size-4.5 text-amber-600" aria-hidden />
                Manage elective programs
              </Link>
              <Link
                to="/dashboard/hospital/announcements"
                className="flex items-center gap-3 rounded-2xl border border-ink-200 px-4 py-3 text-sm font-semibold text-ink-800 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
              >
                <Megaphone className="size-4.5 text-sky-600" aria-hidden />
                Post an announcement
              </Link>
              <Link
                to="/dashboard/hospital/calendar"
                className="flex items-center gap-3 rounded-2xl border border-ink-200 px-4 py-3 text-sm font-semibold text-ink-800 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
              >
                <CalendarDays className="size-4.5 text-violet-600" aria-hidden />
                Open calendar
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

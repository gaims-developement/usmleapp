import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Award,
  CalendarDays,
  ClipboardList,
  FileSignature,
  Inbox,
  MessageSquareText,
  RotateCw,
  Stethoscope,
  Users,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { KpiCard } from '@/components/ui/kpi-card'
import { PageLoader } from '@/components/ui/spinner'
import { StatusBadge, logbookStatusMeta } from '@/components/ui/status-badge'
import { Avatar } from '@/components/ui/avatar'
import { SCHEDULE_TYPES } from '@/mocks/doctor/schedule'
import {
  useCertificates,
  useDoctorConversations,
  useDoctorStudents,
  useEvaluations,
  useLetters,
  useLogbookEntries,
  useTodaySchedule,
  useUpcomingRotationStarts,
} from '@/lib/doctorQueries'
import { formatDate } from '@/lib/utils'

export function DoctorOverviewPage() {
  const students = useDoctorStudents()
  const schedule = useTodaySchedule()
  const upcoming = useUpcomingRotationStarts()
  const logbook = useLogbookEntries()
  const evaluations = useEvaluations()
  const certificates = useCertificates()
  const letters = useLetters()
  const conversations = useDoctorConversations()
  const navigate = useNavigate()

  const stats = useMemo(() => {
    const all = students.data ?? []
    const active = all.filter(s => s.progressCount > 0).length
    const starting = all.filter(s => s.progressCount === 0).length
    const pendingLogbook = (logbook.data ?? []).filter(e => e.status === 'pending').length
    const pendingEvals = (evaluations.data ?? []).filter(e => e.status === 'draft').length
    const pendingCerts = (certificates.data ?? []).filter(c => c.certificateStatus !== 'issued').length
    const pendingLors = (letters.data ?? []).filter(l => l.status === 'draft' || l.status === 'pending_review').length
    const unreadMessages = (conversations.data ?? []).reduce((sum, c) => sum + c.unread, 0)
    return { active, starting, pendingLogbook, pendingEvals, pendingCerts, pendingLors, unreadMessages }
  }, [students.data, logbook.data, evaluations.data, certificates.data, letters.data, conversations.data])

  const loading =
    students.isLoading || schedule.isLoading || upcoming.isLoading || logbook.isLoading ||
    evaluations.isLoading || certificates.isLoading || letters.isLoading || conversations.isLoading

  if (loading) return <PageLoader label="Loading your doctor dashboard…" />

  const pendingEntries = (logbook.data ?? []).filter(e => e.status === 'pending').slice(0, 5)
  const unreadConversations = (conversations.data ?? []).filter(c => c.unread > 0)

  return (
    <div>
      <PageHeader
        title="Doctor Dashboard"
        subtitle="Welcome back, Dr. Alan Cross. Here's what needs your attention today."
        actions={
          <Link
            to="/dashboard/doctor/logbooks"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-brand-700"
          >
            <ClipboardList className="size-4" aria-hidden />
            Review logbook entries
          </Link>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          label="Students Assigned"
          value={String(students.data?.length ?? 0)}
          icon={Users}
          delta={`${stats.active} active`}
          deltaTone="up"
          hint="Under your supervision"
        />
        <KpiCard
          label="Starting Soon"
          value={String(stats.starting)}
          icon={RotateCw}
          delta="Nov 2 cohort"
          hint="Rotations begin this cycle"
        />
        <KpiCard
          label="Logbook Entries Pending"
          value={String(stats.pendingLogbook)}
          icon={ClipboardList}
          delta="Needs review"
          deltaTone="down"
          hint="Awaiting your verification"
        />
        <KpiCard
          label="Evaluations Pending"
          value={String(stats.pendingEvals)}
          icon={Stethoscope}
          delta="Draft"
          hint="Mid-rotation evaluations"
        />
        <KpiCard
          label="Certificates Pending"
          value={String(stats.pendingCerts)}
          icon={Award}
          delta="In progress"
          hint="Not yet issued"
        />
        <KpiCard
          label="LoRs Pending"
          value={String(stats.pendingLors)}
          icon={FileSignature}
          delta="Draft / review"
          hint="Letters of recommendation"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-ink-900">Today's Schedule</h2>
              <p className="text-sm text-ink-500">Your sessions for today, in chronological order.</p>
            </div>
            <Link
              to="/dashboard/doctor/schedule"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-900"
            >
              View schedule
              <CalendarDays className="size-4" aria-hidden />
            </Link>
          </div>

          <div className="space-y-3">
            {(schedule.data ?? []).map(item => {
              const attendees = (item.studentIds ?? []).map(id => (students.data ?? []).find(s => s.id === id)).filter(Boolean)
              return (
                <div
                  key={`${item.time}-${item.title}`}
                  className="flex items-start gap-4 rounded-3xl border border-ink-200 bg-white p-4 shadow-soft"
                >
                  <div className="w-14 shrink-0 pt-1 text-sm font-bold text-ink-900">{item.time}</div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm font-bold text-ink-900">{item.title}</p>
                    <p className="mt-0.5 text-xs text-ink-500">{SCHEDULE_TYPES[item.type]} · {item.location}</p>
                    {attendees.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-ink-400">Students:</span>
                        {attendees.map(s => (
                          <span key={s!.id} className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2 py-0.5 text-xs font-semibold text-ink-700">
                            <Avatar name={s!.name} className="size-4 text-[8px]" />
                            {s!.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <StatusBadge
                    label={SCHEDULE_TYPES[item.type]}
                    tone={
                      item.type === 'ward_round' ? 'brand' :
                      item.type === 'clinical_skills' ? 'sky' :
                      item.type === 'evaluation' || item.type === 'feedback' ? 'amber' :
                      item.type === 'meeting' ? 'violet' : 'neutral'
                    }
                    className="hidden sm:inline-flex"
                  />
                </div>
              )
            })}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
            <div className="flex items-center gap-2">
              <Inbox className="size-4.5 text-amber-600" aria-hidden />
              <h3 className="font-display text-sm font-bold text-ink-900">Upcoming rotation starts</h3>
            </div>
            <p className="mt-1 text-xs text-ink-500">{stats.starting} students begin on Nov 2</p>
            <div className="mt-4 space-y-3">
              {(upcoming.data ?? []).map(u => (
                <button
                  key={u.student.id}
                  type="button"
                  onClick={() => navigate(`/dashboard/doctor/students/${u.student.id}`)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-ink-100 p-3 text-left transition-colors hover:border-violet-300 hover:bg-violet-50/40"
                >
                  <Avatar name={u.student.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-900">{u.student.name}</p>
                    <p className="text-xs text-ink-500">{u.student.country} · Starts {formatDate(u.date)}</p>
                  </div>
                  <RotateCw className="size-4 shrink-0 text-violet-400" aria-hidden />
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
            <div className="flex items-center gap-2">
              <ClipboardList className="size-4.5 text-sky-600" aria-hidden />
              <h3 className="font-display text-sm font-bold text-ink-900">Logbook review queue</h3>
            </div>
            <div className="mt-4 space-y-3">
              {pendingEntries.map(entry => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => navigate('/dashboard/doctor/logbooks')}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-ink-100 p-3 text-left transition-colors hover:border-sky-300 hover:bg-sky-50/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-900">{entry.student.name}</p>
                    <p className="truncate text-xs text-ink-500">{entry.id} · {formatDate(entry.date)}</p>
                  </div>
                  <StatusBadge label={logbookStatusMeta(entry.status).label} tone={logbookStatusMeta(entry.status).tone} />
                </button>
              ))}
              {pendingEntries.length === 0 && (
                <p className="text-sm text-ink-400">No logbook entries awaiting review.</p>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
            <div className="flex items-center gap-2">
              <MessageSquareText className="size-4.5 text-brand-600" aria-hidden />
              <h3 className="font-display text-sm font-bold text-ink-900">Messages</h3>
              {stats.unreadMessages > 0 && (
                <span className="grid min-w-4.5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {stats.unreadMessages}
                </span>
              )}
            </div>
            <div className="mt-4 space-y-3">
              {unreadConversations.length > 0 ? (
                unreadConversations.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => navigate('/dashboard/doctor/messages')}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-ink-100 p-3 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/40"
                  >
                    <Avatar name={c.counterpartName} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink-900">{c.counterpartName}</p>
                      <p className="truncate text-xs text-ink-500">{c.lastMessage}</p>
                    </div>
                    <span className="shrink-0 text-[11px] text-ink-400">{c.lastTime}</span>
                  </button>
                ))
              ) : (
                <p className="text-sm text-ink-400">No unread messages.</p>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
            <h3 className="font-display text-sm font-bold text-ink-900">Quick actions</h3>
            <div className="mt-4 space-y-2">
              <Link
                to="/dashboard/doctor/evaluations"
                className="flex items-center gap-3 rounded-2xl border border-ink-200 px-4 py-3 text-sm font-semibold text-ink-800 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
              >
                <Stethoscope className="size-4.5 text-brand-600" aria-hidden />
                Evaluate student
              </Link>
              <Link
                to="/dashboard/doctor/logbooks"
                className="flex items-center gap-3 rounded-2xl border border-ink-200 px-4 py-3 text-sm font-semibold text-ink-800 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
              >
                <ClipboardList className="size-4.5 text-amber-600" aria-hidden />
                Verify logbook
              </Link>
              <Link
                to="/dashboard/doctor/certificates"
                className="flex items-center gap-3 rounded-2xl border border-ink-200 px-4 py-3 text-sm font-semibold text-ink-800 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
              >
                <Award className="size-4.5 text-sky-600" aria-hidden />
                Generate certificate
              </Link>
              <Link
                to="/dashboard/doctor/letters"
                className="flex items-center gap-3 rounded-2xl border border-ink-200 px-4 py-3 text-sm font-semibold text-ink-800 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
              >
                <FileSignature className="size-4.5 text-violet-600" aria-hidden />
                Write a LoR
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

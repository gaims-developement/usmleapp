import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Clock } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { PageLoader } from '@/components/ui/spinner'
import { StatusBadge } from '@/components/ui/status-badge'
import { Avatar } from '@/components/ui/avatar'
import { SCHEDULE_TYPES, type ScheduleItem } from '@/mocks/doctor/schedule'
import { useDoctorStudents, useTodaySchedule, useUpcomingRotationStarts } from '@/lib/doctorQueries'
import { formatDate } from '@/lib/utils'

const typeTone: Record<ScheduleItem['type'], 'brand' | 'sky' | 'amber' | 'violet' | 'neutral' | 'emerald'> = {
  orientation: 'neutral',
  ward_round: 'brand',
  clinical_skills: 'sky',
  evaluation: 'amber',
  feedback: 'violet',
  lecture: 'neutral',
  meeting: 'emerald',
}

export function DoctorSchedulePage() {
  const schedule = useTodaySchedule()
  const students = useDoctorStudents()
  const upcoming = useUpcomingRotationStarts()
  const [filter, setFilter] = useState<'all' | ScheduleItem['type']>('all')

  const filtered = useMemo(() => {
    const items = schedule.data ?? []
    return filter === 'all' ? items : items.filter(i => i.type === filter)
  }, [schedule.data, filter])

  if (schedule.isLoading || students.isLoading || upcoming.isLoading) {
    return <PageLoader label="Loading schedule…" />
  }

  const today = formatDate(new Date().toISOString().slice(0, 10))

  return (
    <div>
      <PageHeader
        title="Schedule"
        subtitle={`Your sessions and student touchpoints for ${today}.`}
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as 'all' | ScheduleItem['type'])}
          className="h-10 w-56 cursor-pointer rounded-xl border border-ink-300 bg-white px-3 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          aria-label="Filter by session type"
        >
          <option value="all">All session types</option>
          {Object.entries(SCHEDULE_TYPES).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <p className="text-sm text-ink-500">{filtered.length} sessions today</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="space-y-3">
            {filtered.map(item => {
              const attendees = (item.studentIds ?? [])
                .map(id => (students.data ?? []).find(s => s.id === id))
                .filter(Boolean)
              return (
                <div
                  key={`${item.time}-${item.title}`}
                  className="flex items-start gap-4 rounded-3xl border border-ink-200 bg-white p-5 shadow-soft"
                >
                  <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-ink-50 text-ink-600">
                    <Clock className="size-5" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-display text-base font-bold text-ink-900">{item.title}</p>
                      <StatusBadge label={SCHEDULE_TYPES[item.type]} tone={typeTone[item.type]} />
                    </div>
                    <p className="mt-0.5 text-sm text-ink-500">{item.time} · {item.location}</p>
                    {attendees.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-ink-400">Students:</span>
                        {attendees.map(s => (
                          <Link
                            key={s!.id}
                            to={`/dashboard/doctor/students/${s!.id}`}
                            className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-800"
                          >
                            <Avatar name={s!.name} className="size-4 text-[8px]" />
                            {s!.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <p className="rounded-3xl border border-dashed border-ink-300 bg-white/60 px-6 py-12 text-center text-sm text-ink-500">
                No sessions match this filter.
              </p>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4.5 text-violet-600" aria-hidden />
              <h3 className="font-display text-sm font-bold text-ink-900">Upcoming rotation starts</h3>
            </div>
            <div className="mt-4 space-y-3">
              {(upcoming.data ?? []).map(u => (
                <Link
                  key={u.student.id}
                  to={`/dashboard/doctor/students/${u.student.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-ink-100 p-3 transition-colors hover:border-violet-300 hover:bg-violet-50/40"
                >
                  <Avatar name={u.student.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-900">{u.student.name}</p>
                    <p className="text-xs text-ink-500">{u.student.country}</p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-ink-500">{formatDate(u.date)}</span>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

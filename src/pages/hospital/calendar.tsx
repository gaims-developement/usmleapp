import { useMemo } from 'react'
import { CalendarDays } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { PageLoader } from '@/components/ui/spinner'
import { useHospitalCalendarEvents } from '@/lib/hospitalQueries'
import { cn } from '@/lib/utils'
import type { CalendarEventKind, HospitalCalendarEvent } from '@/mocks/hospital/calendar'

const kindStyles: Record<CalendarEventKind, { label: string; className: string; dot: string }> = {
  rotation: { label: 'Rotation', className: 'bg-violet-50 text-violet-700', dot: 'bg-violet-500' },
  orientation: { label: 'Orientation', className: 'bg-sky-50 text-sky-700', dot: 'bg-sky-500' },
  meeting: { label: 'Meeting', className: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  deadline: { label: 'Deadline', className: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
  exam: { label: 'Exam', className: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
}

export function HospitalCalendarPage() {
  const events = useHospitalCalendarEvents()

  const grouped = useMemo(() => {
    const map = new Map<string, HospitalCalendarEvent[]>()
    const sorted = [...(events.data ?? [])].sort((a, b) => a.date.localeCompare(b.date))
    for (const e of sorted) {
      const key = e.date.slice(0, 7)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(e)
    }
    return map
  }, [events.data])

  if (events.isLoading) return <PageLoader label="Loading calendar…" />

  return (
    <div>
      <PageHeader
        title="Calendar"
        subtitle="Rotations, orientations, meetings, and deadlines."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Total events</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink-900">{events.data?.length ?? 0}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Rotations</p>
          <p className="mt-2 font-display text-2xl font-bold text-violet-600">
            {(events.data ?? []).filter(e => e.kind === 'rotation').length}
          </p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Meetings & orientation</p>
          <p className="mt-2 font-display text-2xl font-bold text-amber-600">
            {(events.data ?? []).filter(e => e.kind === 'meeting' || e.kind === 'orientation').length}
          </p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Deadlines</p>
          <p className="mt-2 font-display text-2xl font-bold text-red-600">
            {(events.data ?? []).filter(e => e.kind === 'deadline').length}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-8">
        {Array.from(grouped.entries()).map(([month, monthEvents]) => (
          <section key={month}>
            <h2 className="font-display text-lg font-bold text-ink-900">
              {new Date(`${month}-01T00:00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="mt-4 space-y-3">
              {monthEvents.map(e => {
                const style = kindStyles[e.kind]
                return (
                  <article
                    key={e.id}
                    className="flex flex-wrap items-center gap-4 rounded-3xl border border-ink-200 bg-white p-5 shadow-soft"
                  >
                    <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-ink-50">
                      <CalendarDays className="size-6 text-ink-600" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold', style.className)}>{style.label}</span>
                        <span className="text-sm font-semibold text-ink-900">
                          {e.date} · {e.startTime} – {e.endTime}
                        </span>
                      </div>
                      <p className="mt-1 font-display text-base font-bold text-ink-900">{e.title}</p>
                      <p className="text-sm text-ink-500">
                        {e.location}
                        {e.notes ? ` · ${e.notes}` : ''}
                      </p>
                    </div>
                    <span className={cn('hidden size-2 shrink-0 rounded-full sm:block', style.dot)} aria-hidden />
                  </article>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

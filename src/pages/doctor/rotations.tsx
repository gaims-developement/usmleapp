import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, RotateCw } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { KpiCard } from '@/components/ui/kpi-card'
import { PageLoader } from '@/components/ui/spinner'
import { Avatar } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { useDoctorStudents } from '@/lib/doctorQueries'
import type { DoctorStudent } from '@/mocks/doctor/students'
import { formatDate } from '@/lib/utils'

export function DoctorRotationsPage() {
  const students = useDoctorStudents()

  const groups = useMemo(() => {
    const all = students.data ?? []
    return {
      inProgress: all.filter(s => s.progressCount > 0),
      startingSoon: all.filter(s => s.progressCount === 0),
    }
  }, [students.data])

  if (students.isLoading) return <PageLoader label="Loading rotations…" />

  function RotationCard({ student }: { student: DoctorStudent }) {
    const active = student.progressCount > 0
    return (
      <Link
        to={`/dashboard/doctor/students/${student.id}`}
        className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft transition-shadow hover:shadow-lift"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar name={student.name} />
            <div>
              <p className="font-display text-base font-bold text-ink-900">{student.name}</p>
              <p className="text-sm text-ink-500">{student.country} · {student.medicalSchool}</p>
            </div>
          </div>
          <span
            className={
              active
                ? 'rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-800'
                : 'rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800'
            }
          >
            {active ? 'In progress' : 'Starting soon'}
          </span>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-ink-600">
          <CalendarDays className="size-4 text-ink-400" aria-hidden />
          {formatDate(student.rotationStart)} → {formatDate(student.rotationEnd)}
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-ink-500">
            <span>Rotation progress</span>
            <span className="font-semibold text-ink-700">{student.progressCount}/6 stages</span>
          </div>
          <Progress value={(student.progressCount / 6) * 100} className="mt-1.5" />
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-4 text-sm">
          <span className="text-ink-500">{student.department}</span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
            View profile
            <ArrowRight className="size-3.5" aria-hidden />
          </span>
        </div>
      </Link>
    )
  }

  return (
    <div>
      <PageHeader
        title="Current Rotations"
        subtitle="Monitor the progress of every student you supervise."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <KpiCard
          label="In Progress"
          value={String(groups.inProgress.length)}
          icon={RotateCw}
          delta="Active"
          deltaTone="up"
          hint="Students currently rotating"
        />
        <KpiCard
          label="Starting Soon"
          value={String(groups.startingSoon.length)}
          icon={CalendarDays}
          delta="Nov 2 cohort"
          deltaTone="neutral"
          hint="Orientation underway"
        />
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-bold text-ink-900">In progress</h2>
        <p className="text-sm text-ink-500">{groups.inProgress.length} students actively rotating on the ward.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groups.inProgress.map(s => <RotationCard key={s.id} student={s} />)}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-lg font-bold text-ink-900">Starting soon</h2>
        <p className="text-sm text-ink-500">{groups.startingSoon.length} students begin their rotation on Nov 2.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groups.startingSoon.map(s => <RotationCard key={s.id} student={s} />)}
        </div>
      </div>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Users } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { PageLoader } from '@/components/ui/spinner'
import { StatusBadge, evaluationStatusMeta } from '@/components/ui/status-badge'
import { Avatar } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { attendancePercentage, buildAttendance } from '@/mocks/doctor/students'
import { useDoctorStudents, useEvaluations } from '@/lib/doctorQueries'
import { formatDate } from '@/lib/utils'

interface StudentRow {
  id: string
  name: string
  country: string
  medicalSchool: string
  department: string
  rotationStart: string
  rotationEnd: string
  progressCount: number
  attendance: number
  evaluationStatus: string
}

export function DoctorStudentsPage() {
  const students = useDoctorStudents()
  const evaluations = useEvaluations()
  const [status, setStatus] = useState('all')

  const rows = useMemo<StudentRow[]>(() => {
    return (students.data ?? []).map(s => {
      const index = (students.data ?? []).findIndex(x => x.id === s.id)
      const ev = (evaluations.data ?? []).find(e => e.studentId === s.id)
      return {
        id: s.id,
        name: s.name,
        country: s.country,
        medicalSchool: s.medicalSchool,
        department: s.department,
        rotationStart: s.rotationStart,
        rotationEnd: s.rotationEnd,
        progressCount: s.progressCount,
        attendance: attendancePercentage(buildAttendance(index, 8)),
        evaluationStatus: ev?.status ?? 'draft',
      }
    })
  }, [students.data, evaluations.data])

  const filtered = useMemo(
    () => (status === 'all' ? rows : rows.filter(r => r.evaluationStatus === status)),
    [rows, status],
  )

  if (students.isLoading || evaluations.isLoading) return <PageLoader label="Loading your students…" />

  const columns: DataTableColumn<StudentRow>[] = [
    {
      key: 'student',
      header: 'Student',
      sortValue: r => r.name,
      cell: row => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} />
          <div>
            <p className="font-semibold text-ink-900">{row.name}</p>
            <p className="text-xs text-ink-500">{row.medicalSchool}</p>
          </div>
        </div>
      ),
    },
    { key: 'country', header: 'Country', sortValue: r => r.country, cell: row => <span className="text-ink-600">{row.country}</span> },
    { key: 'department', header: 'Department', sortValue: r => r.department, cell: row => <span className="text-ink-600">{row.department}</span> },
    {
      key: 'rotation',
      header: 'Rotation',
      sortValue: r => r.rotationStart,
      cell: row => (
        <div className="text-ink-600">
          <p>{formatDate(row.rotationStart)} → {formatDate(row.rotationEnd)}</p>
          <p className="text-xs text-ink-400">{row.rotationStart >= '2026-11-02' ? 'Starting soon' : 'In progress'}</p>
        </div>
      ),
    },
    {
      key: 'attendance',
      header: 'Attendance',
      sortValue: r => r.attendance,
      cell: row => (
        <div className="flex items-center gap-2">
          <Progress value={row.attendance} className="w-20" />
          <span className="text-xs font-semibold text-ink-700">{row.attendance}%</span>
        </div>
      ),
    },
    {
      key: 'progress',
      header: 'Progress',
      sortValue: r => r.progressCount,
      cell: row => (
        <div className="flex items-center gap-2">
          <Progress value={(row.progressCount / 6) * 100} className="w-20" />
          <span className="text-xs font-semibold text-ink-700">{row.progressCount}/6</span>
        </div>
      ),
    },
    {
      key: 'evaluation',
      header: 'Evaluation',
      sortValue: r => r.evaluationStatus,
      cell: row => (
        <StatusBadge
          label={evaluationStatusMeta(row.evaluationStatus).label}
          tone={evaluationStatusMeta(row.evaluationStatus).tone}
        />
      ),
    },
    {
      key: 'action',
      header: 'Action',
      cell: row => (
        <Link
          to={`/dashboard/doctor/students/${row.id}`}
          className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-700 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
        >
          View profile
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="My Students"
        subtitle="Students you currently supervise on elective rotations."
        actions={
          <Link
            to="/dashboard/doctor/rotations"
            className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
          >
            <Users className="size-4" aria-hidden />
            View rotations
          </Link>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="h-10 w-56 cursor-pointer rounded-xl border border-ink-300 bg-white px-3 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          aria-label="Filter by evaluation status"
        >
          <option value="all">All evaluation statuses</option>
          <option value="completed">Completed</option>
          <option value="draft">Draft</option>
        </select>
        <p className="text-sm text-ink-500">{filtered.length} of {rows.length} students</p>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} data={filtered} keyField="id" pageSize={10} />
      </div>
    </div>
  )
}

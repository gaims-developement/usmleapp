import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Repeat, Stethoscope } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Select } from '@/components/ui/select'
import { PageLoader } from '@/components/ui/spinner'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { StatusBadge, hospitalAppStatusMeta } from '@/components/ui/status-badge'
import { Avatar } from '@/components/ui/avatar'
import { useHospitalApplications } from '@/lib/hospitalQueries'
import { formatDate } from '@/lib/utils'
import type { HospitalApplicationJoined } from '@/services/hospitalService'

const filters = [
  ['all', 'All rotations'],
  ['scheduled', 'Active / scheduled'],
  ['completed', 'Completed'],
]

export function HospitalRotationsPage() {
  const applications = useHospitalApplications()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')

  const rotations = useMemo(
    () => (applications.data ?? []).filter(a => a.status === 'scheduled' || a.status === 'completed'),
    [applications.data],
  )

  const filtered = filter === 'all' ? rotations : rotations.filter(a => a.status === filter)

  if (applications.isLoading) return <PageLoader label="Loading rotations…" />

  const columns: DataTableColumn<HospitalApplicationJoined>[] = [
    {
      key: 'student',
      header: 'Student',
      sortValue: a => a.student.name,
      cell: a => (
        <button
          type="button"
          onClick={() => navigate(`/dashboard/hospital/applications/${a.id}`)}
          className="flex cursor-pointer items-center gap-3"
        >
          <Avatar name={a.student.name} />
          <div className="min-w-0 text-left">
            <p className="truncate font-semibold text-ink-900">{a.student.name}</p>
            <p className="truncate text-xs text-ink-500">{a.student.country}</p>
          </div>
        </button>
      ),
    },
    {
      key: 'program',
      header: 'Program',
      sortValue: a => a.program.name,
      cell: a => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink-800">{a.program.name}</p>
          <p className="truncate text-xs text-ink-500">{a.program.department}</p>
        </div>
      ),
    },
    {
      key: 'doctor',
      header: 'Assigned doctor',
      sortValue: a => a.doctor?.name ?? '',
      cell: a => (
        <div className="flex items-center gap-2">
          <Stethoscope className="size-4 shrink-0 text-ink-400" aria-hidden />
          <span className="text-ink-700">{a.doctor?.name ?? '—'}</span>
        </div>
      ),
    },
    {
      key: 'start',
      header: 'Start',
      sortValue: a => a.rotationStart ?? '',
      cell: a => <span className="text-ink-700">{a.rotationStart ? formatDate(a.rotationStart) : '—'}</span>,
    },
    {
      key: 'end',
      header: 'End',
      sortValue: a => a.rotationEnd ?? '',
      cell: a => <span className="text-ink-700">{a.rotationEnd ? formatDate(a.rotationEnd) : '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: a => a.status,
      cell: a => <StatusBadge label={hospitalAppStatusMeta(a.status).label} tone={hospitalAppStatusMeta(a.status).tone} />,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Current Rotations"
        subtitle="Track scheduled and completed rotations across your departments."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Total rotations</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink-900">{rotations.length}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Active / scheduled</p>
          <p className="mt-2 font-display text-2xl font-bold text-violet-600">
            {rotations.filter(a => a.status === 'scheduled').length}
          </p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Completed</p>
          <p className="mt-2 font-display text-2xl font-bold text-emerald-600">
            {rotations.filter(a => a.status === 'completed').length}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Select value={filter} onChange={e => setFilter(e.target.value)} className="w-48" aria-label="Filter rotations">
          {filters.map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </Select>
        <p className="text-sm text-ink-500">
          <Repeat className="mr-1 inline size-4 align-[-3px]" aria-hidden />
          {filtered.length} rotation{filtered.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={filtered}
          keyField="id"
          pageSize={10}
          loading={false}
          emptyTitle="No rotations yet"
          emptyDescription="Scheduled rotations will appear here once you assign doctors."
        />
      </div>
    </div>
  )
}

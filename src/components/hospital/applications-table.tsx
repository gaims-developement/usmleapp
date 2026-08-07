import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { StatusBadge, hospitalAppStatusMeta } from '@/components/ui/status-badge'
import { Avatar } from '@/components/ui/avatar'
import { formatDate } from '@/lib/utils'
import type { HospitalApplicationJoined } from '@/services/hospitalService'

export function HospitalApplicationsTable({
  data,
  pageSize = 8,
}: {
  data: HospitalApplicationJoined[]
  pageSize?: number
}) {
  const navigate = useNavigate()

  const columns: DataTableColumn<HospitalApplicationJoined>[] = [
    {
      key: 'id',
      header: 'Application ID',
      sortValue: a => a.id,
      cell: a => (
        <button
          type="button"
          onClick={() => navigate(`/dashboard/hospital/applications/${a.id}`)}
          className="cursor-pointer font-semibold text-brand-700 transition-colors hover:text-brand-900"
        >
          {a.id}
        </button>
      ),
    },
    {
      key: 'student',
      header: 'Student',
      sortValue: a => a.student.name,
      cell: a => (
        <div className="flex items-center gap-3">
          <Avatar name={a.student.name} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink-900">{a.student.name}</p>
            <p className="truncate text-xs text-ink-500">{a.student.country}</p>
          </div>
        </div>
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
      key: 'appliedAt',
      header: 'Applied',
      sortValue: a => a.appliedAt,
      cell: a => <span className="text-ink-700">{formatDate(a.appliedAt)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: a => a.status,
      cell: a => <StatusBadge label={hospitalAppStatusMeta(a.status).label} tone={hospitalAppStatusMeta(a.status).tone} />,
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      cell: a => (
        <button
          type="button"
          onClick={() => navigate(`/dashboard/hospital/applications/${a.id}`)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-ink-200 px-3.5 py-1.5 text-xs font-semibold text-ink-700 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
        >
          Open
          <ArrowRight className="size-3.5" aria-hidden />
        </button>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      keyField="id"
      pageSize={pageSize}
      loading={false}
      emptyTitle="No applications in this view"
      emptyDescription="Applications forwarded to your hospital will appear here."
    />
  )
}

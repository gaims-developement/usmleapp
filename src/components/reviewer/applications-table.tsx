import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { StatusBadge, reviewerAppStatusMeta } from '@/components/ui/status-badge'
import { Avatar } from '@/components/ui/avatar'
import { formatDate } from '@/lib/utils'
import type { ReviewerApplication } from '@/mocks/reviewer/applications'

export function ReviewerApplicationsTable({
  data,
  pageSize = 8,
  onReview,
}: {
  data: ReviewerApplication[]
  pageSize?: number
  onReview?: (applicationId: string) => void
}) {
  const navigate = useNavigate()

  const columns: DataTableColumn<ReviewerApplication>[] = [
    {
      key: 'id',
      header: 'Application ID',
      sortValue: a => a.id,
      cell: a => (
        <button
          type="button"
          onClick={() => navigate(`/dashboard/reviewer/applications/${a.id}`)}
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
            <p className="truncate text-xs text-ink-500">{a.student.medicalSchool}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'country',
      header: 'Country',
      sortValue: a => a.student.country,
      cell: a => <span className="text-ink-700">{a.student.country}</span>,
    },
    {
      key: 'hospital',
      header: 'Hospital',
      sortValue: a => a.hospital,
      cell: a => <span className="text-ink-700">{a.hospital}</span>,
    },
    {
      key: 'specialty',
      header: 'Specialty',
      sortValue: a => a.specialty,
      cell: a => <span className="text-ink-700">{a.specialty}</span>,
    },
    {
      key: 'submittedAt',
      header: 'Submission Date',
      sortValue: a => a.submittedAt,
      cell: a => <span className="text-ink-700">{formatDate(a.submittedAt)}</span>,
    },
    {
      key: 'status',
      header: 'Current Status',
      sortValue: a => a.status,
      cell: a => <StatusBadge label={reviewerAppStatusMeta(a.status).label} tone={reviewerAppStatusMeta(a.status).tone} />,
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      cell: a => (
        <button
          type="button"
          onClick={() => onReview?.(a.id) ?? navigate(`/dashboard/reviewer/applications/${a.id}`)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-ink-200 px-3.5 py-1.5 text-xs font-semibold text-ink-700 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
        >
          Review
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
      emptyDescription="Applications assigned to you will appear here."
    />
  )
}

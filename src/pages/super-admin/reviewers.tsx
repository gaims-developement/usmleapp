import { useMemo, useState } from 'react'
import { Plus, Search, UserCheck } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { ButtonLink } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { PageLoader } from '@/components/ui/spinner'
import { reviewerStatusMeta, StatusBadge } from '@/components/ui/status-badge'
import { useAdminReviewers } from '@/lib/adminQueries'
import { formatDate } from '@/lib/utils'
import type { ReviewerRecord } from '@/mocks/admin/people'

export function SuperAdminReviewersPage() {
  const reviewers = useAdminReviewers()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const filtered = useMemo(() => {
    let result = reviewers.data ?? []
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(r => r.name.toLowerCase().includes(q))
    }
    if (status !== 'all') result = result.filter(r => r.status === status)
    return result
  }, [reviewers.data, search, status])

  if (reviewers.isLoading) return <PageLoader label="Loading reviewers…" />

  const totals = reviewers.data ?? []
  const pending = totals.reduce((sum, r) => sum + r.pending, 0)
  const completed = totals.reduce((sum, r) => sum + r.completed, 0)
  const accuracy = totals.length
    ? Math.round(totals.reduce((sum, r) => sum + r.accuracy, 0) / totals.length)
    : 0

  const columns: DataTableColumn<ReviewerRecord>[] = [
    {
      key: 'reviewer',
      header: 'Reviewer',
      cell: r => (
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
            <UserCheck className="size-4.5" aria-hidden />
          </span>
          <p className="font-semibold text-ink-900">{r.name}</p>
        </div>
      ),
      sortValue: r => r.name,
    },
    { key: 'assigned', header: 'Assigned', cell: r => r.assigned, align: 'right', sortValue: r => r.assigned },
    { key: 'completed', header: 'Completed', cell: r => r.completed, align: 'right', sortValue: r => r.completed },
    {
      key: 'pending',
      header: 'Pending',
      cell: r => (
        <span className={r.pending > 0 ? 'font-semibold text-amber-600' : ''}>{r.pending}</span>
      ),
      align: 'right',
      sortValue: r => r.pending,
    },
    {
      key: 'accuracy',
      header: 'Accuracy',
      cell: r => (
        <div className="flex items-center justify-end gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-ink-100">
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${r.accuracy}%` }}
            />
          </div>
          <span className="w-9 text-right text-xs font-semibold text-ink-700">{r.accuracy}%</span>
        </div>
      ),
      sortValue: r => r.accuracy,
    },
    {
      key: 'status',
      header: 'Status',
      cell: r => {
        const meta = reviewerStatusMeta(r.status)
        return <StatusBadge label={meta.label} tone={meta.tone} />
      },
    },
    { key: 'joined', header: 'Joined', cell: r => formatDate(r.joinedAt), align: 'right' },
  ]

  return (
    <div>
      <PageHeader
        title="Reviewers"
        subtitle="Review queue workload and verification performance."
        actions={
          <ButtonLink to="/dashboard/super-admin/reviewers" size="sm">
            <Plus className="size-4" aria-hidden />
            Add reviewer
          </ButtonLink>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Pending reviews</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink-900">{pending}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Total completed</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink-900">{completed}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Average accuracy</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink-900">{accuracy}%</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search reviewers…"
            className="w-72 pl-9"
            aria-label="Search reviewers"
          />
        </div>
        <Select value={status} onChange={e => setStatus(e.target.value)} className="w-44" aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="busy">Busy</option>
          <option value="on-leave">On leave</option>
        </Select>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} data={filtered} keyField="id" pageSize={8} />
      </div>
    </div>
  )
}

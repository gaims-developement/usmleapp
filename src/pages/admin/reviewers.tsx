import { useMemo, useState } from 'react'
import { Download, Search, UserCheck, UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { PageLoader } from '@/components/ui/spinner'
import { StatusBadge, reviewerAvailabilityMeta, reviewerStatusMeta } from '@/components/ui/status-badge'
import { Avatar } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/toast'
import { useAdminReviewers } from '@/lib/adminQueries'
import { downloadCsv } from '@/lib/csv'
import { formatDate } from '@/lib/utils'
import type { ReviewerRecord } from '@/mocks/admin/people'

export function AdminReviewersPage() {
  const reviewers = useAdminReviewers()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [availability, setAvailability] = useState('all')

  const filtered = useMemo(() => {
    let result = reviewers.data ?? []
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(r => r.name.toLowerCase().includes(q))
    }
    if (statusFilter !== 'all') result = result.filter(r => r.status === statusFilter)
    if (availability !== 'all') result = result.filter(r => r.availability === availability)
    return result
  }, [reviewers.data, search, statusFilter, availability])

  if (reviewers.isLoading) return <PageLoader label="Loading reviewers…" />

  const all = reviewers.data ?? []
  const active = all.filter(r => r.status === 'active').length
  const busy = all.filter(r => r.status === 'busy').length
  const totalPending = all.reduce((sum, r) => sum + r.pending, 0)

  const columns: DataTableColumn<ReviewerRecord>[] = [
    {
      key: 'name',
      header: 'Reviewer',
      cell: r => (
        <div className="flex items-center gap-3">
          <Avatar name={r.name} />
          <span className="font-semibold text-ink-900">{r.name}</span>
        </div>
      ),
      sortValue: r => r.name,
    },
    {
      key: 'assigned',
      header: 'Applications Assigned',
      cell: r => r.assigned,
      align: 'right',
      sortValue: r => r.assigned,
    },
    {
      key: 'pending',
      header: 'Pending',
      cell: r => <span className={r.pending >= 10 ? 'font-semibold text-red-600' : ''}>{r.pending}</span>,
      align: 'right',
      sortValue: r => r.pending,
    },
    {
      key: 'today',
      header: 'Completed Today',
      cell: r => r.completedToday,
      align: 'right',
      sortValue: r => r.completedToday,
    },
    {
      key: 'avg',
      header: 'Average Review Time',
      cell: r => r.avgReviewTime,
      align: 'right',
      sortValue: r => r.avgReviewTime,
    },
    {
      key: 'availability',
      header: 'Availability',
      cell: r => {
        const meta = reviewerAvailabilityMeta(r.availability)
        return <StatusBadge label={meta.label} tone={meta.tone} />
      },
    },
    {
      key: 'accuracy',
      header: 'Accuracy',
      cell: r => `${r.accuracy}%`,
      align: 'right',
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
    {
      key: 'joined',
      header: 'Joined',
      cell: r => formatDate(r.joinedAt),
      align: 'right',
      sortValue: r => r.joinedAt,
    },
  ]

  function handleExport() {
    downloadCsv(
      'reviewers.csv',
      all.map(r => ({
        name: r.name,
        assigned: r.assigned,
        pending: r.pending,
        completedToday: r.completedToday,
        avgReviewTime: r.avgReviewTime,
        availability: r.availability,
        accuracy: r.accuracy,
        status: r.status,
        joinedAt: r.joinedAt,
      })),
    )
  }

  return (
    <div>
      <PageHeader
        title="Reviewers"
        subtitle="Application review team — workload, accuracy, and availability."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="size-4" aria-hidden />
              Export CSV
            </Button>
            <Button
              size="sm"
              onClick={() => toast.success('Invitation sent', 'A reviewer invitation email was queued.')}
            >
              <UserPlus className="size-4" aria-hidden />
              Invite reviewer
            </Button>
          </>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <UserCheck className="size-5" aria-hidden />
            </span>
            <div>
              <p className="font-display text-2xl font-bold text-ink-900">{all.length}</p>
              <p className="text-sm text-ink-500">Total reviewers</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-sky-50 text-sky-600">
              <UserCheck className="size-5" aria-hidden />
            </span>
            <div>
              <p className="font-display text-2xl font-bold text-ink-900">
                {active} active · {busy} busy
              </p>
              <p className="text-sm text-ink-500">Currently available</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Applications pending review</p>
          <p className="mt-2 font-display text-2xl font-bold text-amber-600">{totalPending}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search reviewer…"
            className="w-64 pl-9"
            aria-label="Search reviewers"
          />
        </div>
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-36" aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="busy">Busy</option>
          <option value="on-leave">On leave</option>
        </Select>
        <Select value={availability} onChange={e => setAvailability(e.target.value)} className="w-40" aria-label="Filter by availability">
          <option value="all">All availability</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </Select>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} data={filtered} keyField="id" pageSize={10} />
      </div>
    </div>
  )
}

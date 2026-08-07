import { useMemo, useState } from 'react'
import { Download, Flag, Inbox, Search, UserCheck } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { PageLoader } from '@/components/ui/spinner'
import { StatusBadge, applicationPriorityMeta, applicationStatusMeta } from '@/components/ui/status-badge'
import {
  ApplicationActions,
  ApplicationDetailModal,
} from '@/components/admin/applications'
import { useAdminApplications } from '@/lib/adminQueries'
import { downloadCsv } from '@/lib/csv'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { AdminApplication } from '@/mocks/admin/operations'

export function AdminApplicationsPage() {
  const applications = useAdminApplications()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [priority, setPriority] = useState('all')
  const [flagFilter, setFlagFilter] = useState('all')
  const [selected, setSelected] = useState<AdminApplication | null>(null)

  const filtered = useMemo(() => {
    let result = applications.data ?? []
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        a =>
          a.id.toLowerCase().includes(q) ||
          a.student.toLowerCase().includes(q) ||
          a.hospital.toLowerCase().includes(q) ||
          a.specialty.toLowerCase().includes(q),
      )
    }
    if (status !== 'all') result = result.filter(a => a.status === status)
    if (priority !== 'all') result = result.filter(a => a.priority === priority)
    if (flagFilter === 'flagged') result = result.filter(a => a.flagged)
    if (flagFilter === 'unflagged') result = result.filter(a => !a.flagged)
    return result
  }, [applications.data, search, status, priority, flagFilter])

  if (applications.isLoading) return <PageLoader label="Loading application queue…" />

  const all = applications.data ?? []
  const unassigned = all.filter(a => a.reviewer === 'Unassigned').length
  const flagged = all.filter(a => a.flagged).length
  const underReview = all.filter(a => a.status === 'under_review').length

  const columns: DataTableColumn<AdminApplication>[] = [
    {
      key: 'id',
      header: 'Application',
      cell: r => (
        <button type="button" onClick={() => setSelected(r)} className="cursor-pointer text-left font-semibold text-brand-700 hover:underline">
          {r.id}
        </button>
      ),
      sortValue: r => r.id,
    },
    { key: 'student', header: 'Student', cell: r => r.student, sortValue: r => r.student },
    { key: 'hospital', header: 'Hospital', cell: r => <span className="block max-w-52 truncate">{r.hospital}</span> },
    { key: 'specialty', header: 'Specialty', cell: r => r.specialty, sortValue: r => r.specialty },
    {
      key: 'priority',
      header: 'Priority',
      cell: r => {
        const meta = applicationPriorityMeta(r.priority)
        return (
          <div className="flex items-center gap-1.5">
            {r.flagged && <Flag className="size-3.5 text-red-500" aria-label="Flagged" />}
            <StatusBadge label={meta.label} tone={meta.tone} />
          </div>
        )
      },
      sortValue: r => r.priority,
    },
    {
      key: 'status',
      header: 'Status',
      cell: r => {
        const meta = applicationStatusMeta(r.status)
        return <StatusBadge label={meta.label} tone={meta.tone} />
      },
      sortValue: r => r.status,
    },
    { key: 'reviewer', header: 'Reviewer', cell: r => r.reviewer, sortValue: r => r.reviewer },
    {
      key: 'submitted',
      header: 'Submitted',
      cell: r => formatDate(r.submittedAt),
      align: 'right',
      sortValue: r => r.submittedAt,
    },
    {
      key: 'actions',
      header: '',
      cell: r => <ApplicationActions application={r} onView={() => setSelected(r)} />,
      align: 'right',
    },
  ]

  function handleExport() {
    downloadCsv(
      'application-queue.csv',
      (applications.data ?? []).map(a => ({
        id: a.id,
        student: a.student,
        hospital: a.hospital,
        specialty: a.specialty,
        status: a.status,
        priority: a.priority,
        reviewer: a.reviewer,
        amount: formatCurrency(a.amount),
        submittedAt: a.submittedAt,
        flagged: a.flagged ? 'yes' : 'no',
        documents: `${a.documentsComplete}/${a.documentsTotal}`,
      })),
    )
  }

  return (
    <div>
      <PageHeader
        title="Application Queue"
        subtitle="Triage, assign, forward, and flag applications across the network."
        actions={
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="size-4" aria-hidden />
            Export CSV
          </Button>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <UserCheck className="size-5" aria-hidden />
            </span>
            <div>
              <p className="font-display text-2xl font-bold text-ink-900">{unassigned}</p>
              <p className="text-sm text-ink-500">Unassigned</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-sky-50 text-sky-600">
              <Inbox className="size-5" aria-hidden />
            </span>
            <div>
              <p className="font-display text-2xl font-bold text-ink-900">{underReview}</p>
              <p className="text-sm text-ink-500">Under review</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-red-50 text-red-600">
              <Flag className="size-5" aria-hidden />
            </span>
            <div>
              <p className="font-display text-2xl font-bold text-ink-900">{flagged}</p>
              <p className="text-sm text-ink-500">Flagged</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search application, student, hospital…"
            className="w-72 pl-9"
            aria-label="Search applications"
          />
        </div>
        <Select value={status} onChange={e => setStatus(e.target.value)} className="w-40" aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under review</option>
          <option value="additional_info">Info needed</option>
          <option value="offered">Offered</option>
          <option value="confirmed">Confirmed</option>
          <option value="withdrawn">Withdrawn</option>
          <option value="rejected">Not selected</option>
        </Select>
        <Select value={priority} onChange={e => setPriority(e.target.value)} className="w-36" aria-label="Filter by priority">
          <option value="all">All priorities</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </Select>
        <Select value={flagFilter} onChange={e => setFlagFilter(e.target.value)} className="w-36" aria-label="Filter by flag">
          <option value="all">All flags</option>
          <option value="flagged">Flagged</option>
          <option value="unflagged">Not flagged</option>
        </Select>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} data={filtered} keyField="id" pageSize={10} />
      </div>

      <ApplicationDetailModal open={selected !== null} onClose={() => setSelected(null)} application={selected} />
    </div>
  )
}

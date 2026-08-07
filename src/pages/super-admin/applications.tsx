import { useMemo, useState } from 'react'
import { Download, Eye, Search } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { PageLoader } from '@/components/ui/spinner'
import { applicationStatusMeta, StatusBadge } from '@/components/ui/status-badge'
import { useAdminApplications } from '@/lib/adminQueries'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { AdminApplication } from '@/mocks/admin/operations'

export function SuperAdminApplicationsPage() {
  const applications = useAdminApplications()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [specialty, setSpecialty] = useState('all')

  const specialties = useMemo(
    () => [...new Set((applications.data ?? []).map(a => a.specialty))].sort(),
    [applications.data],
  )

  const filtered = useMemo(() => {
    let result = applications.data ?? []
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        a =>
          a.id.toLowerCase().includes(q) ||
          a.student.toLowerCase().includes(q) ||
          a.hospital.toLowerCase().includes(q),
      )
    }
    if (status !== 'all') result = result.filter(a => a.status === status)
    if (specialty !== 'all') result = result.filter(a => a.specialty === specialty)
    return result
  }, [applications.data, search, status, specialty])

  if (applications.isLoading) return <PageLoader label="Loading applications…" />

  const columns: DataTableColumn<AdminApplication>[] = [
    {
      key: 'id',
      header: 'Application',
      cell: r => <span className="font-semibold text-ink-900">{r.id}</span>,
      sortValue: r => r.id,
    },
    { key: 'student', header: 'Student', cell: r => r.student, sortValue: r => r.student },
    { key: 'hospital', header: 'Hospital', cell: r => r.hospital },
    { key: 'specialty', header: 'Specialty', cell: r => r.specialty },
    {
      key: 'status',
      header: 'Status',
      cell: r => {
        const meta = applicationStatusMeta(r.status)
        return <StatusBadge label={meta.label} tone={meta.tone} />
      },
      sortValue: r => r.status,
    },
    { key: 'reviewer', header: 'Reviewer', cell: r => r.reviewer },
    {
      key: 'amount',
      header: 'Amount',
      cell: r => formatCurrency(r.amount),
      align: 'right',
      sortValue: r => r.amount,
    },
    {
      key: 'submitted',
      header: 'Submitted',
      cell: r => formatDate(r.submittedAt),
      align: 'right',
      sortValue: r => r.submittedAt,
    },
    {
      key: 'action',
      header: '',
      cell: () => (
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
          <Eye className="size-4" aria-hidden />
          View
        </span>
      ),
      align: 'right',
    },
  ]

  return (
    <div>
      <PageHeader
        title="Applications"
        subtitle="Track every application across the platform and reassign work."
        actions={
          <Button variant="outline" size="sm">
            <Download className="size-4" aria-hidden />
            Export CSV
          </Button>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID, student, hospital…"
            className="w-72 pl-9"
            aria-label="Search applications"
          />
        </div>
        <Select value={status} onChange={e => setStatus(e.target.value)} className="w-44" aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under review</option>
          <option value="additional_info">Info needed</option>
          <option value="offered">Offer received</option>
          <option value="confirmed">Confirmed</option>
          <option value="withdrawn">Withdrawn</option>
          <option value="rejected">Not selected</option>
        </Select>
        <Select value={specialty} onChange={e => setSpecialty(e.target.value)} className="w-56" aria-label="Filter by specialty">
          <option value="all">All specialties</option>
          {specialties.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} data={filtered} keyField="id" pageSize={8} />
      </div>
    </div>
  )
}

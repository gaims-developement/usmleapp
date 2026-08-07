import { useMemo, useState } from 'react'
import { FileCheck2, FolderOpen, Search, ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { ButtonLink } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { PageLoader } from '@/components/ui/spinner'
import { docVerificationMeta, StatusBadge } from '@/components/ui/status-badge'
import { useAdminDocuments } from '@/lib/adminQueries'
import { formatDate } from '@/lib/utils'
import type { DocRecord } from '@/mocks/admin/operations'

export function SuperAdminDocumentsPage() {
  const documents = useAdminDocuments()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const filtered = useMemo(() => {
    let result = documents.data ?? []
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        d =>
          d.owner.toLowerCase().includes(q) ||
          d.document.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q),
      )
    }
    if (status !== 'all') result = result.filter(d => d.status === status)
    return result
  }, [documents.data, search, status])

  if (documents.isLoading) return <PageLoader label="Loading documents…" />

  const totals = documents.data ?? []
  const pending = totals.filter(d => d.status === 'pending').length
  const verified = totals.filter(d => d.status === 'verified').length
  const expiring = totals.filter(d => d.status === 'expiring').length

  const columns: DataTableColumn<DocRecord>[] = [
    {
      key: 'document',
      header: 'Document',
      cell: r => (
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-600">
            <FolderOpen className="size-4.5" aria-hidden />
          </span>
          <div>
            <p className="font-semibold text-ink-900">{r.document}</p>
            <p className="text-xs text-ink-500">{r.category}</p>
          </div>
        </div>
      ),
      sortValue: r => r.document,
    },
    { key: 'owner', header: 'Owner', cell: r => r.owner, sortValue: r => r.owner },
    {
      key: 'status',
      header: 'Status',
      cell: r => {
        const meta = docVerificationMeta(r.status)
        return <StatusBadge label={meta.label} tone={meta.tone} />
      },
    },
    {
      key: 'uploaded',
      header: 'Uploaded',
      cell: r => formatDate(r.uploadedAt),
      align: 'right',
      sortValue: r => r.uploadedAt,
    },
    {
      key: 'action',
      header: '',
      cell: () => (
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
          <ShieldCheck className="size-4" aria-hidden />
          Review
        </span>
      ),
      align: 'right',
    },
  ]

  return (
    <div>
      <PageHeader
        title="Documents"
        subtitle="Central verification queue for student credentials and files."
        actions={
          <ButtonLink to="/dashboard/super-admin/documents" size="sm">
            <FileCheck2 className="size-4" aria-hidden />
            Verification queue
          </ButtonLink>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Pending verification</p>
          <p className="mt-2 font-display text-2xl font-bold text-amber-600">{pending}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Verified</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink-900">{verified}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Expiring soon</p>
          <p className="mt-2 font-display text-2xl font-bold text-sky-600">{expiring}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by owner or document…"
            className="w-72 pl-9"
            aria-label="Search documents"
          />
        </div>
        <Select value={status} onChange={e => setStatus(e.target.value)} className="w-44" aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
          <option value="expiring">Expiring</option>
        </Select>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} data={filtered} keyField="id" pageSize={8} />
      </div>
    </div>
  )
}

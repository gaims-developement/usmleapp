import { useMemo, useState } from 'react'
import { Check, FileCheck2, FolderOpen, Search, ShieldCheck, ShieldX } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button, ButtonLink } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { PageLoader, Spinner } from '@/components/ui/spinner'
import { Modal } from '@/components/ui/modal'
import { docVerificationMeta, StatusBadge } from '@/components/ui/status-badge'
import { useAdminDocument, useAdminDocuments, useSetDocStatus } from '@/lib/adminQueries'
import { cn, formatDate } from '@/lib/utils'
import type { DocRecord, DocVerificationStatus } from '@/mocks/admin/operations'

export function SuperAdminDocumentsPage() {
  const documents = useAdminDocuments()
  const setStatus = useSetDocStatus()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const document = useAdminDocument(selectedId)
  const [search, setSearch] = useState('')
  const [status, setStatusFilter] = useState('all')

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

  const handleDecision = async (decision: DocVerificationStatus) => {
    if (!selectedId) return
    await setStatus.mutateAsync({ id: selectedId, status: decision })
    setSelectedId(null)
  }

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
    { key: 'owner', header: 'Applicant', cell: r => r.owner, sortValue: r => r.owner },
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
      cell: r => {
        const approved = r.status === 'verified'
        return (
          <Button
            variant={approved ? 'white' : 'outline'}
            size="sm"
            onClick={() => setSelectedId(r.id)}
            className={cn(approved && 'text-brand-700')}
          >
            {approved ? <Check className="size-4" aria-hidden /> : <ShieldCheck className="size-4" aria-hidden />}
            {approved ? 'Approved' : 'Review'}
          </Button>
        )
      },
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
        <Select
          value={status}
          onChange={e => setStatusFilter(e.target.value)}
          className="w-44"
          aria-label="Filter by status"
        >
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

      <Modal
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        title="Document review"
        description={document.data ? `${document.data.document} · ${document.data.category}` : 'Fetching document…'}
        footer={
          document.data &&
          (document.data.status === 'verified' ? (
            <Button variant="outline" size="sm" onClick={() => setSelectedId(null)}>
              Done
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setSelectedId(null)}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => void handleDecision('rejected')}
                disabled={setStatus.isPending}
                className="!bg-red-600 hover:!bg-red-700"
              >
                <ShieldX className="size-4" aria-hidden />
                Reject
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => void handleDecision('verified')}
                disabled={setStatus.isPending}
              >
                <Check className="size-4" aria-hidden />
                Approve
              </Button>
            </>
          ))
        }
      >
        {document.isLoading || !document.data ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14 text-ink-500">
            <Spinner className="size-6" />
            <p className="text-sm">Fetching document details…</p>
          </div>
        ) : (
          <div>
            <div
              className={cn(
                'flex items-center gap-3 rounded-2xl border p-4',
                document.data.status === 'verified' ? 'border-brand-200 bg-brand-50/60' : 'border-amber-200 bg-amber-50/60',
              )}
            >
              <span
                className={cn(
                  'grid size-11 shrink-0 place-items-center rounded-2xl',
                  document.data.status === 'verified' ? 'bg-brand-100 text-brand-600' : 'bg-amber-100 text-amber-600',
                )}
              >
                <FolderOpen className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink-900">{document.data.document}</p>
                <p className="text-sm text-ink-500">
                  {document.data.status === 'verified'
                    ? 'This document has been approved.'
                    : 'This document is awaiting review.'}
                </p>
              </div>
            </div>

            <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">Applicant</dt>
                <dd className="mt-1 font-medium text-ink-900">{document.data.owner}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">Category</dt>
                <dd className="mt-1 font-medium text-ink-900">{document.data.category}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">Uploaded</dt>
                <dd className="mt-1 font-medium text-ink-900">{formatDate(document.data.uploadedAt)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">Status</dt>
                <dd className="mt-1">
                  <StatusBadge
                    label={docVerificationMeta(document.data.status).label}
                    tone={docVerificationMeta(document.data.status).tone}
                  />
                </dd>
              </div>
            </dl>

            <p className="mt-6 rounded-xl bg-ink-50 px-4 py-3 text-sm text-ink-500">
              {document.data.status === 'verified'
                ? 'The applicant will be able to see this document marked as verified in their profile.'
                : 'Approving or rejecting this document will notify the applicant immediately.'}
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}

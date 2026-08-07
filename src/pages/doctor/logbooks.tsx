import { useMemo, useState } from 'react'
import { Check, ClipboardList, FileX2, Stethoscope } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { PageLoader } from '@/components/ui/spinner'
import { StatusBadge, logbookStatusMeta } from '@/components/ui/status-badge'
import { Avatar } from '@/components/ui/avatar'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { LOGBOOK_TYPES, type LogbookType } from '@/mocks/doctor/logbook'
import { useLogbookEntries, useSetLogbookStatus } from '@/lib/doctorQueries'
import { formatDate } from '@/lib/utils'
import type { LogbookEntryJoined } from '@/services/doctorService'

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

export function DoctorLogbooksPage() {
  const entries = useLogbookEntries()
  const setStatus = useSetLogbookStatus()
  const toast = useToast()
  const [status, setStatusFilter] = useState<StatusFilter>('all')
  const [type, setTypeFilter] = useState<'all' | LogbookType>('all')
  const [selected, setSelected] = useState<LogbookEntryJoined | null>(null)
  const [comments, setComments] = useState('')

  const filtered = useMemo(() => {
    let result = entries.data ?? []
    if (status !== 'all') result = result.filter(e => e.status === status)
    if (type !== 'all') result = result.filter(e => e.type === type)
    return result
  }, [entries.data, status, type])

  const counts = useMemo(() => {
    const all = entries.data ?? []
    return {
      pending: all.filter(e => e.status === 'pending').length,
      approved: all.filter(e => e.status === 'approved').length,
      rejected: all.filter(e => e.status === 'rejected').length,
    }
  }, [entries.data])

  if (entries.isLoading) return <PageLoader label="Loading clinical logbooks…" />

  function decide(nextStatus: 'approved' | 'rejected') {
    if (!selected) return
    setStatus.mutate(
      { entryId: selected.id, status: nextStatus, comments: comments.trim() || undefined },
      {
        onSuccess: entry => {
          toast.success(
            nextStatus === 'approved' ? 'Entry approved' : 'Entry rejected',
            `${entry.id} for ${entry.student.name} was updated.`,
          )
          setSelected(null)
          setComments('')
        },
        onError: () => toast.error('Could not update entry'),
      },
    )
  }

  const columns: DataTableColumn<LogbookEntryJoined>[] = [
    {
      key: 'student',
      header: 'Student',
      sortValue: e => e.student.name,
      cell: entry => (
        <div className="flex items-center gap-3">
          <Avatar name={entry.student.name} />
          <div>
            <p className="font-semibold text-ink-900">{entry.student.name}</p>
            <p className="text-xs text-ink-500">{entry.student.country}</p>
          </div>
        </div>
      ),
    },
    { key: 'id', header: 'Entry', sortValue: e => e.id, cell: entry => <span className="font-semibold text-ink-700">{entry.id}</span> },
    { key: 'date', header: 'Date', sortValue: e => e.date, cell: entry => <span className="text-ink-600">{formatDate(entry.date)}</span> },
    {
      key: 'type',
      header: 'Type',
      sortValue: e => e.type,
      cell: entry => (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-700">
          <Stethoscope className="size-3.5 text-ink-400" aria-hidden />
          {LOGBOOK_TYPES[entry.type]}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      cell: entry => (
        <span className="block max-w-60 truncate text-ink-600" title={entry.description}>{entry.description}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: e => e.status,
      cell: entry => (
        <StatusBadge label={logbookStatusMeta(entry.status).label} tone={logbookStatusMeta(entry.status).tone} />
      ),
    },
    {
      key: 'action',
      header: 'Action',
      cell: entry =>
        entry.status === 'pending' ? (
          <button
            type="button"
            onClick={() => {
              setSelected(entry)
              setComments('')
            }}
            className="cursor-pointer rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Review
          </button>
        ) : (
          <span className="text-xs text-ink-400">
            {entry.comments ? `Comment: ${entry.comments}` : 'No comment'}
          </span>
        ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Clinical Logbooks"
        subtitle="Verify and approve student clinical entries."
        actions={
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
            <ClipboardList className="size-4" aria-hidden />
            {counts.pending} pending
          </div>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Total entries</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink-900">{entries.data?.length ?? 0}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Approved</p>
          <p className="mt-2 font-display text-2xl font-bold text-brand-600">{counts.approved}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Rejected</p>
          <p className="mt-2 font-display text-2xl font-bold text-red-600">{counts.rejected}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={e => setStatusFilter(e.target.value as StatusFilter)}
          className="h-10 w-48 cursor-pointer rounded-xl border border-ink-300 bg-white px-3 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={type}
          onChange={e => setTypeFilter(e.target.value as 'all' | LogbookType)}
          className="h-10 w-60 cursor-pointer rounded-xl border border-ink-300 bg-white px-3 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          aria-label="Filter by entry type"
        >
          <option value="all">All entry types</option>
          {Object.entries(LOGBOOK_TYPES).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <p className="text-sm text-ink-500">{filtered.length} entries</p>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} data={filtered} keyField="id" pageSize={10} />
      </div>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={`Review entry ${selected?.id ?? ''}`}
        description={selected ? `${selected.student.name} · ${LOGBOOK_TYPES[selected.type]} · ${formatDate(selected.date)}` : undefined}
        size="lg"
      >
        {selected && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-ink-100 bg-ink-50/60 p-4">
              <p className="text-sm leading-relaxed text-ink-700">{selected.description}</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-800" htmlFor="review-comments">
                Comments (optional)
              </label>
              <Textarea
                id="review-comments"
                value={comments}
                onChange={e => setComments(e.target.value)}
                rows={4}
                placeholder="Add feedback for the student…"
              />
            </div>
          </div>
        )}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setSelected(null)}>
            Cancel
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="!border-red-300 !text-red-600 hover:!bg-red-50"
            onClick={() => decide('rejected')}
            disabled={setStatus.isPending}
          >
            <FileX2 className="size-4" aria-hidden />
            Reject
          </Button>
          <Button size="sm" onClick={() => decide('approved')} disabled={setStatus.isPending}>
            <Check className="size-4" aria-hidden />
            {setStatus.isPending ? 'Saving…' : 'Approve'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

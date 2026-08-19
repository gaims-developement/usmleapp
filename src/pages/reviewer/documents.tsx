import { useMemo, useState } from 'react'
import { FileCheck2, FileWarning, Search, StickyNote } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/ui/modal'
import { PageLoader } from '@/components/ui/spinner'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { StatusBadge, reviewDocMeta } from '@/components/ui/status-badge'
import { Avatar } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/toast'
import {
  useReviewerApplications,
  useSetDocumentNote,
  useSetDocumentVerification,
} from '@/lib/reviewerQueries'
import { formatDate } from '@/lib/utils'
import type { ReviewDocument, ReviewerApplication, DocVerification } from '@/mocks/reviewer/applications'

interface DocRow {
  key: string
  app: ReviewerApplication
  doc: ReviewDocument
}

const statusOptions = [
  ['all', 'All statuses'],
  ['pending', 'Pending'],
  ['requires_update', 'Requires update'],
  ['rejected', 'Rejected'],
]

export function ReviewerDocumentsPage() {
  const applications = useReviewerApplications()
  const setVerification = useSetDocumentVerification()
  const setNote = useSetDocumentNote()
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [noteTarget, setNoteTarget] = useState<DocRow | null>(null)
  const [noteText, setNoteText] = useState('')

  const rows = useMemo<DocRow[]>(() => {
    const result: DocRow[] = []
    for (const app of applications.data ?? []) {
      for (const doc of app.documents) {
        if (doc.verification === 'verified') continue
        result.push({ key: `${app.id}-${doc.name}`, app, doc })
      }
    }
    return result
  }, [applications.data])

  const filtered = useMemo(() => {
    let result = rows
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        r =>
          r.app.student.name.toLowerCase().includes(q) ||
          r.app.id.toLowerCase().includes(q) ||
          r.doc.name.toLowerCase().includes(q),
      )
    }
    if (filter !== 'all') result = result.filter(r => r.doc.verification === filter)
    return result
  }, [rows, search, filter])

  if (applications.isLoading) return <PageLoader label="Loading documents…" />

  function handleVerify(row: DocRow) {
    setVerification.mutate(
      { applicationId: row.app.id, documentId: row.doc.applicationDocumentId!, verification: 'verified' },
      {
        onSuccess: () => toast.success('Document verified', `${row.doc.name} for ${row.app.id}.`),
        onError: () => toast.error('Could not update document'),
      },
    )
  }

  function handleStatus(row: DocRow, verification: DocVerification, successLabel: string) {
    setVerification.mutate(
      { applicationId: row.app.id, documentId: row.doc.applicationDocumentId!, verification },
      {
        onSuccess: () => toast.success(successLabel, `${row.doc.name} for ${row.app.id}.`),
        onError: () => toast.error('Could not update document'),
      },
    )
  }

  const columns: DataTableColumn<DocRow>[] = [
    {
      key: 'application',
      header: 'Application',
      sortValue: r => r.app.id,
      cell: r => (
        <span className="font-semibold text-brand-700">
          {r.app.id}
        </span>
      ),
    },
    {
      key: 'student',
      header: 'Student',
      sortValue: r => r.app.student.name,
      cell: r => (
        <div className="flex items-center gap-2.5">
          <Avatar name={r.app.student.name} />
          <span className="font-semibold text-ink-900">{r.app.student.name}</span>
        </div>
      ),
    },
    {
      key: 'document',
      header: 'Document',
      sortValue: r => r.doc.name,
      cell: r => <span className="font-medium text-ink-800">{r.doc.name}</span>,
    },
    {
      key: 'uploadedAt',
      header: 'Uploaded',
      sortValue: r => r.doc.uploadedAt,
      cell: r => <span className="text-ink-700">{formatDate(r.doc.uploadedAt)}</span>,
    },
    {
      key: 'verification',
      header: 'Verification Status',
      sortValue: r => r.doc.verification,
      cell: r => <StatusBadge label={reviewDocMeta(r.doc.verification).label} tone={reviewDocMeta(r.doc.verification).tone} />,
    },
    {
      key: 'note',
      header: 'Reviewer Notes',
      cell: r => (
        <span className="block max-w-64 truncate text-xs text-ink-500">{r.doc.note || '—'}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      cell: r => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => handleVerify(r)}
            className="cursor-pointer rounded-full bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Verify
          </button>
          <button
            type="button"
            onClick={() => handleStatus(r, 'requires_update', 'Update requested')}
            className="cursor-pointer rounded-full border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-50"
          >
            Request update
          </button>
          <button
            type="button"
            onClick={() => handleStatus(r, 'rejected', 'Document rejected')}
            className="cursor-pointer rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
          >
            Reject
          </button>
          <button
            type="button"
            aria-label={`Note on ${r.doc.name}`}
            onClick={() => {
              setNoteTarget(r)
              setNoteText(r.doc.note)
            }}
            className="grid size-8 cursor-pointer place-items-center rounded-full border border-ink-200 text-ink-500 transition-colors hover:bg-ink-50"
          >
            <StickyNote className="size-3.5" aria-hidden />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Document Verification"
        subtitle="Verify uploaded documents and flag anything that needs correction."
        actions={
          <span className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800">
            <FileWarning className="size-4" aria-hidden />
            {rows.length} documents need attention
          </span>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search student, application, document…"
            className="w-72 pl-9"
            aria-label="Search documents"
          />
        </div>
        <Select value={filter} onChange={e => setFilter(e.target.value)} className="w-44" aria-label="Filter document status">
          {statusOptions.map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </Select>
      </div>

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={filtered}
          keyField="key"
          pageSize={10}
          emptyTitle="No documents need attention"
          emptyDescription="All uploaded documents are verified."
        />
      </div>

      <Modal
        open={noteTarget !== null}
        onClose={() => setNoteTarget(null)}
        title="Reviewer note"
        description={noteTarget ? `${noteTarget.doc.name} · ${noteTarget.app.id}` : undefined}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setNoteTarget(null)} disabled={setNote.isPending}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={setNote.isPending}
              onClick={() => {
                if (!noteTarget) return
                setNote.mutate(
                  { applicationId: noteTarget.app.id, documentId: noteTarget.doc.applicationDocumentId!, note: noteText },
                  {
                    onSuccess: () => {
                      toast.success('Note saved', `${noteTarget.doc.name} updated.`)
                      setNoteTarget(null)
                    },
                    onError: () => toast.error('Could not save note'),
                  },
                )
              }}
            >
              <FileCheck2 className="size-4" aria-hidden />
              Save note
            </Button>
          </>
        }
      >
        <div>
          <Label htmlFor="doc-note">Reviewer note</Label>
          <Textarea
            id="doc-note"
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            rows={4}
            placeholder="Add a note about this document for the student or other reviewers…"
          />
        </div>
      </Modal>
    </div>
  )
}

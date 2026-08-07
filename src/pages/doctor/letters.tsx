import { useMemo, useState } from 'react'
import { Check, FileSignature, Send } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { PageLoader } from '@/components/ui/spinner'
import { StatusBadge, lorStatusMeta } from '@/components/ui/status-badge'
import { Avatar } from '@/components/ui/avatar'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { useLetters, useSaveLetter, useSetLetterStatus } from '@/lib/doctorQueries'
import { formatDate } from '@/lib/utils'
import type { LetterDraft, LetterJoined } from '@/services/doctorService'

function toDraft(letter: LetterJoined): LetterDraft {
  return { summary: letter.summary, strengths: letter.strengths, body: letter.body }
}

export function DoctorLettersPage() {
  const letters = useLetters()
  const save = useSaveLetter()
  const setStatus = useSetLetterStatus()
  const toast = useToast()
  const [status, setStatusFilter] = useState<'all' | 'draft' | 'pending_review' | 'signed' | 'delivered'>('all')
  const [selected, setSelected] = useState<LetterJoined | null>(null)
  const [draft, setDraft] = useState<LetterDraft | null>(null)

  const filtered = useMemo(
    () => (status === 'all' ? (letters.data ?? []) : (letters.data ?? []).filter(l => l.status === status)),
    [letters.data, status],
  )

  if (letters.isLoading) return <PageLoader label="Loading letters of recommendation…" />

  function openEditor(letter: LetterJoined) {
    setSelected(letter)
    setDraft(toDraft(letter))
  }

  function handleSave() {
    if (!selected || !draft) return
    save.mutate(
      { letterId: selected.id, draft },
      {
        onSuccess: () => {
          toast.success('Draft saved', `${selected.id} was updated.`)
          setSelected(null)
          setDraft(null)
        },
        onError: () => toast.error('Could not save letter'),
      },
    )
  }

  function handleSubmit() {
    if (!selected || !draft) return
    if (!draft.summary.trim() || !draft.body.trim()) {
      toast.error('Incomplete letter', 'Summary and letter body are required before submitting.')
      return
    }
    save.mutate(
      { letterId: selected.id, draft },
      {
        onSuccess: () => {
          setStatus.mutate(
            { letterId: selected.id, status: 'pending_review' },
            {
              onSuccess: () => {
                toast.success('Letter submitted', `${selected.id} was sent to hospital administration for review.`)
                setSelected(null)
                setDraft(null)
              },
              onError: () => toast.error('Could not submit letter'),
            },
          )
        },
        onError: () => toast.error('Could not save letter'),
      },
    )
  }

  const columns: DataTableColumn<LetterJoined>[] = [
    {
      key: 'student',
      header: 'Student',
      sortValue: l => l.student.name,
      cell: letter => (
        <div className="flex items-center gap-3">
          <Avatar name={letter.student.name} />
          <div>
            <p className="font-semibold text-ink-900">{letter.student.name}</p>
            <p className="text-xs text-ink-500">{letter.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: l => l.status,
      cell: letter => (
        <StatusBadge label={lorStatusMeta(letter.status).label} tone={lorStatusMeta(letter.status).tone} />
      ),
    },
    { key: 'summary', header: 'Summary', cell: letter => <span className="block max-w-64 truncate text-ink-600" title={letter.summary}>{letter.summary}</span> },
    { key: 'updated', header: 'Updated', sortValue: l => l.updatedAt, cell: letter => <span className="text-ink-600">{formatDate(letter.updatedAt)}</span> },
    {
      key: 'action',
      header: 'Action',
      cell: letter =>
        letter.status === 'draft' ? (
          <button
            type="button"
            onClick={() => openEditor(letter)}
            className="cursor-pointer rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Edit letter
          </button>
        ) : letter.status === 'pending_review' ? (
          <button
            type="button"
            onClick={() => openEditor(letter)}
            className="cursor-pointer rounded-xl border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-700 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
          >
            View
          </button>
        ) : (
          <span className="text-xs text-ink-400">With administration</span>
        ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Letters of Recommendation"
        subtitle="Draft, edit, and submit letters of recommendation for your students."
        actions={
          <div className="flex items-center gap-2 rounded-xl bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-800">
            <FileSignature className="size-4" aria-hidden />
            {(letters.data ?? []).filter(l => l.status === 'draft').length} drafts
          </div>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={e => setStatusFilter(e.target.value as typeof status)}
          className="h-10 w-52 cursor-pointer rounded-xl border border-ink-300 bg-white px-3 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="pending_review">Pending review</option>
          <option value="signed">Signed</option>
          <option value="delivered">Delivered</option>
        </select>
        <p className="text-sm text-ink-500">{filtered.length} letters</p>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} data={filtered} keyField="id" pageSize={10} />
      </div>

      <Modal
        open={Boolean(selected && draft)}
        onClose={() => { setSelected(null); setDraft(null) }}
        title={`${selected?.status === 'draft' ? 'Edit letter' : 'Letter of recommendation'} · ${selected?.id ?? ''}`}
        description={selected ? `For ${selected.student.name} · ${selected.student.country}` : undefined}
        size="lg"
      >
        {selected && draft && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-ink-200 bg-ink-50/60 p-4">
              <div className="flex items-center gap-3">
                <Avatar name={selected.student.name} className="size-10" />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base font-bold text-ink-900">{selected.student.name}</p>
                  <p className="text-sm text-ink-500">{selected.student.country}</p>
                </div>
                <StatusBadge label={lorStatusMeta(selected.status).label} tone={lorStatusMeta(selected.status).tone} />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-800" htmlFor="lor-summary">Summary</label>
              <Input id="lor-summary" value={draft.summary} onChange={e => setDraft(prev => prev ? { ...prev, summary: e.target.value } : prev)} disabled={selected.status !== 'draft'} placeholder="One-line summary of recommendation…" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-800" htmlFor="lor-strengths">Key strengths</label>
              <Input id="lor-strengths" value={draft.strengths} onChange={e => setDraft(prev => prev ? { ...prev, strengths: e.target.value } : prev)} disabled={selected.status !== 'draft'} placeholder="Comma-separated strengths…" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-800" htmlFor="lor-body">Letter body</label>
              <Textarea id="lor-body" value={draft.body} onChange={e => setDraft(prev => prev ? { ...prev, body: e.target.value } : prev)} rows={8} disabled={selected.status !== 'draft'} placeholder="Write the full letter of recommendation…" />
            </div>
          </div>
        )}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => { setSelected(null); setDraft(null) }}>
            Close
          </Button>
          {selected?.status === 'draft' && (
            <>
              <Button variant="outline" size="sm" onClick={handleSave} disabled={save.isPending}>
                <Check className="size-4" aria-hidden />
                {save.isPending ? 'Saving…' : 'Save draft'}
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={save.isPending || setStatus.isPending}>
                <Send className="size-4" aria-hidden />
                {save.isPending || setStatus.isPending ? 'Submitting…' : 'Submit for review'}
              </Button>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}

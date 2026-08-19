import { useMemo, useState } from 'react'
import { ClipboardList, Plus, Stethoscope, UserRound } from 'lucide-react'
import { useApplications } from '@/lib/queries'
import { useLogbook, useSubmitLogbookEntry } from '@/lib/studentQueries'
import { PageHeader } from '@/components/ui/page-header'
import { PageLoader } from '@/components/ui/spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { Modal } from '@/components/ui/modal'
import { StatusBadge, logbookStatusMeta } from '@/components/ui/status-badge'
import { useToast } from '@/components/ui/toast'
import { LOGBOOK_TYPES, type LogbookType } from '@/mocks/doctor/logbook'
import { formatDate } from '@/lib/utils'
import type { StudentLogbookEntry } from '@/services/studentService'

const ACTIVE_STATUSES = ['confirmed', 'completed']

export function LogbookPage() {
  const applications = useApplications()
  const toast = useToast()
  const [selectedId, setSelectedId] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [type, setType] = useState<LogbookType>('case_discussion')
  const [date, setDate] = useState<string | null>(null)
  const [description, setDescription] = useState('')

  const active = useMemo(() => (applications.data ?? []).filter(app => ACTIVE_STATUSES.includes(app.status)), [applications.data])

  const activeId = selectedId || active[0]?.id || ''
  const logbook = useLogbook(activeId)
  const submit = useSubmitLogbookEntry(activeId)

  if (applications.isPending) return <PageLoader label="Loading rotations…" />

  if (active.length === 0) {
    return (
      <div>
        <PageHeader title="Clinical Logbook" subtitle="Track clinical entries approved by your supervising doctor." />
        <EmptyState
          icon={<ClipboardList className="size-7" />}
          title="No active rotations"
          description="Your logbook appears here once a hospital schedules you with a supervising doctor."
          actionLabel="View applications"
          actionTo="/applications"
        />
      </div>
    )
  }

  function handleSubmit() {
    if (!description.trim()) {
      toast.error('Please describe your entry')
      return
    }
    submit.mutate(
      { type, description: description.trim(), date: date ?? new Date().toISOString().slice(0, 10) },
      {
        onSuccess: () => {
          toast.success('Entry submitted', 'Your supervising doctor has been notified.')
          setFormOpen(false)
          setType('case_discussion')
          setDate(null)
          setDescription('')
        },
        onError: () => toast.error('Could not submit entry'),
      },
    )
  }

  const doctor = logbook.data?.doctor
  const entries = logbook.data?.entries ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clinical Logbook"
        subtitle="Log your daily clinical activities for supervising doctor approval."
        actions={
          <Button size="sm" onClick={() => setFormOpen(true)} disabled={submit.isPending}>
            <Plus className="size-4" aria-hidden />
            New entry
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="logbook-rotation" className="text-sm font-semibold text-ink-700">
          Rotation
        </label>
        <select
          id="logbook-rotation"
          value={activeId}
          onChange={e => setSelectedId(e.target.value)}
          className="h-10 w-full cursor-pointer rounded-xl border border-ink-300 bg-white px-3 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 sm:w-96"
        >
          {active.map(app => (
            <option key={app.id} value={app.id}>
              {app.specialty} at {app.hospital}
            </option>
          ))}
        </select>
      </div>

      {doctor && (
        <div className="flex items-center gap-4 rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <div className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
            <UserRound className="size-6" aria-hidden />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Supervising doctor</p>
            <p className="font-display text-lg font-bold text-ink-900">{doctor.name}</p>
            {doctor.specialty && <p className="text-sm text-ink-500">{doctor.specialty}</p>}
          </div>
        </div>
      )}

      {entries.length > 0 ? (
        <div className="grid gap-4">
          {entries.map(entry => (
            <LogbookEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Stethoscope className="size-7" />}
          title="No logbook entries yet"
          description="Submit your first entry and your supervising doctor will review it."
        />
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="New logbook entry"
        description="Log a clinical activity from today's rotation."
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="entry-type" className="mb-1.5 block text-sm font-semibold text-ink-800">
              Entry type
            </label>
            <select
              id="entry-type"
              value={type}
              onChange={e => setType(e.target.value as LogbookType)}
              className="h-11 w-full cursor-pointer rounded-xl border border-ink-300 bg-white px-3 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {Object.entries(LOGBOOK_TYPES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-800">Date</label>
            <DatePicker value={date} onChange={setDate} placeholder="Select date" />
          </div>
          <div>
            <label htmlFor="entry-description" className="mb-1.5 block text-sm font-semibold text-ink-800">
              Description
            </label>
            <Textarea
              id="entry-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={5}
              placeholder="Describe the clinical activity, what you observed or did, and what you learned…"
            />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setFormOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={submit.isPending}>
            {submit.isPending ? 'Submitting…' : 'Submit for review'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function LogbookEntryCard({ entry }: { entry: StudentLogbookEntry }) {
  const meta = logbookStatusMeta(entry.status)
  return (
    <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-700">
            <Stethoscope className="size-3.5 text-ink-400" aria-hidden />
            {LOGBOOK_TYPES[entry.type as LogbookType] ?? entry.type}
          </span>
          <span className="text-sm text-ink-500">{formatDate(entry.date)}</span>
        </div>
        <StatusBadge label={meta.label} tone={meta.tone} />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink-700">{entry.description}</p>
      {entry.status === 'rejected' && entry.comments && (
        <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-semibold">Rejected — revise and resubmit</p>
          <p className="mt-1">{entry.comments.replace(/^REJECTED:\s*/, '')}</p>
        </div>
      )}
      {entry.status === 'approved' && entry.comments && (
        <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-800">
          <p className="font-semibold">Doctor's comment</p>
          <p className="mt-1">{entry.comments}</p>
        </div>
      )}
    </div>
  )
}

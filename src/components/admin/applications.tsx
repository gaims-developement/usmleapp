import { useEffect, useState } from 'react'
import { Flag, Forward, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Modal, ConfirmDialog } from '@/components/ui/modal'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge, applicationPriorityMeta, applicationStatusMeta } from '@/components/ui/status-badge'
import { useToast } from '@/components/ui/toast'
import {
  useAdminReviewers,
  useAssignReviewer,
  useForwardApplication,
  useToggleFlagApplication,
} from '@/lib/adminQueries'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { AdminApplication } from '@/mocks/admin/operations'

function availableReviewers(data: ReturnType<typeof useAdminReviewers>['data']) {
  return (data ?? []).filter(r => r.status !== 'on-leave')
}

export function AssignReviewerModal({
  open,
  onClose,
  application,
}: {
  open: boolean
  onClose: () => void
  application: AdminApplication | null
}) {
  const { data: reviewerData } = useAdminReviewers()
  const reviewers = availableReviewers(reviewerData)
  const assign = useAssignReviewer()
  const toast = useToast()
  const [reviewer, setReviewer] = useState('')

  useEffect(() => {
    if (open) setReviewer('')
  }, [open])

  if (!application) return null
  const app = application

  function handleSubmit() {
    if (!reviewer) return
    assign.mutate(
      { applicationId: app.id, reviewer },
      {
        onSuccess: () => {
          toast.success('Reviewer assigned', `${app.id} assigned to ${reviewer}.`)
          onClose()
        },
        onError: () => toast.error('Could not assign reviewer'),
      },
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Assign reviewer"
      description={`Assign ${app.id} · ${app.student}`}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={assign.isPending}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!reviewer || assign.isPending}>
            Assign
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-2xl bg-ink-50 p-4 text-sm">
          <p className="font-semibold text-ink-900">
            {app.hospital} · {app.specialty}
          </p>
          <p className="mt-0.5 text-ink-500">
            Submitted {formatDate(app.submittedAt)} ·{' '}
            {app.documentsComplete}/{app.documentsTotal} documents
          </p>
        </div>
        <div>
          <Label htmlFor="assign-reviewer">Reviewer</Label>
          <Select
            id="assign-reviewer"
            value={reviewer}
            onChange={e => setReviewer(e.target.value)}
            aria-label="Select reviewer"
          >
            <option value="">Select a reviewer…</option>
            {reviewers.map(r => (
              <option key={r.id} value={r.name}>
                {r.name} · {r.pending} pending
              </option>
            ))}
          </Select>
        </div>
      </div>
    </Modal>
  )
}

export function ForwardApplicationModal({
  open,
  onClose,
  application,
}: {
  open: boolean
  onClose: () => void
  application: AdminApplication | null
}) {
  const { data: reviewerData } = useAdminReviewers()
  const reviewers = availableReviewers(reviewerData)
  const forward = useForwardApplication()
  const toast = useToast()
  const [reviewer, setReviewer] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (open) {
      setReviewer('')
      setNote('')
    }
  }, [open])

  if (!application) return null
  const app = application

  function handleSubmit() {
    if (!reviewer) return
    forward.mutate(
      { applicationId: app.id, reviewer, note },
      {
        onSuccess: () => {
          toast.success('Application forwarded', `${app.id} forwarded to ${reviewer}.`)
          onClose()
        },
        onError: () => toast.error('Could not forward application'),
      },
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Forward application"
      description={`Reassign ${app.id} to another reviewer`}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={forward.isPending}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!reviewer || forward.isPending}>
            Forward
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="rounded-2xl bg-ink-50 p-4 text-sm text-ink-600">
          Currently assigned to <span className="font-semibold text-ink-900">{app.reviewer}</span>.
        </p>
        <div>
          <Label htmlFor="forward-reviewer">Forward to</Label>
          <Select
            id="forward-reviewer"
            value={reviewer}
            onChange={e => setReviewer(e.target.value)}
            aria-label="Select reviewer"
          >
            <option value="">Select a reviewer…</option>
            {reviewers
              .filter(r => r.name !== app.reviewer)
              .map(r => (
                <option key={r.id} value={r.name}>
                  {r.name} · {r.pending} pending
                </option>
              ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="forward-note">Note for reviewer (optional)</Label>
          <Textarea
            id="forward-note"
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={3}
            placeholder="e.g. Please prioritize — application is aging."
          />
        </div>
      </div>
    </Modal>
  )
}

export function ApplicationDetailModal({
  open,
  onClose,
  application,
}: {
  open: boolean
  onClose: () => void
  application: AdminApplication | null
}) {
  if (!application) return null
  const status = applicationStatusMeta(application.status)
  const priority = applicationPriorityMeta(application.priority)
  const pct = Math.round((application.documentsComplete / application.documentsTotal) * 100)

  const rows: [string, string][] = [
    ['Student', application.student],
    ['Hospital', application.hospital],
    ['Specialty', application.specialty],
    ['Amount', formatCurrency(application.amount)],
    ['Submitted', formatDate(application.submittedAt)],
    ['Reviewer', application.reviewer],
    ['Documents', `${application.documentsComplete} of ${application.documentsTotal}`],
  ]

  return (
    <Modal open={open} onClose={onClose} title={application.id} description={application.student}>
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <StatusBadge label={status.label} tone={status.tone} />
          <StatusBadge label={priority.label} tone={priority.tone} />
          {application.flagged && <StatusBadge label="Flagged" tone="red" />}
        </div>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <div key={k} className="border-b border-ink-100 pb-2">
              <dt className="text-xs font-bold uppercase tracking-wide text-ink-400">{k}</dt>
              <dd className="mt-0.5 text-sm font-semibold text-ink-900">{v}</dd>
            </div>
          ))}
        </dl>
        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-semibold text-ink-800">Document completeness</span>
            <span className="text-ink-500">{pct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-ink-100">
            <div
              className={`h-full rounded-full ${pct === 100 ? 'bg-brand-500' : 'bg-amber-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}

export function ApplicationActions({
  application,
  onView,
}: {
  application: AdminApplication
  onView: () => void
}) {
  const flag = useToggleFlagApplication()
  const toast = useToast()
  const [assignOpen, setAssignOpen] = useState(false)
  const [forwardOpen, setForwardOpen] = useState(false)
  const [unflagOpen, setUnflagOpen] = useState(false)

  const unassigned = application.reviewer === 'Unassigned'

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        <Button variant="ghost" size="sm" onClick={onView}>
          View
        </Button>
        {unassigned ? (
          <Button variant="outline" size="sm" onClick={() => setAssignOpen(true)}>
            <UserCheck className="size-3.5" aria-hidden />
            Assign
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setForwardOpen(true)}>
            <Forward className="size-3.5" aria-hidden />
            Forward
          </Button>
        )}
        {application.flagged ? (
          <Button
            variant="outline"
            size="sm"
            className="!border-red-200 !text-red-600 hover:!bg-red-50"
            onClick={() => setUnflagOpen(true)}
          >
            <Flag className="size-3.5" aria-hidden />
            Unflag
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              flag.mutate(application.id, {
                onSuccess: () => toast.info('Application flagged', `${application.id} added to flagged queue.`),
              })
            }
          >
            <Flag className="size-3.5" aria-hidden />
            Flag
          </Button>
        )}
      </div>

      <AssignReviewerModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        application={application}
      />
      <ForwardApplicationModal
        open={forwardOpen}
        onClose={() => setForwardOpen(false)}
        application={application}
      />
      <ConfirmDialog
        open={unflagOpen}
        onClose={() => setUnflagOpen(false)}
        onConfirm={() => {
          flag.mutate(application.id, {
            onSuccess: () => toast.success('Flag removed', `${application.id} no longer flagged.`),
          })
          setUnflagOpen(false)
        }}
        title="Remove flag"
        description={`Clear the flag on ${application.id} for ${application.student}?`}
        confirmLabel="Unflag"
      />
    </>
  )
}

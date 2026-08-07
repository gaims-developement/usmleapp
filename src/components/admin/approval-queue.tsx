import { useMemo, useState } from 'react'
import { Building2, CheckCircle2, Clock, Mail, MessageSquare, ShieldCheck, Stethoscope, UserCheck, XCircle } from 'lucide-react'
import { StatusBadge, roleBadgeMeta } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Textarea } from '@/components/ui/textarea'
import { PageLoader } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/toast'
import { useApprovalRequests, useApproveRequest, useRejectRequest, useRequestInfo } from '@/lib/partnerQueries'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { ApprovalRequest, ApprovalStatus, PartnerType } from '@/services/partnerService'

const typeMeta: Record<PartnerType, { label: string; icon: typeof Building2; tone: string }> = {
  hospital: { label: 'Hospital', icon: Building2, tone: 'bg-brand-50 text-brand-600' },
  doctor: { label: 'Doctor', icon: Stethoscope, tone: 'bg-sky-50 text-sky-600' },
  reviewer: { label: 'Reviewer', icon: UserCheck, tone: 'bg-violet-50 text-violet-600' },
}

function approvalStatusMeta(status: ApprovalStatus): { label: string; tone: 'amber' | 'sky' | 'red' | 'neutral' } {
  switch (status) {
    case 'pending':
      return { label: 'Pending', tone: 'amber' }
    case 'info_requested':
      return { label: 'Info requested', tone: 'sky' }
    case 'rejected':
      return { label: 'Rejected', tone: 'red' }
    default:
      return { label: 'Approved', tone: 'neutral' }
  }
}

function DecisionModal({
  open,
  onClose,
  kind,
  request,
  onSubmit,
  busy,
}: {
  open: boolean
  onClose: () => void
  kind: 'reject' | 'info'
  request: ApprovalRequest | null
  onSubmit: (message: string) => void
  busy: boolean
}) {
  const [message, setMessage] = useState('')
  const isReject = kind === 'reject'

  if (!request) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isReject ? 'Reject registration' : 'Request more info'}
      description={`${request.name} — ${request.email}`}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            size="sm"
            className={isReject ? '!bg-red-600 hover:!bg-red-700' : undefined}
            disabled={busy || !message.trim()}
            onClick={() => onSubmit(message)}
          >
            {isReject ? (
              <>
                <XCircle className="size-4" aria-hidden />
                Reject
              </>
            ) : (
              <>
                <MessageSquare className="size-4" aria-hidden />
                Send request
              </>
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-ink-600">
          {isReject
            ? 'This partner will be marked rejected. They can re-submit later with a fresh registration.'
            : 'The applicant will be asked to provide the missing information before we can proceed.'}
        </p>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-700" htmlFor="decision-message">
            Message to applicant
          </label>
          <Textarea
            id="decision-message"
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={4}
            placeholder={isReject ? 'e.g. License number could not be verified against the medical council registry.' : 'e.g. Please share a copy of your hospital accreditation certificate.'}
          />
        </div>
      </div>
    </Modal>
  )
}

function RequestCard({
  request,
  onApprove,
  onReject,
  onRequestInfo,
  busy,
}: {
  request: ApprovalRequest
  onApprove: () => void
  onReject: () => void
  onRequestInfo: () => void
  busy: boolean
}) {
  const meta = typeMeta[request.type]
  const status = approvalStatusMeta(request.status)
  const role = roleBadgeMeta(request.role)
  const Icon = meta.icon

  return (
    <div className="flex flex-col rounded-3xl border border-ink-200 bg-white p-5 shadow-soft transition-shadow hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={cn('grid size-11 shrink-0 place-items-center rounded-2xl', meta.tone)}>
            <Icon className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-base font-bold text-ink-900">{request.name}</p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-500">
              <span className="flex items-center gap-1">
                <Mail className="size-3" aria-hidden />
                {request.email}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3" aria-hidden />
                {formatDate(request.submittedAt)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <StatusBadge label={status.label} tone={status.tone} />
          <StatusBadge label={role.label} tone={role.tone} />
        </div>
      </div>

      {request.hospitalName && (
        <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-brand-700">
          <Building2 className="size-3.5" aria-hidden />
          {request.hospitalName}
          {request.hospitalCode && <span className="font-mono text-ink-400">{request.hospitalCode}</span>}
        </p>
      )}
      {request.department && <p className="mt-1 text-xs text-ink-500">Department: {request.department}</p>}

      <dl className="mt-4 grid flex-1 grid-cols-1 gap-x-4 gap-y-2 rounded-2xl bg-ink-50 p-4 sm:grid-cols-2">
        {request.details.slice(0, 6).map(detail => (
          <div key={detail.label} className="min-w-0">
            <dt className="text-[10px] font-bold uppercase tracking-wide text-ink-400">{detail.label}</dt>
            <dd className="mt-0.5 truncate text-xs font-semibold text-ink-800">{detail.value}</dd>
          </div>
        ))}
      </dl>

      {request.reviewMessage && (
        <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700">Previous review note</p>
          <p className="mt-0.5 text-xs text-amber-900">{request.reviewMessage}</p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-4">
        {request.status === 'pending' || request.status === 'info_requested' ? (
          <>
            <Button size="sm" onClick={onApprove} disabled={busy}>
              <ShieldCheck className="size-4" aria-hidden />
              Approve
            </Button>
            <Button variant="outline" size="sm" onClick={onRequestInfo} disabled={busy}>
              <MessageSquare className="size-4" aria-hidden />
              Request info
            </Button>
            <Button variant="ghost" size="sm" className="!text-red-600" onClick={onReject} disabled={busy}>
              <XCircle className="size-4" aria-hidden />
              Reject
            </Button>
          </>
        ) : (
          <p className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
            <XCircle className="size-4" aria-hidden />
            Rejected on {formatDate(request.submittedAt)}
          </p>
        )}
      </div>
    </div>
  )
}

export function ApprovalQueue() {
  const requests = useApprovalRequests()
  const approve = useApproveRequest()
  const reject = useRejectRequest()
  const requestInfo = useRequestInfo()
  const toast = useToast()

  const [tab, setTab] = useState<'all' | PartnerType>('all')
  const [rejecting, setRejecting] = useState<ApprovalRequest | null>(null)
  const [asking, setAsking] = useState<ApprovalRequest | null>(null)

  const data = requests.data ?? []
  const busy = approve.isPending || reject.isPending || requestInfo.isPending

  const filtered = useMemo(() => {
    if (tab === 'all') return data
    return data.filter(r => r.type === tab)
  }, [data, tab])

  const counts = useMemo(() => {
    const pending = data.filter(r => r.status === 'pending').length
    const perType = (t: PartnerType) => data.filter(r => r.type === t && r.status !== 'rejected').length
    return { pending, hospital: perType('hospital'), doctor: perType('doctor'), reviewer: perType('reviewer') }
  }, [data])

  if (requests.isLoading) return <PageLoader label="Loading approval requests…" />

  const tabs: { key: 'all' | PartnerType; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: counts.pending },
    { key: 'hospital', label: 'Hospitals', count: counts.hospital },
    { key: 'doctor', label: 'Doctors', count: counts.doctor },
    { key: 'reviewer', label: 'Reviewers', count: counts.reviewer },
  ]

  return (
    <div>
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Awaiting approval</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink-900">{counts.pending}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Hospitals</p>
          <p className="mt-2 font-display text-2xl font-bold text-brand-700">{counts.hospital}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Doctors</p>
          <p className="mt-2 font-display text-2xl font-bold text-sky-700">{counts.doctor}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Reviewers</p>
          <p className="mt-2 font-display text-2xl font-bold text-violet-700">{counts.reviewer}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl bg-ink-100 p-1">
        {tabs.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              'flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors',
              tab === t.key ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800',
            )}
          >
            {t.label}
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-bold',
                tab === t.key ? 'bg-brand-100 text-brand-700' : 'bg-ink-200 text-ink-600',
              )}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-3xl border border-dashed border-ink-300 bg-white/60 px-6 py-16 text-center">
          <div className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="size-6" aria-hidden />
          </div>
          <p className="mt-3 font-display text-sm font-bold text-ink-800">All caught up</p>
          <p className="mt-1 text-sm text-ink-500">No {tab === 'all' ? '' : `${tab} `}registrations waiting for review.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(request => (
            <RequestCard
              key={request.id}
              request={request}
              busy={busy}
              onApprove={() =>
                approve.mutate(request.id, {
                  onSuccess: () => toast.success('Registration approved', `${request.name} can now sign in.`),
                  onError: () => toast.error('Could not approve', 'Try again in a moment.'),
                })
              }
              onReject={() => setRejecting(request)}
              onRequestInfo={() => setAsking(request)}
            />
          ))}
        </div>
      )}

      <DecisionModal
        open={rejecting !== null}
        onClose={() => setRejecting(null)}
        kind="reject"
        request={rejecting}
        busy={busy}
        onSubmit={message =>
          reject.mutate(
            { id: rejecting!.id, message },
            {
              onSuccess: () => {
                toast.success('Registration rejected', `${rejecting!.name} was rejected.`)
                setRejecting(null)
              },
              onError: () => toast.error('Could not reject', 'Try again in a moment.'),
            },
          )
        }
      />
      <DecisionModal
        open={asking !== null}
        onClose={() => setAsking(null)}
        kind="info"
        request={asking}
        busy={busy}
        onSubmit={message =>
          requestInfo.mutate(
            { id: asking!.id, message },
            {
              onSuccess: () => {
                toast.success('Info requested', `${asking!.name} was asked for more details.`)
                setAsking(null)
              },
              onError: () => toast.error('Could not send request', 'Try again in a moment.'),
            },
          )
        }
      />
    </div>
  )
}

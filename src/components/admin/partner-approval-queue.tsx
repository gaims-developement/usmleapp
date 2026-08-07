import { useMemo, useState } from 'react'
import {
  Building2,
  Check,
  ClipboardCheck,
  Eye,
  Info,
  Search,
  Stethoscope,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Select } from '@/components/ui/select'
import { PageLoader } from '@/components/ui/spinner'
import { StatusBadge, type BadgeTone } from '@/components/ui/status-badge'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import {
  useApprovalRequests,
  useApproveRequest,
  useRejectRequest,
  useRequestInfo,
} from '@/lib/partnerQueries'
import { formatDate } from '@/lib/utils'
import type { ApprovalRequest, ApprovalStatus, PartnerType } from '@/services/partnerService'

const roleMeta: Record<PartnerType, { label: string; icon: typeof Building2; tone: BadgeTone }> = {
  hospital: { label: 'Hospital', icon: Building2, tone: 'sky' },
  doctor: { label: 'Doctor / Mentor', icon: Stethoscope, tone: 'brand' },
  reviewer: { label: 'Reviewer', icon: ClipboardCheck, tone: 'violet' },
}

function approvalStatusMeta(status: ApprovalStatus): { label: string; tone: BadgeTone } {
  switch (status) {
    case 'pending':
      return { label: 'Pending', tone: 'amber' }
    case 'info_requested':
      return { label: 'Info requested', tone: 'sky' }
    case 'rejected':
      return { label: 'Rejected', tone: 'red' }
    default:
      return { label: 'Approved', tone: 'brand' }
  }
}

export function PartnerApprovalQueue({ title = 'Partner approval queue' }: { title?: string }) {
  const approvals = useApprovalRequests()
  const approve = useApproveRequest()
  const reject = useRejectRequest()
  const requestInfo = useRequestInfo()
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [type, setType] = useState<'all' | PartnerType>('all')
  const [status, setStatus] = useState<'all' | ApprovalStatus>('all')
  const [viewing, setViewing] = useState<ApprovalRequest | null>(null)
  const [action, setAction] = useState<{ request: ApprovalRequest; kind: 'reject' | 'info' } | null>(null)
  const [message, setMessage] = useState('')

  const requests = approvals.data ?? []
  const filtered = useMemo(() => {
    let result = requests
    if (type !== 'all') result = result.filter(r => r.type === type)
    if (status !== 'all') result = result.filter(r => r.status === status)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(r =>
        [r.name, r.email, r.hospitalCode, r.hospitalName, r.department]
          .filter(Boolean)
          .some(value => value!.toLowerCase().includes(q)),
      )
    }
    return result
  }, [requests, search, status, type])

  if (approvals.isLoading) return <PageLoader label="Loading partner approvals..." />

  const counts = {
    hospital: requests.filter(r => r.type === 'hospital' && r.status === 'pending').length,
    doctor: requests.filter(r => r.type === 'doctor' && r.status === 'pending').length,
    reviewer: requests.filter(r => r.type === 'reviewer' && r.status === 'pending').length,
  }

  const busy = approve.isPending || reject.isPending || requestInfo.isPending

  function openAction(request: ApprovalRequest, kind: 'reject' | 'info') {
    setAction({ request, kind })
    setMessage('')
  }

  function closeAction() {
    setAction(null)
    setMessage('')
  }

  function submitAction() {
    if (!action) return
    const mutation = action.kind === 'reject' ? reject : requestInfo
    mutation.mutate(
      { id: action.request.id, message },
      {
        onSuccess: () => {
          toast.success(
            action.kind === 'reject' ? 'Request rejected' : 'Information requested',
            `${action.request.name} was updated.`,
          )
          closeAction()
        },
        onError: () => toast.error('Could not update request'),
      },
    )
  }

  const columns: DataTableColumn<ApprovalRequest>[] = [
    {
      key: 'name',
      header: 'Request',
      cell: r => {
        const meta = roleMeta[r.type]
        return (
          <div className="flex min-w-72 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink-100 text-ink-600">
              <meta.icon className="size-4.5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink-900">{r.name}</p>
              <p className="truncate text-xs text-ink-500">{r.email}</p>
            </div>
          </div>
        )
      },
      sortValue: r => r.name,
    },
    {
      key: 'type',
      header: 'Type',
      cell: r => <StatusBadge label={roleMeta[r.type].label} tone={roleMeta[r.type].tone} />,
      sortValue: r => r.type,
    },
    {
      key: 'hospital',
      header: 'Hospital',
      cell: r => r.hospitalName ?? r.hospitalCode ?? '-',
    },
    {
      key: 'status',
      header: 'Status',
      cell: r => {
        const meta = approvalStatusMeta(r.status)
        return <StatusBadge label={meta.label} tone={meta.tone} />
      },
      sortValue: r => r.status,
    },
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
      align: 'right',
      cell: r => (
        <div className="flex justify-end gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => setViewing(r)} title="View request">
            <Eye className="size-3.5" aria-hidden />
          </Button>
          {r.status !== 'rejected' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="!text-brand-700"
                disabled={busy}
                onClick={() =>
                  approve.mutate(r.id, {
                    onSuccess: () => toast.success('Account approved', `${r.name} can now log in.`),
                    onError: () => toast.error('Could not approve account'),
                  })
                }
                title="Approve"
              >
                <Check className="size-3.5" aria-hidden />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="!text-sky-700"
                disabled={busy}
                onClick={() => openAction(r, 'info')}
                title="Request additional information"
              >
                <Info className="size-3.5" aria-hidden />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="!text-red-700"
                disabled={busy}
                onClick={() => openAction(r, 'reject')}
                title="Reject"
              >
                <X className="size-3.5" aria-hidden />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <section className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-ink-900">{title}</h2>
          <p className="mt-1 text-sm text-ink-500">
            Pending Hospitals {counts.hospital} · Doctors {counts.doctor} · Reviewers {counts.reviewer}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search requests..."
              className="w-60 pl-9"
              aria-label="Search approval requests"
            />
          </div>
          <Select value={type} onChange={e => setType(e.target.value as 'all' | PartnerType)} className="w-40" aria-label="Filter by type">
            <option value="all">All types</option>
            <option value="hospital">Hospitals</option>
            <option value="doctor">Doctors</option>
            <option value="reviewer">Reviewers</option>
          </Select>
          <Select value={status} onChange={e => setStatus(e.target.value as 'all' | ApprovalStatus)} className="w-44" aria-label="Filter by status">
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="info_requested">Info requested</option>
            <option value="rejected">Rejected</option>
          </Select>
        </div>
      </div>

      <div className="mt-4">
        <DataTable
          columns={columns}
          data={filtered}
          keyField="id"
          pageSize={6}
          emptyTitle="No approval requests"
          emptyDescription="Hospitals, doctors, and reviewers awaiting action will appear here."
        />
      </div>

      <Modal
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewing?.name ?? ''}
        description={viewing ? `${roleMeta[viewing.type].label} registration request` : undefined}
        size="lg"
      >
        {viewing && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <StatusBadge label={roleMeta[viewing.type].label} tone={roleMeta[viewing.type].tone} />
              <StatusBadge label={approvalStatusMeta(viewing.status).label} tone={approvalStatusMeta(viewing.status).tone} />
            </div>
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {viewing.details.map(item => (
                <div key={item.label} className="border-b border-ink-100 pb-2">
                  <dt className="text-xs font-bold uppercase tracking-wide text-ink-400">{item.label}</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-ink-900">{item.value}</dd>
                </div>
              ))}
            </dl>
            {viewing.reviewMessage && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                {viewing.reviewMessage}
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={action !== null}
        onClose={closeAction}
        title={action?.kind === 'reject' ? 'Reject request' : 'Request additional information'}
        description={action ? action.request.name : undefined}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={closeAction} disabled={busy}>
              Cancel
            </Button>
            <Button size="sm" onClick={submitAction} disabled={busy || !message.trim()}>
              {busy ? 'Saving...' : action?.kind === 'reject' ? 'Reject' : 'Send request'}
            </Button>
          </>
        }
      >
        <Textarea
          rows={4}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={action?.kind === 'reject' ? 'Reason for rejection...' : 'What information is needed?'}
        />
      </Modal>
    </section>
  )
}

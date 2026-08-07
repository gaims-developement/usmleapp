import { useMemo, useState } from 'react'
import { LifeBuoy, Plus, Search } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { ButtonLink } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { PageLoader } from '@/components/ui/spinner'
import {
  roleBadgeMeta,
  supportPriorityMeta,
  supportStatusMeta,
  StatusBadge,
} from '@/components/ui/status-badge'
import { useSupportTickets } from '@/lib/adminQueries'
import { formatDate } from '@/lib/utils'
import type { SupportTicket } from '@/mocks/admin/content'

export function SuperAdminSupportPage() {
  const tickets = useSupportTickets()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const filtered = useMemo(() => {
    let result = tickets.data ?? []
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        t => t.subject.toLowerCase().includes(q) || t.from.toLowerCase().includes(q),
      )
    }
    if (status !== 'all') result = result.filter(t => t.status === status)
    return result
  }, [tickets.data, search, status])

  if (tickets.isLoading) return <PageLoader label="Loading support tickets…" />

  const open = (tickets.data ?? []).filter(t => t.status !== 'resolved').length
  const urgent = (tickets.data ?? []).filter(t => t.priority === 'urgent').length

  const columns: DataTableColumn<SupportTicket>[] = [
    {
      key: 'subject',
      header: 'Ticket',
      cell: r => (
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600">
            <LifeBuoy className="size-4.5" aria-hidden />
          </span>
          <div>
            <p className="max-w-md truncate font-semibold text-ink-900">{r.subject}</p>
            <p className="text-xs text-ink-500">{r.id}</p>
          </div>
        </div>
      ),
      sortValue: r => r.subject,
    },
    { key: 'from', header: 'From', cell: r => r.from },
    {
      key: 'role',
      header: 'Role',
      cell: r => {
        const meta = roleBadgeMeta(r.role)
        return <StatusBadge label={meta.label} tone={meta.tone} />
      },
    },
    {
      key: 'priority',
      header: 'Priority',
      cell: r => {
        const meta = supportPriorityMeta(r.priority)
        return <StatusBadge label={meta.label} tone={meta.tone} />
      },
    },
    {
      key: 'status',
      header: 'Status',
      cell: r => {
        const meta = supportStatusMeta(r.status)
        return <StatusBadge label={meta.label} tone={meta.tone} />
      },
    },
    {
      key: 'updated',
      header: 'Updated',
      cell: r => formatDate(r.updatedAt),
      align: 'right',
      sortValue: r => r.updatedAt,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Support"
        subtitle="Inbox for student and partner support tickets."
        actions={
          <ButtonLink to="/dashboard/super-admin/support" size="sm">
            <Plus className="size-4" aria-hidden />
            New ticket
          </ButtonLink>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Open tickets</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink-900">{open}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Urgent</p>
          <p className="mt-2 font-display text-2xl font-bold text-red-600">{urgent}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Resolved</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink-900">
            {(tickets.data ?? []).filter(t => t.status === 'resolved').length}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tickets…"
            className="w-72 pl-9"
            aria-label="Search support tickets"
          />
        </div>
        <Select value={status} onChange={e => setStatus(e.target.value)} className="w-44" aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="in-progress">In progress</option>
          <option value="resolved">Resolved</option>
        </Select>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} data={filtered} keyField="id" pageSize={8} />
      </div>
    </div>
  )
}

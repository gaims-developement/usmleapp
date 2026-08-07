import { useMemo, useState } from 'react'
import { Download, LifeBuoy, Plus, Search } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { PageLoader } from '@/components/ui/spinner'
import {
  roleBadgeMeta,
  supportPriorityMeta,
  supportStatusMeta,
  StatusBadge,
} from '@/components/ui/status-badge'
import { useToast } from '@/components/ui/toast'
import { useCreateTicket, useSetTicketStatus, useSupportTickets } from '@/lib/adminQueries'
import { downloadCsv } from '@/lib/csv'
import { formatDate } from '@/lib/utils'
import type { RoleId } from '@/types/rbac'
import type { SupportPriority, SupportTicket } from '@/mocks/admin/content'

export function AdminSupportPage() {
  const tickets = useSupportTickets()
  const setStatus = useSetTicketStatus()
  const create = useCreateTicket()
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const [newOpen, setNewOpen] = useState(false)
  const [form, setForm] = useState({ subject: '', from: '', role: 'STUDENT' as RoleId, priority: 'medium' as SupportPriority, body: '' })

  const filtered = useMemo(() => {
    let result = tickets.data ?? []
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(t => t.subject.toLowerCase().includes(q) || t.from.toLowerCase().includes(q))
    }
    if (statusFilter !== 'all') result = result.filter(t => t.status === statusFilter)
    if (priorityFilter !== 'all') result = result.filter(t => t.priority === priorityFilter)
    return result
  }, [tickets.data, search, statusFilter, priorityFilter])

  if (tickets.isLoading) return <PageLoader label="Loading support tickets…" />

  const all = tickets.data ?? []
  const open = all.filter(t => t.status !== 'resolved').length
  const urgent = all.filter(t => t.priority === 'urgent' && t.status !== 'resolved').length
  const resolved = all.filter(t => t.status === 'resolved').length

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
    {
      key: 'from',
      header: 'From',
      cell: r => (
        <div>
          <p className="font-medium text-ink-800">{r.from}</p>
          <p className="text-xs text-ink-500">{roleBadgeMeta(r.role).label}</p>
        </div>
      ),
      sortValue: r => r.from,
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
    {
      key: 'actions',
      header: '',
      cell: r => (
        <div className="flex items-center justify-end gap-1.5">
          {r.status === 'open' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setStatus.mutate(
                  { ticketId: r.id, status: 'in-progress' },
                  { onSuccess: () => toast.info('Ticket opened', `${r.id} moved to in progress.`) },
                )
              }
            >
              Start
            </Button>
          )}
          {r.status !== 'resolved' && (
            <Button
              variant="ghost"
              size="sm"
              className="!text-brand-700"
              onClick={() =>
                setStatus.mutate(
                  { ticketId: r.id, status: 'resolved' },
                  { onSuccess: () => toast.success('Ticket resolved', `${r.id} marked resolved.`) },
                )
              }
            >
              Resolve
            </Button>
          )}
          {r.status === 'resolved' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setStatus.mutate(
                  { ticketId: r.id, status: 'open' },
                  { onSuccess: () => toast.info('Ticket reopened', `${r.id} reopened.`) },
                )
              }
            >
              Reopen
            </Button>
          )}
        </div>
      ),
      align: 'right',
    },
  ]

  function handleExport() {
    downloadCsv(
      'support-tickets.csv',
      all.map(t => ({
        id: t.id,
        subject: t.subject,
        from: t.from,
        role: t.role,
        priority: t.priority,
        status: t.status,
        updatedAt: t.updatedAt,
      })),
    )
  }

  const canSubmit = form.subject.trim() && form.from.trim()

  return (
    <div>
      <PageHeader
        title="Support Tickets"
        subtitle="Inbox for student, hospital, doctor, and reviewer requests."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="size-4" aria-hidden />
              Export CSV
            </Button>
            <Button size="sm" onClick={() => setNewOpen(true)}>
              <Plus className="size-4" aria-hidden />
              New ticket
            </Button>
          </>
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
          <p className="mt-2 font-display text-2xl font-bold text-brand-700">{resolved}</p>
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
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-44" aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="in-progress">In progress</option>
          <option value="resolved">Resolved</option>
        </Select>
        <Select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="w-40" aria-label="Filter by priority">
          <option value="all">All priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </Select>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} data={filtered} keyField="id" pageSize={10} />
      </div>

      <Modal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        title="New ticket"
        description="Open a support request on behalf of a user."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setNewOpen(false)} disabled={create.isPending}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!canSubmit || create.isPending}
              onClick={() =>
                create.mutate(
                  { subject: form.subject, from: form.from, role: form.role, priority: form.priority },
                  {
                    onSuccess: t => {
                      toast.success('Ticket created', `${t.id} opened for ${t.from}.`)
                      setNewOpen(false)
                      setForm({ subject: '', from: '', role: 'STUDENT', priority: 'medium', body: '' })
                    },
                    onError: () => toast.error('Could not create ticket'),
                  },
                )
              }
            >
              Create ticket
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="tk-subject">Subject</Label>
            <Input id="tk-subject" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Brief summary of the issue" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tk-from">Reporter</Label>
              <Input id="tk-from" value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))} placeholder="Name or organization" />
            </div>
            <div>
              <Label htmlFor="tk-role">Role</Label>
              <Select id="tk-role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as RoleId }))} aria-label="Select role">
                <option value="STUDENT">Student</option>
                <option value="HOSPITAL">Hospital</option>
                <option value="DOCTOR">Doctor</option>
                <option value="REVIEWER">Reviewer</option>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="tk-priority">Priority</Label>
            <Select id="tk-priority" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as SupportPriority }))} aria-label="Select priority">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="tk-body">Details</Label>
            <Textarea id="tk-body" value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={3} placeholder="Describe the issue…" />
          </div>
        </div>
      </Modal>
    </div>
  )
}

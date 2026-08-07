import { useMemo, useState } from 'react'
import { Download, Flag, Search, UserPlus, Users } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { PageLoader } from '@/components/ui/spinner'
import { StatusBadge, userStatusMeta } from '@/components/ui/status-badge'
import { Avatar } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/toast'
import { useAdminStudents } from '@/lib/adminQueries'
import { downloadCsv } from '@/lib/csv'
import { formatDate } from '@/lib/utils'
import type { AdminStudent } from '@/mocks/admin/students'

export function AdminStudentsPage() {
  const students = useAdminStudents()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [flagFilter, setFlagFilter] = useState('all')
  const [selected, setSelected] = useState<AdminStudent | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')

  const filtered = useMemo(() => {
    let result = students.data ?? []
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.school.toLowerCase().includes(q) ||
          s.country.toLowerCase().includes(q),
      )
    }
    if (status !== 'all') result = result.filter(s => s.status === status)
    if (flagFilter === 'flagged') result = result.filter(s => s.flagged)
    if (flagFilter === 'incomplete') result = result.filter(s => !s.profileComplete || s.docsComplete < s.docsTotal)
    return result
  }, [students.data, search, status, flagFilter])

  if (students.isLoading) return <PageLoader label="Loading students…" />

  const all = students.data ?? []
  const flagged = all.filter(s => s.flagged).length
  const incomplete = all.filter(s => !s.profileComplete || s.docsComplete < s.docsTotal).length
  const active = all.filter(s => s.status === 'active').length

  const columns: DataTableColumn<AdminStudent>[] = [
    {
      key: 'name',
      header: 'Student',
      cell: r => (
        <button type="button" onClick={() => setSelected(r)} className="flex items-center gap-3 text-left">
          <Avatar name={r.name} />
          <span>
            <span className="block font-semibold text-brand-700 hover:underline">{r.name}</span>
            <span className="block text-xs text-ink-500">{r.email}</span>
          </span>
        </button>
      ),
      sortValue: r => r.name,
    },
    { key: 'country', header: 'Country', cell: r => r.country, sortValue: r => r.country },
    { key: 'school', header: 'School', cell: r => <span className="block max-w-48 truncate">{r.school}</span> },
    {
      key: 'step1',
      header: 'Step 1',
      cell: r => <span className="font-semibold">{r.step1}</span>,
      align: 'right',
    },
    {
      key: 'step2',
      header: 'Step 2',
      cell: r => <span className="font-semibold">{r.step2}</span>,
      align: 'right',
    },
    {
      key: 'applications',
      header: 'Apps',
      cell: r => r.applications,
      align: 'right',
      sortValue: r => r.applications,
    },
    {
      key: 'docs',
      header: 'Documents',
      cell: r => (
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-14 overflow-hidden rounded-full bg-ink-100">
            <span
              className={`block h-full rounded-full ${r.docsComplete === r.docsTotal ? 'bg-brand-500' : 'bg-amber-500'}`}
              style={{ width: `${(r.docsComplete / r.docsTotal) * 100}%` }}
            />
          </span>
          <span className="text-xs text-ink-500">
            {r.docsComplete}/{r.docsTotal}
          </span>
        </span>
      ),
      align: 'right',
      sortValue: r => r.docsComplete,
    },
    {
      key: 'profile',
      header: 'Profile',
      cell: r => (
        <StatusBadge
          label={r.profileComplete ? 'Complete' : 'Incomplete'}
          tone={r.profileComplete ? 'brand' : 'amber'}
        />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: r => {
        const meta = userStatusMeta(r.status)
        return (
          <div className="flex items-center gap-1.5">
            {r.flagged && <Flag className="size-3.5 text-red-500" aria-label="Flagged" />}
            <StatusBadge label={meta.label} tone={meta.tone} />
          </div>
        )
      },
    },
    {
      key: 'joined',
      header: 'Joined',
      cell: r => formatDate(r.joinedAt),
      align: 'right',
      sortValue: r => r.joinedAt,
    },
  ]

  function handleExport() {
    downloadCsv(
      'students.csv',
      (students.data ?? []).map(s => ({
        name: s.name,
        email: s.email,
        country: s.country,
        school: s.school,
        step1: s.step1,
        step2: s.step2,
        applications: s.applications,
        documents: `${s.docsComplete}/${s.docsTotal}`,
        profileComplete: s.profileComplete ? 'yes' : 'no',
        flagged: s.flagged ? 'yes' : 'no',
        status: s.status,
        joinedAt: s.joinedAt,
      })),
    )
  }

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle="Registered applicants, document completeness, and profile health."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="size-4" aria-hidden />
              Export CSV
            </Button>
            <Button size="sm" onClick={() => setInviteOpen(true)}>
              <UserPlus className="size-4" aria-hidden />
              Invite student
            </Button>
          </>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Total students</p>
          <div className="mt-2 flex items-center gap-2">
            <Users className="size-5 text-brand-600" aria-hidden />
            <p className="font-display text-2xl font-bold text-ink-900">{all.length}</p>
          </div>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Active</p>
          <p className="mt-2 font-display text-2xl font-bold text-brand-700">{active}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Incomplete profiles</p>
          <p className="mt-2 font-display text-2xl font-bold text-amber-600">{incomplete}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Flagged</p>
          <p className="mt-2 font-display text-2xl font-bold text-red-600">{flagged}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, school, country…"
            className="w-72 pl-9"
            aria-label="Search students"
          />
        </div>
        <Select value={status} onChange={e => setStatus(e.target.value)} className="w-36" aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="invited">Invited</option>
          <option value="suspended">Suspended</option>
        </Select>
        <Select value={flagFilter} onChange={e => setFlagFilter(e.target.value)} className="w-44" aria-label="Filter by flag">
          <option value="all">All students</option>
          <option value="flagged">Flagged</option>
          <option value="incomplete">Incomplete / missing docs</option>
        </Select>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} data={filtered} keyField="id" pageSize={10} />
      </div>

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite student"
        description="Send an invitation link to a new applicant."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!inviteName.trim() || !inviteEmail.trim()}
              onClick={() => {
                toast.success('Invitation sent', `${inviteEmail} was invited to join.`)
                setInviteOpen(false)
                setInviteName('')
                setInviteEmail('')
              }}
            >
              Send invite
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="invite-name">Full name</Label>
            <Input
              id="invite-name"
              value={inviteName}
              onChange={e => setInviteName(e.target.value)}
              placeholder="e.g. Jane Smith"
            />
          </div>
          <div>
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="student@medschool.edu"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ''}
        description={selected?.email}
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <StatusBadge label={selected.profileComplete ? 'Profile complete' : 'Profile incomplete'} tone={selected.profileComplete ? 'brand' : 'amber'} />
              {selected.flagged && <StatusBadge label="Flagged" tone="red" />}
            </div>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {(
                [
                  ['Country', selected.country],
                  ['School', selected.school],
                  ['USMLE Step 1', selected.step1],
                  ['USMLE Step 2 CK', selected.step2],
                  ['Applications', String(selected.applications)],
                  ['Joined', formatDate(selected.joinedAt)],
                ] as [string, string][]
              ).map(([k, v]) => (
                <div key={k} className="border-b border-ink-100 pb-2">
                  <dt className="text-xs font-bold uppercase tracking-wide text-ink-400">{k}</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-ink-900">{v}</dd>
                </div>
              ))}
            </dl>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-semibold text-ink-800">Documents</span>
                <span className="text-ink-500">
                  {selected.docsComplete} of {selected.docsTotal} uploaded
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                <div
                  className={`h-full rounded-full ${selected.docsComplete === selected.docsTotal ? 'bg-brand-500' : 'bg-amber-500'}`}
                  style={{ width: `${(selected.docsComplete / selected.docsTotal) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Download, Search, UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button, ButtonLink } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { Avatar } from '@/components/ui/avatar'
import { PageLoader } from '@/components/ui/spinner'
import { roleBadgeMeta, userStatusMeta, StatusBadge } from '@/components/ui/status-badge'
import { useAdminUsers } from '@/lib/adminQueries'
import { formatDate } from '@/lib/utils'
import { ROLE_IDS } from '@/roles/roles'
import type { AdminUser } from '@/mocks/admin/people'

export function SuperAdminUsersPage() {
  const users = useAdminUsers()
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('all')
  const [status, setStatus] = useState('all')

  const filtered = useMemo(() => {
    let result = users.data ?? []
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      )
    }
    if (role !== 'all') result = result.filter(u => u.role === role)
    if (status !== 'all') result = result.filter(u => u.status === status)
    return result
  }, [users.data, search, role, status])

  if (users.isLoading) return <PageLoader label="Loading users…" />

  const columns: DataTableColumn<AdminUser>[] = [
    {
      key: 'user',
      header: 'User',
      cell: r => (
        <div className="flex items-center gap-3">
          <Avatar name={r.name} />
          <div className="min-w-0">
            <p className="font-semibold text-ink-900">{r.name}</p>
            <p className="truncate text-xs text-ink-500">{r.email}</p>
          </div>
        </div>
      ),
      sortValue: r => r.name,
    },
    {
      key: 'role',
      header: 'Role',
      cell: r => {
        const meta = roleBadgeMeta(r.role)
        return <StatusBadge label={meta.label} tone={meta.tone} />
      },
      sortValue: r => r.role,
    },
    { key: 'org', header: 'Organization', cell: r => r.org ?? '—' },
    { key: 'country', header: 'Country', cell: r => r.country },
    {
      key: 'joined',
      header: 'Joined',
      cell: r => formatDate(r.joinedAt),
      sortValue: r => r.joinedAt,
    },
    {
      key: 'applications',
      header: 'Apps',
      cell: r => <span className="font-medium">{r.applications}</span>,
      align: 'right',
      sortValue: r => r.applications,
    },
    {
      key: 'status',
      header: 'Status',
      cell: r => {
        const meta = userStatusMeta(r.status)
        return <StatusBadge label={meta.label} tone={meta.tone} />
      },
    },
  ]

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Every account on the platform, across all roles."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="size-4" aria-hidden />
              Export
            </Button>
            <ButtonLink to="/dashboard/super-admin/users" size="sm">
              <UserPlus className="size-4" aria-hidden />
              Invite user
            </ButtonLink>
          </>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-72 pl-9"
            aria-label="Search users"
          />
        </div>
        <Select value={role} onChange={e => setRole(e.target.value)} className="w-44" aria-label="Filter by role">
          <option value="all">All roles</option>
          {ROLE_IDS.map(id => (
            <option key={id} value={id}>
              {id.charAt(0) + id.slice(1).toLowerCase().replace('_', ' ')}
            </option>
          ))}
        </Select>
        <Select value={status} onChange={e => setStatus(e.target.value)} className="w-40" aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="invited">Invited</option>
          <option value="suspended">Suspended</option>
        </Select>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} data={filtered} keyField="id" pageSize={8} />
      </div>
    </div>
  )
}

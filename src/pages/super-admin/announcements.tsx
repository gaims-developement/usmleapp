import { useMemo, useState } from 'react'
import { Eye, Megaphone, Plus, Search } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { ButtonLink } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { PageLoader } from '@/components/ui/spinner'
import { announcementStatusMeta, StatusBadge } from '@/components/ui/status-badge'
import { useAnnouncements } from '@/lib/adminQueries'
import { formatDate } from '@/lib/utils'
import type { Announcement } from '@/mocks/admin/content'

export function SuperAdminAnnouncementsPage() {
  const announcements = useAnnouncements()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const filtered = useMemo(() => {
    let result = announcements.data ?? []
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        a => a.title.toLowerCase().includes(q) || a.audience.toLowerCase().includes(q),
      )
    }
    if (status !== 'all') result = result.filter(a => a.status === status)
    return result
  }, [announcements.data, search, status])

  if (announcements.isLoading) return <PageLoader label="Loading announcements…" />

  const totalViews = (announcements.data ?? []).reduce((sum, a) => sum + a.views, 0)

  const columns: DataTableColumn<Announcement>[] = [
    {
      key: 'title',
      header: 'Announcement',
      cell: r => (
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-50 text-accent-600">
            <Megaphone className="size-4.5" aria-hidden />
          </span>
          <p className="max-w-md truncate font-semibold text-ink-900">{r.title}</p>
        </div>
      ),
      sortValue: r => r.title,
    },
    { key: 'audience', header: 'Audience', cell: r => r.audience },
    {
      key: 'status',
      header: 'Status',
      cell: r => {
        const meta = announcementStatusMeta(r.status)
        return <StatusBadge label={meta.label} tone={meta.tone} />
      },
    },
    { key: 'author', header: 'Author', cell: r => r.author },
    {
      key: 'published',
      header: 'Published',
      cell: r => (r.publishedAt === '—' ? '—' : formatDate(r.publishedAt)),
      align: 'right',
    },
    {
      key: 'views',
      header: 'Views',
      cell: r => (
        <span className="inline-flex items-center gap-1 text-ink-700">
          <Eye className="size-4 text-ink-400" aria-hidden />
          {r.views.toLocaleString()}
        </span>
      ),
      align: 'right',
      sortValue: r => r.views,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Announcements"
        subtitle="Communications pushed to students, hospitals, and staff."
        actions={
          <ButtonLink to="/dashboard/super-admin/announcements" size="sm">
            <Plus className="size-4" aria-hidden />
            New announcement
          </ButtonLink>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search announcements…"
            className="w-72 pl-9"
            aria-label="Search announcements"
          />
        </div>
        <Select value={status} onChange={e => setStatus(e.target.value)} className="w-44" aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
          <option value="draft">Draft</option>
        </Select>
        <p className="ml-auto text-sm text-ink-500">
          Total reach: <span className="font-semibold text-ink-800">{totalViews.toLocaleString()}</span> views
        </p>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} data={filtered} keyField="id" pageSize={8} />
      </div>
    </div>
  )
}

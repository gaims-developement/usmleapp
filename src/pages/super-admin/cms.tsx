import { useMemo, useState } from 'react'
import { FileText, Plus, Search } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { ButtonLink } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { PageLoader } from '@/components/ui/spinner'
import { cmsStatusMeta, StatusBadge } from '@/components/ui/status-badge'
import { useCmsPages } from '@/lib/adminQueries'
import { formatDate } from '@/lib/utils'
import type { CmsPage } from '@/mocks/admin/content'

export function SuperAdminCmsPage() {
  const pages = useCmsPages()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const filtered = useMemo(() => {
    let result = pages.data ?? []
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        p => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q),
      )
    }
    if (status !== 'all') result = result.filter(p => p.status === status)
    return result
  }, [pages.data, search, status])

  if (pages.isLoading) return <PageLoader label="Loading CMS…" />

  const columns: DataTableColumn<CmsPage>[] = [
    {
      key: 'page',
      header: 'Page',
      cell: r => (
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink-100 text-ink-600">
            <FileText className="size-4.5" aria-hidden />
          </span>
          <div>
            <p className="font-semibold text-ink-900">{r.title}</p>
            <p className="font-mono text-xs text-ink-500">{r.slug}</p>
          </div>
        </div>
      ),
      sortValue: r => r.title,
    },
    {
      key: 'status',
      header: 'Status',
      cell: r => {
        const meta = cmsStatusMeta(r.status)
        return <StatusBadge label={meta.label} tone={meta.tone} />
      },
    },
    { key: 'updated', header: 'Updated', cell: r => formatDate(r.updatedAt), align: 'right' },
    { key: 'author', header: 'Author', cell: r => r.author, align: 'right' },
    {
      key: 'action',
      header: '',
      cell: () => (
        <span className="text-sm font-semibold text-brand-700">Edit</span>
      ),
      align: 'right',
    },
  ]

  return (
    <div>
      <PageHeader
        title="CMS"
        subtitle="Manage marketing and content pages served to visitors."
        actions={
          <ButtonLink to="/dashboard/super-admin/cms" size="sm">
            <Plus className="size-4" aria-hidden />
            New page
          </ButtonLink>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search pages…"
            className="w-72 pl-9"
            aria-label="Search CMS pages"
          />
        </div>
        <Select value={status} onChange={e => setStatus(e.target.value)} className="w-44" aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </Select>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} data={filtered} keyField="id" pageSize={8} />
      </div>
    </div>
  )
}

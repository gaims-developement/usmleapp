import { useMemo, useState } from 'react'
import { GraduationCap, Plus, Search } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { ButtonLink } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { PageLoader } from '@/components/ui/spinner'
import { programStatusMeta, StatusBadge } from '@/components/ui/status-badge'
import { useAdminPrograms } from '@/lib/adminQueries'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { ProgramRecord } from '@/mocks/admin/operations'

export function SuperAdminProgramsPage() {
  const programs = useAdminPrograms()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const filtered = useMemo(() => {
    let result = programs.data ?? []
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.specialty.toLowerCase().includes(q) ||
          p.hospital.toLowerCase().includes(q),
      )
    }
    if (status !== 'all') result = result.filter(p => p.status === status)
    return result
  }, [programs.data, search, status])

  if (programs.isLoading) return <PageLoader label="Loading programs…" />

  const columns: DataTableColumn<ProgramRecord>[] = [
    {
      key: 'program',
      header: 'Program',
      cell: r => (
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600">
            <GraduationCap className="size-4.5" aria-hidden />
          </span>
          <div>
            <p className="font-semibold text-ink-900">{r.title}</p>
            <p className="text-xs text-ink-500">{r.specialty}</p>
          </div>
        </div>
      ),
      sortValue: r => r.title,
    },
    { key: 'hospital', header: 'Hospital', cell: r => r.hospital },
    { key: 'city', header: 'Location', cell: r => r.city },
    { key: 'duration', header: 'Duration', cell: r => r.duration },
    {
      key: 'fee',
      header: 'Fee',
      cell: r => formatCurrency(r.fee),
      align: 'right',
      sortValue: r => r.fee,
    },
    {
      key: 'capacity',
      header: 'Capacity',
      cell: r => {
        const pct = Math.round((r.filled / r.capacity) * 100)
        return (
          <div className="flex items-center justify-end gap-2">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-ink-100">
              <div
                className={`h-full rounded-full ${pct >= 95 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-brand-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-14 text-right text-xs font-semibold text-ink-700">
              {r.filled}/{r.capacity}
            </span>
          </div>
        )
      },
      align: 'right',
    },
    {
      key: 'status',
      header: 'Status',
      cell: r => {
        const meta = programStatusMeta(r.status)
        return <StatusBadge label={meta.label} tone={meta.tone} />
      },
    },
    { key: 'start', header: 'Starts', cell: r => formatDate(r.startDate), align: 'right' },
  ]

  return (
    <div>
      <PageHeader
        title="Programs"
        subtitle="Elective and rotation programs published across partner hospitals."
        actions={
          <ButtonLink to="/dashboard/super-admin/programs" size="sm">
            <Plus className="size-4" aria-hidden />
            New program
          </ButtonLink>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search programs…"
            className="w-72 pl-9"
            aria-label="Search programs"
          />
        </div>
        <Select value={status} onChange={e => setStatus(e.target.value)} className="w-44" aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="closed">Closed</option>
        </Select>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} data={filtered} keyField="id" pageSize={8} />
      </div>
    </div>
  )
}

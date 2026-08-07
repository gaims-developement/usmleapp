import { useMemo, useState } from 'react'
import { Building2, Plus, Search } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { HospitalCodeManagement } from '@/components/admin/hospital-code-management'
import { ButtonLink } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { PageLoader } from '@/components/ui/spinner'
import { hospitalStatusMeta, tierMeta, StatusBadge } from '@/components/ui/status-badge'
import { useAdminHospitals } from '@/lib/adminQueries'
import { formatDate } from '@/lib/utils'
import type { HospitalRecord } from '@/mocks/admin/people'

export function SuperAdminHospitalsPage() {
  const hospitals = useAdminHospitals()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const filtered = useMemo(() => {
    let result = hospitals.data ?? []
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        h => h.name.toLowerCase().includes(q) || `${h.city}, ${h.state}`.toLowerCase().includes(q),
      )
    }
    if (status !== 'all') result = result.filter(h => h.status === status)
    return result
  }, [hospitals.data, search, status])

  if (hospitals.isLoading) return <PageLoader label="Loading hospitals…" />

  const totals = hospitals.data ?? []
  const active = totals.filter(h => h.status === 'active').length
  const premier = totals.filter(h => h.tier === 'premier').length
  const onboarding = totals.filter(h => h.status === 'onboarding').length

  const columns: DataTableColumn<HospitalRecord>[] = [
    {
      key: 'hospital',
      header: 'Hospital',
      cell: r => (
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <Building2 className="size-4.5" aria-hidden />
          </span>
          <div>
            <p className="font-semibold text-ink-900">{r.name}</p>
            <p className="text-xs text-ink-500">
              {r.city}, {r.state}
            </p>
          </div>
        </div>
      ),
      sortValue: r => r.name,
    },
    {
      key: 'tier',
      header: 'Tier',
      cell: r => {
        const meta = tierMeta(r.tier)
        return <StatusBadge label={meta.label} tone={meta.tone} />
      },
    },
    { key: 'programs', header: 'Programs', cell: r => r.programs, align: 'right' },
    { key: 'doctors', header: 'Doctors', cell: r => r.doctors, align: 'right' },
    { key: 'students', header: 'Students', cell: r => r.students, align: 'right' },
    {
      key: 'rating',
      header: 'Rating',
      cell: r => <span className="font-semibold text-ink-800">{r.rating.toFixed(1)}</span>,
      align: 'right',
      sortValue: r => r.rating,
    },
    {
      key: 'status',
      header: 'Status',
      cell: r => {
        const meta = hospitalStatusMeta(r.status)
        return <StatusBadge label={meta.label} tone={meta.tone} />
      },
    },
    { key: 'joined', header: 'Joined', cell: r => formatDate(r.joinedAt), align: 'right' },
  ]

  return (
    <div>
      <PageHeader
        title="Hospitals"
        subtitle="Partner hospitals, their programs, and onboarding status."
        actions={
          <ButtonLink to="/dashboard/super-admin/hospitals" size="sm">
            <Plus className="size-4" aria-hidden />
            Add hospital
          </ButtonLink>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Active hospitals</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink-900">{active}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Premier partners</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink-900">{premier}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Onboarding</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink-900">{onboarding}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or city…"
            className="w-72 pl-9"
            aria-label="Search hospitals"
          />
        </div>
        <Select value={status} onChange={e => setStatus(e.target.value)} className="w-44" aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="onboarding">Onboarding</option>
        </Select>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} data={filtered} keyField="id" pageSize={8} />
      </div>

      <HospitalCodeManagement />
    </div>
  )
}

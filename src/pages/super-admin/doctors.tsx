import { useMemo, useState } from 'react'
import { Plus, Search, Stethoscope } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { ButtonLink } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { PageLoader } from '@/components/ui/spinner'
import { doctorStatusMeta, StatusBadge } from '@/components/ui/status-badge'
import { useAdminDoctors } from '@/lib/adminQueries'
import { formatDate } from '@/lib/utils'
import type { DoctorRecord } from '@/mocks/admin/people'

export function SuperAdminDoctorsPage() {
  const doctors = useAdminDoctors()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const filtered = useMemo(() => {
    let result = doctors.data ?? []
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        d =>
          d.name.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q) ||
          d.hospital.toLowerCase().includes(q),
      )
    }
    if (status !== 'all') result = result.filter(d => d.status === status)
    return result
  }, [doctors.data, search, status])

  if (doctors.isLoading) return <PageLoader label="Loading doctors…" />

  const columns: DataTableColumn<DoctorRecord>[] = [
    {
      key: 'doctor',
      header: 'Doctor',
      cell: r => (
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-50 text-accent-600">
            <Stethoscope className="size-4.5" aria-hidden />
          </span>
          <p className="font-semibold text-ink-900">{r.name}</p>
        </div>
      ),
      sortValue: r => r.name,
    },
    { key: 'specialty', header: 'Specialty', cell: r => r.specialty },
    { key: 'hospital', header: 'Hospital', cell: r => r.hospital },
    { key: 'students', header: 'Students', cell: r => r.students, align: 'right' },
    { key: 'evaluations', header: 'Evaluations', cell: r => r.evaluations, align: 'right' },
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
        const meta = doctorStatusMeta(r.status)
        return <StatusBadge label={meta.label} tone={meta.tone} />
      },
    },
    { key: 'joined', header: 'Joined', cell: r => formatDate(r.joinedAt), align: 'right' },
  ]

  return (
    <div>
      <PageHeader
        title="Doctors"
        subtitle="Clinical mentors and supervisors available for evaluations and LoRs."
        actions={
          <ButtonLink to="/dashboard/super-admin/doctors" size="sm">
            <Plus className="size-4" aria-hidden />
            Invite doctor
          </ButtonLink>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, specialty, hospital…"
            className="w-72 pl-9"
            aria-label="Search doctors"
          />
        </div>
        <Select value={status} onChange={e => setStatus(e.target.value)} className="w-44" aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="busy">Busy</option>
          <option value="inactive">Inactive</option>
        </Select>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} data={filtered} keyField="id" pageSize={8} />
      </div>
    </div>
  )
}

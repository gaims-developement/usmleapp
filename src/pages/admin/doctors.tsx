import { useMemo, useState } from 'react'
import { Download, Search, Stethoscope, UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { PageLoader } from '@/components/ui/spinner'
import { StatusBadge, doctorStatusMeta } from '@/components/ui/status-badge'
import { Avatar } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/toast'
import { useAdminDoctors, useAdminHospitals, useCreateDoctor } from '@/lib/adminQueries'
import { downloadCsv } from '@/lib/csv'
import { formatDate } from '@/lib/utils'
import type { DoctorRecord } from '@/mocks/admin/people'

export function AdminDoctorsPage() {
  const doctors = useAdminDoctors()
  const hospitals = useAdminHospitals()
  const create = useCreateDoctor()
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [specialty, setSpecialty] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [addOpen, setAddOpen] = useState(false)
  const [addName, setAddName] = useState('')
  const [addSpecialty, setAddSpecialty] = useState('')
  const [addHospital, setAddHospital] = useState('')

  const specialties = useMemo(
    () => Array.from(new Set((doctors.data ?? []).map(d => d.specialty))).sort(),
    [doctors.data],
  )

  const filtered = useMemo(() => {
    let result = doctors.data ?? []
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(d => d.name.toLowerCase().includes(q) || d.hospital.toLowerCase().includes(q))
    }
    if (specialty !== 'all') result = result.filter(d => d.specialty === specialty)
    if (statusFilter !== 'all') result = result.filter(d => d.status === statusFilter)
    return result
  }, [doctors.data, search, specialty, statusFilter])

  if (doctors.isLoading || hospitals.isLoading) return <PageLoader label="Loading doctors…" />

  const all = doctors.data ?? []
  const active = all.filter(d => d.status === 'active').length
  const busy = all.filter(d => d.status === 'busy').length
  const inactive = all.filter(d => d.status === 'inactive').length

  const columns: DataTableColumn<DoctorRecord>[] = [
    {
      key: 'name',
      header: 'Doctor',
      cell: r => (
        <div className="flex items-center gap-3">
          <Avatar name={r.name} />
          <span className="font-semibold text-ink-900">{r.name}</span>
        </div>
      ),
      sortValue: r => r.name,
    },
    { key: 'specialty', header: 'Specialty', cell: r => r.specialty, sortValue: r => r.specialty },
    { key: 'hospital', header: 'Hospital', cell: r => <span className="block max-w-48 truncate">{r.hospital}</span> },
    {
      key: 'students',
      header: 'Students',
      cell: r => r.students,
      align: 'right',
      sortValue: r => r.students,
    },
    {
      key: 'evaluations',
      header: 'Evaluations',
      cell: r => r.evaluations,
      align: 'right',
      sortValue: r => r.evaluations,
    },
    {
      key: 'rating',
      header: 'Rating',
      cell: r => (
        <span className={r.rating >= 4.5 ? 'font-semibold text-brand-700' : 'font-semibold text-ink-700'}>
          {r.rating || '—'}
        </span>
      ),
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
      'doctors.csv',
      all.map(d => ({
        name: d.name,
        specialty: d.specialty,
        hospital: d.hospital,
        students: d.students,
        evaluations: d.evaluations,
        rating: d.rating,
        status: d.status,
        joinedAt: d.joinedAt,
      })),
    )
  }

  return (
    <div>
      <PageHeader
        title="Doctors"
        subtitle="Attending physicians and mentors across partner hospitals."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="size-4" aria-hidden />
              Export CSV
            </Button>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <UserPlus className="size-4" aria-hidden />
              Register doctor
            </Button>
          </>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Total doctors</p>
          <div className="mt-2 flex items-center gap-2">
            <Stethoscope className="size-5 text-brand-600" aria-hidden />
            <p className="font-display text-2xl font-bold text-ink-900">{all.length}</p>
          </div>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Active</p>
          <p className="mt-2 font-display text-2xl font-bold text-brand-700">{active}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Busy</p>
          <p className="mt-2 font-display text-2xl font-bold text-amber-600">{busy}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Inactive</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink-600">{inactive}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search doctor or hospital…"
            className="w-64 pl-9"
            aria-label="Search doctors"
          />
        </div>
        <Select value={specialty} onChange={e => setSpecialty(e.target.value)} className="w-44" aria-label="Filter by specialty">
          <option value="all">All specialties</option>
          {specialties.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-36" aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="busy">Busy</option>
          <option value="inactive">Inactive</option>
        </Select>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} data={filtered} keyField="id" pageSize={10} />
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Register doctor"
        description="Add an attending physician or mentor to a partner hospital."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setAddOpen(false)} disabled={create.isPending}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!addName.trim() || !addSpecialty.trim() || !addHospital || create.isPending}
              onClick={() =>
                create.mutate(
                  { name: addName, specialty: addSpecialty, hospital: addHospital },
                  {
                    onSuccess: d => {
                      toast.success('Doctor registered', `${d.name} added to ${d.hospital}.`)
                      setAddOpen(false)
                      setAddName('')
                      setAddSpecialty('')
                      setAddHospital('')
                    },
                    onError: () => toast.error('Could not register doctor'),
                  },
                )
              }
            >
              Register
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="doc-name">Full name</Label>
            <Input id="doc-name" value={addName} onChange={e => setAddName(e.target.value)} placeholder="e.g. Dr. Jane Doe" />
          </div>
          <div>
            <Label htmlFor="doc-specialty">Specialty</Label>
            <Input id="doc-specialty" value={addSpecialty} onChange={e => setAddSpecialty(e.target.value)} placeholder="e.g. Internal Medicine" list="specialty-suggestions" />
            <datalist id="specialty-suggestions">
              {specialties.map(s => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
          <div>
            <Label htmlFor="doc-hospital">Hospital</Label>
            <Select id="doc-hospital" value={addHospital} onChange={e => setAddHospital(e.target.value)} aria-label="Select hospital">
              <option value="">Select a hospital…</option>
              {(hospitals.data ?? [])
                .filter(h => h.status === 'active')
                .map(h => (
                  <option key={h.id} value={h.name}>
                    {h.name}
                  </option>
                ))}
            </Select>
          </div>
        </div>
      </Modal>
    </div>
  )
}

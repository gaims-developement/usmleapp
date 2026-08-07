import { useMemo, useState } from 'react'
import { Download, Search } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { PageLoader } from '@/components/ui/spinner'
import { HospitalApplicationsTable } from '@/components/hospital/applications-table'
import { useHospitalApplications } from '@/lib/hospitalQueries'
import { downloadCsv } from '@/lib/csv'
import { hospitalDepartments } from '@/mocks/hospital/programs'

const statuses = [
  ['all', 'All statuses'],
  ['awaiting_decision', 'Awaiting decision'],
  ['accepted', 'Accepted'],
  ['rejected', 'Rejected'],
  ['waitlisted', 'Waitlisted'],
  ['scheduled', 'Scheduled'],
  ['completed', 'Completed'],
]

export function HospitalApplicationsPage() {
  const applications = useHospitalApplications()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [department, setDepartment] = useState('all')

  const filtered = useMemo(() => {
    let result = applications.data ?? []
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        a =>
          a.id.toLowerCase().includes(q) ||
          a.student.name.toLowerCase().includes(q) ||
          a.student.country.toLowerCase().includes(q) ||
          a.program.name.toLowerCase().includes(q),
      )
    }
    if (status !== 'all') result = result.filter(a => a.status === status)
    if (department !== 'all') result = result.filter(a => a.program.department === department)
    return result
  }, [applications.data, search, status, department])

  if (applications.isLoading) return <PageLoader label="Loading applications…" />

  const all = applications.data ?? []

  function handleExport() {
    downloadCsv(
      'hospital-applications.csv',
      filtered.map(a => ({
        id: a.id,
        student: a.student.name,
        country: a.student.country,
        program: a.program.name,
        department: a.program.department,
        appliedAt: a.appliedAt,
        reviewedBy: a.reviewedBy,
        status: a.status,
        doctor: a.doctor?.name ?? '',
        rotationStart: a.rotationStart ?? '',
        rotationEnd: a.rotationEnd ?? '',
      })),
    )
  }

  return (
    <div>
      <PageHeader
        title="Applications"
        subtitle="Applications forwarded by the review team for seat confirmation."
        actions={
          <Button variant="outline" size="sm" onClick={handleExport} disabled={filtered.length === 0}>
            <Download className="size-4" aria-hidden />
            Export CSV
          </Button>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Total received</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink-900">{all.length}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Needs decision</p>
          <p className="mt-2 font-display text-2xl font-bold text-amber-600">
            {all.filter(a => a.status === 'awaiting_decision').length}
          </p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Scheduled</p>
          <p className="mt-2 font-display text-2xl font-bold text-violet-600">
            {all.filter(a => a.status === 'scheduled').length}
          </p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Completed</p>
          <p className="mt-2 font-display text-2xl font-bold text-emerald-600">
            {all.filter(a => a.status === 'completed').length}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search ID, student, country…"
            className="w-72 pl-9"
            aria-label="Search applications"
          />
        </div>
        <Select value={status} onChange={e => setStatus(e.target.value)} className="w-44" aria-label="Filter by status">
          {statuses.map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </Select>
        <Select value={department} onChange={e => setDepartment(e.target.value)} className="w-56" aria-label="Filter by department">
          <option value="all">All departments</option>
          {hospitalDepartments.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </Select>
      </div>

      <div className="mt-6">
        <HospitalApplicationsTable data={filtered} pageSize={10} />
      </div>
    </div>
  )
}

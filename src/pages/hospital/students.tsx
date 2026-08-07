import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Search } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { PageLoader } from '@/components/ui/spinner'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { StatusBadge, hospitalAppStatusMeta } from '@/components/ui/status-badge'
import { Avatar } from '@/components/ui/avatar'
import { useHospitalApplications } from '@/lib/hospitalQueries'
import { downloadCsv } from '@/lib/csv'
import type { HospitalApplicationJoined } from '@/services/hospitalService'

interface StudentRow {
  id: string
  name: string
  country: string
  medicalSchool: string
  graduationYear: number
  applications: HospitalApplicationJoined[]
  latestStatus: string
}

export function HospitalStudentsPage() {
  const applications = useHospitalApplications()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const rows = useMemo(() => {
    const map = new Map<string, StudentRow>()
    for (const a of applications.data ?? []) {
      const existing = map.get(a.studentId)
      if (existing) {
        existing.applications.push(a)
      } else {
        map.set(a.studentId, {
          id: a.studentId,
          name: a.student.name,
          country: a.student.country,
          medicalSchool: a.student.medicalSchool,
          graduationYear: a.student.graduationYear,
          applications: [a],
          latestStatus: a.status,
        })
      }
    }
    for (const row of map.values()) {
      row.applications.sort((a, b) => b.appliedAt.localeCompare(a.appliedAt))
      row.latestStatus = row.applications[0].status
    }
    return Array.from(map.values())
  }, [applications.data])

  const filtered = useMemo(() => {
    let result = rows
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        r => r.name.toLowerCase().includes(q) || r.country.toLowerCase().includes(q) || r.medicalSchool.toLowerCase().includes(q),
      )
    }
    if (status !== 'all') result = result.filter(r => r.latestStatus === status)
    return result
  }, [rows, search, status])

  if (applications.isLoading) return <PageLoader label="Loading students…" />

  function handleExport() {
    downloadCsv(
      'hospital-students.csv',
      rows.map(r => ({
        id: r.id,
        name: r.name,
        country: r.country,
        medicalSchool: r.medicalSchool,
        graduationYear: r.graduationYear,
        applications: r.applications.length,
        latestStatus: r.latestStatus,
      })),
    )
  }

  const columns: DataTableColumn<StudentRow>[] = [
    {
      key: 'name',
      header: 'Student',
      sortValue: r => r.name,
      cell: r => (
        <div className="flex items-center gap-3">
          <Avatar name={r.name} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink-900">{r.name}</p>
            <p className="truncate text-xs text-ink-500">{r.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'country',
      header: 'Country',
      sortValue: r => r.country,
      cell: r => <span className="text-ink-700">{r.country}</span>,
    },
    {
      key: 'school',
      header: 'Medical school',
      sortValue: r => r.medicalSchool,
      cell: r => <span className="text-ink-700">{r.medicalSchool}</span>,
    },
    {
      key: 'grad',
      header: 'Graduation',
      sortValue: r => r.graduationYear,
      cell: r => <span className="text-ink-700">{r.graduationYear}</span>,
    },
    {
      key: 'apps',
      header: 'Applications',
      sortValue: r => r.applications.length,
      cell: r => <span className="font-semibold text-ink-800">{r.applications.length}</span>,
    },
    {
      key: 'latest',
      header: 'Latest status',
      sortValue: r => r.latestStatus,
      cell: r => <StatusBadge label={hospitalAppStatusMeta(r.latestStatus).label} tone={hospitalAppStatusMeta(r.latestStatus).tone} />,
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      cell: r => (
        <button
          type="button"
          onClick={() => navigate(`/dashboard/hospital/applications/${r.applications[0].id}`)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-ink-200 px-3.5 py-1.5 text-xs font-semibold text-ink-700 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
        >
          View application
        </button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle="All students who have applied or rotated at your hospital."
        actions={
          <Button variant="outline" size="sm" onClick={handleExport} disabled={rows.length === 0}>
            <Download className="size-4" aria-hidden />
            Export CSV
          </Button>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Total students</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink-900">{rows.length}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Currently rotating</p>
          <p className="mt-2 font-display text-2xl font-bold text-violet-600">
            {rows.filter(r => r.latestStatus === 'scheduled').length}
          </p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Completed rotations</p>
          <p className="mt-2 font-display text-2xl font-bold text-emerald-600">
            {rows.filter(r => r.latestStatus === 'completed').length}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search students…"
            className="w-72 pl-9"
            aria-label="Search students"
          />
        </div>
        <Select value={status} onChange={e => setStatus(e.target.value)} className="w-44" aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="awaiting_decision">Awaiting decision</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="waitlisted">Waitlisted</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
        </Select>
      </div>

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={filtered}
          keyField="id"
          pageSize={10}
          loading={false}
          emptyTitle="No students found"
          emptyDescription="Students who apply to your hospital will appear here."
        />
      </div>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { CheckCircle2, ClipboardList, Download, FileWarning, Search, Timer } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { PageLoader } from '@/components/ui/spinner'
import { ReviewerQueueList } from '@/components/reviewer/queue-list'
import { useReviewerApplications } from '@/lib/reviewerQueries'
import { downloadCsv } from '@/lib/csv'
import { reviewerHospitals, reviewerSpecialties } from '@/mocks/reviewer/applications'

const statuses = [
  ['all', 'All statuses'],
  ['submitted', 'Submitted'],
  ['under_review', 'Under review'],
  ['changes_requested', 'Changes requested'],
  ['approved', 'Approved'],
  ['rejected', 'Rejected'],
  ['forwarded', 'Forwarded'],
]

export function ReviewerApplicationsPage() {
  const applications = useReviewerApplications()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [hospital, setHospital] = useState('all')
  const [specialty, setSpecialty] = useState('all')

  const filtered = useMemo(() => {
    let result = applications.data ?? []
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        a =>
          a.id.toLowerCase().includes(q) ||
          a.student.name.toLowerCase().includes(q) ||
          a.student.country.toLowerCase().includes(q) ||
          a.hospital.toLowerCase().includes(q),
      )
    }
    if (status !== 'all') result = result.filter(a => a.status === status)
    if (hospital !== 'all') result = result.filter(a => a.hospital === hospital)
    if (specialty !== 'all') result = result.filter(a => a.specialty === specialty)
    return result
  }, [applications.data, search, status, hospital, specialty])

  if (applications.isLoading) return <PageLoader label="Loading applications…" />

  function handleExport() {
    downloadCsv(
      'reviewer-applications.csv',
      filtered.map(a => ({
        id: a.id,
        student: a.student.name,
        country: a.student.country,
        hospital: a.hospital,
        specialty: a.specialty,
        submittedAt: a.submittedAt,
        status: a.status,
      })),
    )
  }

  return (
    <div>
      <PageHeader
        title="Applications"
        subtitle="All applications assigned to you for review."
        actions={
          <Button variant="outline" size="sm" onClick={handleExport} disabled={filtered.length === 0}>
            <Download className="size-4" aria-hidden />
            Export CSV
          </Button>
        }
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-white p-4 shadow-soft">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700">
            <ClipboardList className="size-4.5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs text-ink-500">Assigned to you</p>
            <p className="font-display text-xl font-bold text-ink-900">{applications.data?.length ?? 0}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-white p-4 shadow-soft">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
            <Timer className="size-4.5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs text-ink-500">Needs decision</p>
            <p className="font-display text-xl font-bold text-amber-600">
              {(applications.data ?? []).filter(a => a.status === 'submitted' || a.status === 'under_review').length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-white p-4 shadow-soft">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sky-100 text-sky-700">
            <FileWarning className="size-4.5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs text-ink-500">Awaiting documents</p>
            <p className="font-display text-xl font-bold text-sky-600">
              {(applications.data ?? []).filter(a => a.documents.some(d => d.verification === 'requires_update' || d.verification === 'rejected')).length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-white p-4 shadow-soft">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="size-4.5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs text-ink-500">Decided</p>
            <p className="font-display text-xl font-bold text-brand-600">
              {(applications.data ?? []).filter(a => a.status === 'approved' || a.status === 'rejected' || a.status === 'forwarded').length}
            </p>
          </div>
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
        <Select value={hospital} onChange={e => setHospital(e.target.value)} className="w-52" aria-label="Filter by hospital">
          <option value="all">All hospitals</option>
          {reviewerHospitals.map(h => (
            <option key={h} value={h}>{h}</option>
          ))}
        </Select>
        <Select value={specialty} onChange={e => setSpecialty(e.target.value)} className="w-52" aria-label="Filter by specialty">
          <option value="all">All specialties</option>
          {reviewerSpecialties.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </div>

      <div className="mt-6">
        <ReviewerQueueList data={filtered} pageSize={10} />
      </div>
    </div>
  )
}

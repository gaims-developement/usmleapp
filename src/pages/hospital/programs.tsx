import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Archive, PauseCircle, Play, Plus, Search } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { PageLoader } from '@/components/ui/spinner'
import { StatusBadge, hospitalProgramMeta } from '@/components/ui/status-badge'
import { useHospitalPrograms, useSetProgramStatus } from '@/lib/hospitalQueries'
import { hospitalDepartments } from '@/mocks/hospital/programs'

export function HospitalProgramsPage() {
  const programs = useHospitalPrograms()
  const setStatus = useSetProgramStatus()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('all')
  const [status, setStatusFilter] = useState('all')

  const filtered = useMemo(() => {
    let result = programs.data ?? []
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.specialty.toLowerCase().includes(q))
    }
    if (department !== 'all') result = result.filter(p => p.department === department)
    if (status !== 'all') result = result.filter(p => p.status === status)
    return result
  }, [programs.data, search, department, status])

  if (programs.isLoading) return <PageLoader label="Loading programs…" />

  return (
    <div>
      <PageHeader
        title="Elective Programs"
        subtitle="Manage rotations your hospital offers to international students."
        actions={
          <Button size="sm" onClick={() => navigate('/dashboard/hospital/programs/new')}>
            <Plus className="size-4" aria-hidden />
            New program
          </Button>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Total programs</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink-900">{programs.data?.length ?? 0}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Published</p>
          <p className="mt-2 font-display text-2xl font-bold text-brand-600">
            {(programs.data ?? []).filter(p => p.status === 'published').length}
          </p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Paused</p>
          <p className="mt-2 font-display text-2xl font-bold text-amber-600">
            {(programs.data ?? []).filter(p => p.status === 'paused').length}
          </p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Open seats</p>
          <p className="mt-2 font-display text-2xl font-bold text-sky-600">
            {(programs.data ?? []).reduce((s, p) => s + Math.max(0, p.seats - p.filled), 0)}
          </p>
        </div>
      </div>

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
        <Select value={department} onChange={e => setDepartment(e.target.value)} className="w-56" aria-label="Filter by department">
          <option value="all">All departments</option>
          {hospitalDepartments.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </Select>
        <Select value={status} onChange={e => setStatusFilter(e.target.value)} className="w-40" aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="paused">Paused</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </Select>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map(p => {
          const pct = p.seats ? Math.round((p.filled / p.seats) * 100) : 0
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => navigate(`/dashboard/hospital/programs/${p.id}`)}
              className="group flex cursor-pointer flex-col rounded-3xl border border-ink-200 bg-white p-5 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{p.id}</p>
                  <h3 className="mt-1 font-display text-base font-bold text-ink-900">{p.name}</h3>
                  <p className="mt-0.5 text-sm text-ink-500">{p.specialty}</p>
                </div>
                <StatusBadge label={hospitalProgramMeta(p.status).label} tone={hospitalProgramMeta(p.status).tone} />
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between text-ink-600">
                  <span>{p.department}</span>
                  <span className="font-semibold text-ink-800">{p.duration}</span>
                </div>
                <div className="flex items-center justify-between text-ink-600">
                  <span>Fee</span>
                  <span className="font-semibold text-ink-800">${p.fee.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-ink-500">
                  <span>Seats filled</span>
                  <span>{p.filled}/{p.seats}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-100">
                  <div
                    className={pct >= 100 ? 'h-full rounded-full bg-red-500' : 'h-full rounded-full bg-brand-500'}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-4">
                <span className="text-xs text-ink-400">Deadline {p.deadline}</span>
                <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                  {p.status === 'published' && (
                    <button
                      type="button"
                      title="Pause program"
                      onClick={() => setStatus.mutate({ programId: p.id, status: 'paused' })}
                      className="grid size-8 cursor-pointer place-items-center rounded-lg text-ink-500 transition-colors hover:bg-amber-50 hover:text-amber-600"
                    >
                      <PauseCircle className="size-4" aria-hidden />
                    </button>
                  )}
                  {p.status === 'paused' && (
                    <button
                      type="button"
                      title="Resume program"
                      onClick={() => setStatus.mutate({ programId: p.id, status: 'published' })}
                      className="grid size-8 cursor-pointer place-items-center rounded-lg text-ink-500 transition-colors hover:bg-brand-50 hover:text-brand-700"
                    >
                      <Play className="size-4" aria-hidden />
                    </button>
                  )}
                  {p.status !== 'archived' && (
                    <button
                      type="button"
                      title="Archive program"
                      onClick={() => setStatus.mutate({ programId: p.id, status: 'archived' })}
                      className="grid size-8 cursor-pointer place-items-center rounded-lg text-ink-500 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Archive className="size-4" aria-hidden />
                    </button>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-6 rounded-3xl border border-dashed border-ink-200 bg-white p-12 text-center">
          <p className="font-display text-base font-bold text-ink-900">No programs found</p>
          <p className="mt-1 text-sm text-ink-500">Try adjusting your filters or create a new program.</p>
        </div>
      )}
    </div>
  )
}

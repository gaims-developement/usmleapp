import { useMemo, useState } from 'react'
import { Download, GraduationCap, Plus, Search } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { PageLoader } from '@/components/ui/spinner'
import { StatusBadge, programStatusMeta } from '@/components/ui/status-badge'
import { useToast } from '@/components/ui/toast'
import { useAdminHospitals, useAdminPrograms, useCreateProgram, useSetProgramStatus } from '@/lib/adminQueries'
import { downloadCsv } from '@/lib/csv'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { ProgramRecord } from '@/mocks/admin/operations'

export function AdminProgramsPage() {
  const programs = useAdminPrograms()
  const hospitals = useAdminHospitals()
  const create = useCreateProgram()
  const setStatus = useSetProgramStatus()
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    specialty: '',
    hospital: '',
    city: '',
    duration: '',
    fee: '',
    capacity: '',
    startDate: '',
  })

  const filtered = useMemo(() => {
    let result = programs.data ?? []
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.hospital.toLowerCase().includes(q) ||
          p.specialty.toLowerCase().includes(q),
      )
    }
    if (statusFilter !== 'all') result = result.filter(p => p.status === statusFilter)
    return result
  }, [programs.data, search, statusFilter])

  if (programs.isLoading || hospitals.isLoading) return <PageLoader label="Loading programs…" />

  const all = programs.data ?? []
  const published = all.filter(p => p.status === 'published').length
  const drafts = all.filter(p => p.status === 'draft').length
  const totalSeats = all.reduce((s, p) => s + p.capacity, 0)
  const filledSeats = all.reduce((s, p) => s + p.filled, 0)
  const fillRate = totalSeats ? Math.round((filledSeats / totalSeats) * 100) : 0

  const columns: DataTableColumn<ProgramRecord>[] = [
    {
      key: 'title',
      header: 'Program',
      cell: r => (
        <div>
          <p className="font-semibold text-ink-900">{r.title}</p>
          <p className="text-xs text-ink-500">{r.specialty}</p>
        </div>
      ),
      sortValue: r => r.title,
    },
    { key: 'hospital', header: 'Hospital', cell: r => <span className="block max-w-48 truncate">{r.hospital}</span> },
    { key: 'city', header: 'City', cell: r => r.city },
    { key: 'duration', header: 'Duration', cell: r => r.duration },
    {
      key: 'fee',
      header: 'Fee',
      cell: r => formatCurrency(r.fee),
      align: 'right',
      sortValue: r => r.fee,
    },
    {
      key: 'filled',
      header: 'Fill rate',
      cell: r => {
        const pct = Math.round((r.filled / r.capacity) * 100)
        return (
          <div className="flex items-center justify-end gap-2">
            <span className="h-1.5 w-14 overflow-hidden rounded-full bg-ink-100">
              <span
                className={`block h-full rounded-full ${pct >= 80 ? 'bg-red-500' : pct >= 50 ? 'bg-amber-500' : 'bg-brand-500'}`}
                style={{ width: `${pct}%` }}
              />
            </span>
            <span className="w-12 text-right text-xs text-ink-500">
              {r.filled}/{r.capacity}
            </span>
          </div>
        )
      },
      align: 'right',
      sortValue: r => r.filled,
    },
    {
      key: 'status',
      header: 'Status',
      cell: r => {
        const meta = programStatusMeta(r.status)
        return <StatusBadge label={meta.label} tone={meta.tone} />
      },
    },
    {
      key: 'start',
      header: 'Starts',
      cell: r => formatDate(r.startDate),
      align: 'right',
      sortValue: r => r.startDate,
    },
    {
      key: 'actions',
      header: '',
      cell: r => {
        if (r.status === 'draft') {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setStatus.mutate(
                  { programId: r.id, status: 'published' },
                  { onSuccess: () => toast.success('Program published', r.title) },
                )
              }
            >
              Publish
            </Button>
          )
        }
        if (r.status === 'published') {
          return (
            <Button
              variant="ghost"
              size="sm"
              className="!text-red-600"
              onClick={() =>
                setStatus.mutate(
                  { programId: r.id, status: 'closed' },
                  { onSuccess: () => toast.info('Program closed', r.title) },
                )
              }
            >
              Close
            </Button>
          )
        }
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setStatus.mutate(
                { programId: r.id, status: 'published' },
                { onSuccess: () => toast.success('Program reopened', r.title) },
              )
            }
          >
            Reopen
          </Button>
        )
      },
      align: 'right',
    },
  ]

  function handleExport() {
    downloadCsv(
      'programs.csv',
      all.map(p => ({
        title: p.title,
        specialty: p.specialty,
        hospital: p.hospital,
        city: p.city,
        duration: p.duration,
        fee: p.fee,
        filled: p.filled,
        capacity: p.capacity,
        status: p.status,
        startDate: p.startDate,
      })),
    )
  }

  const canSubmit = form.title.trim() && form.specialty.trim() && form.hospital && form.city.trim() && form.duration.trim() && Number(form.capacity) > 0 && form.startDate

  return (
    <div>
      <PageHeader
        title="Elective Programs"
        subtitle="Rotations and electives offered across the partner network."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="size-4" aria-hidden />
              Export CSV
            </Button>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="size-4" aria-hidden />
              Create program
            </Button>
          </>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Total programs</p>
          <div className="mt-2 flex items-center gap-2">
            <GraduationCap className="size-5 text-brand-600" aria-hidden />
            <p className="font-display text-2xl font-bold text-ink-900">{all.length}</p>
          </div>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Published</p>
          <p className="mt-2 font-display text-2xl font-bold text-brand-700">{published}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Drafts</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink-600">{drafts}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Fill rate</p>
          <p className="mt-2 font-display text-2xl font-bold text-amber-600">{fillRate}%</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search program, hospital…"
            className="w-72 pl-9"
            aria-label="Search programs"
          />
        </div>
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-40" aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="closed">Closed</option>
        </Select>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} data={filtered} keyField="id" pageSize={10} />
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Create program"
        description="Draft a new elective. It will start in draft status."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setAddOpen(false)} disabled={create.isPending}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!canSubmit || create.isPending}
              onClick={() =>
                create.mutate(
                  {
                    title: form.title,
                    specialty: form.specialty,
                    hospital: form.hospital,
                    city: form.city,
                    duration: form.duration,
                    fee: Number(form.fee) || 0,
                    capacity: Number(form.capacity),
                    startDate: form.startDate,
                  },
                  {
                    onSuccess: p => {
                      toast.success('Program created', `${p.title} saved as draft.`)
                      setAddOpen(false)
                      setForm({ title: '', specialty: '', hospital: '', city: '', duration: '', fee: '', capacity: '', startDate: '' })
                    },
                    onError: () => toast.error('Could not create program'),
                  },
                )
              }
            >
              Create draft
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="prg-title">Program title</Label>
            <Input id="prg-title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. IM Core Clerkship" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prg-specialty">Specialty</Label>
              <Input id="prg-specialty" value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} placeholder="e.g. Internal Medicine" />
            </div>
            <div>
              <Label htmlFor="prg-duration">Duration</Label>
              <Input id="prg-duration" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="e.g. 8 weeks" />
            </div>
          </div>
          <div>
            <Label htmlFor="prg-hospital">Hospital</Label>
            <Select id="prg-hospital" value={form.hospital} onChange={e => setForm(f => ({ ...f, hospital: e.target.value, city: (hospitals.data ?? []).find(h => h.name === e.target.value) ? `${(hospitals.data ?? []).find(h => h.name === e.target.value)!.city}, ${(hospitals.data ?? []).find(h => h.name === e.target.value)!.state}` : '' }))} aria-label="Select hospital">
              <option value="">Select a hospital…</option>
              {(hospitals.data ?? [])
                .filter(h => h.status === 'active')
                .map(h => (
                  <option key={h.id} value={h.name}>
                    {h.name} · {h.city}, {h.state}
                  </option>
                ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prg-city">City</Label>
              <Input id="prg-city" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Cleveland, OH" />
            </div>
            <div>
              <Label htmlFor="prg-start">Start date</Label>
              <Input id="prg-start" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prg-fee">Fee (USD)</Label>
              <Input id="prg-fee" type="number" min={0} value={form.fee} onChange={e => setForm(f => ({ ...f, fee: e.target.value }))} placeholder="1400" />
            </div>
            <div>
              <Label htmlFor="prg-capacity">Capacity</Label>
              <Input id="prg-capacity" type="number" min={1} value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} placeholder="30" />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

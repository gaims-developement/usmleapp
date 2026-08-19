import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { PageLoader } from '@/components/ui/spinner'
import { StatusBadge, hospitalProgramMeta } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { HospitalApplicationsTable } from '@/components/hospital/applications-table'
import {
  useCreateHospitalProgram,
  useHospitalApplications,
  useHospitalProfile,
  useHospitalProgram,
  useUpdateHospitalProgram,
} from '@/lib/hospitalQueries'
import { hospitalDepartments } from '@/mocks/hospital/programs'
import type { HospitalProgramInput } from '@/services/hospitalService'

const EMPTY: HospitalProgramInput = {
  name: '',
  department: hospitalDepartments[0],
  specialty: '',
  duration: '4 weeks',
  fee: 2500,
  seats: 4,
  deadline: '',
  description: '',
  eligibility: '',
  status: 'draft',
}

export function HospitalProgramDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const isNew = !id || id === 'new'
  const program = useHospitalProgram(isNew ? '' : id)
  const applications = useHospitalApplications()
  const hospital = useHospitalProfile()
  const create = useCreateHospitalProgram()
  const update = useUpdateHospitalProgram()

  const [form, setForm] = useState<HospitalProgramInput>(EMPTY)
  const [loaded, setLoaded] = useState(false)

  const programApps = (applications.data ?? []).filter(a => a.programId === id)

  useEffect(() => {
    if (isNew || !program.data || loaded) return
    const p = program.data
    setForm({
      name: p.name,
      department: p.department,
      specialty: p.specialty,
      duration: p.duration,
      fee: p.fee,
      seats: p.seats,
      deadline: p.deadline,
      description: p.description,
      eligibility: p.eligibility,
      status: p.status,
    })
    setLoaded(true)
  }, [program.data, isNew, loaded])

  if (!isNew && program.isLoading) return <PageLoader label="Loading program…" />

  if (!isNew && program.isError && !program.data) {
    return (
      <div>
        <button
          type="button"
          onClick={() => navigate('/dashboard/hospital/programs')}
          className="mb-4 inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-ink-500 transition-colors hover:text-ink-900"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to programs
        </button>
        <div className="rounded-3xl border border-ink-200 bg-white p-12 text-center shadow-soft">
          <p className="font-display text-base font-bold text-ink-900">Program not found</p>
          <p className="mt-1 text-sm text-ink-500">
            This program may have been removed, or you don't have access to it.
          </p>
        </div>
      </div>
    )
  }

  const existing = !Array.isArray(program.data) ? program.data : undefined

  function set<K extends keyof HospitalProgramInput>(key: K, value: HospitalProgramInput[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleSubmit() {
    if (!form.name.trim() || !form.specialty.trim() || !form.deadline) {
      toast.error('Missing fields', 'Name, specialty, and deadline are required.')
      return
    }
    if (isNew) {
      create.mutate(form, {
        onSuccess: p => {
          toast.success('Program created', `${p.name} saved.`)
          navigate(`/dashboard/hospital/programs/${p.id}`)
        },
        onError: () => toast.error('Could not create program'),
      })
    } else {
      update.mutate(
        { programId: id, patch: form },
        {
          onSuccess: p => {
            toast.success('Program updated', `${p.name} changes saved.`)
          },
          onError: () => toast.error('Could not update program'),
        },
      )
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/dashboard/hospital/programs')}
        className="mb-4 inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-ink-500 transition-colors hover:text-ink-900"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to programs
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-ink-900">
              {isNew ? 'New Program' : existing?.name}
            </h1>
            {existing && <StatusBadge label={hospitalProgramMeta(existing.status).label} tone={hospitalProgramMeta(existing.status).tone} />}
          </div>
          <p className="mt-1 text-sm text-ink-500">
            {isNew
              ? `Create a new elective rotation for ${hospital.data?.name || 'your hospital'}.`
              : `${hospital.data?.name || 'Hospital'} · ${existing?.department || '—'} · ${existing?.duration || '—'}`}
          </p>
        </div>
        <Button size="sm" onClick={handleSubmit} disabled={create.isPending || update.isPending}>
          <Save className="size-4" aria-hidden />
          {create.isPending || update.isPending ? 'Saving…' : 'Save program'}
        </Button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="space-y-6 lg:col-span-2">
          <div className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
            <h2 className="font-display text-base font-bold text-ink-900">Program details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="p-name">Program name</Label>
                <Input id="p-name" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. IM Core Clerkship" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="p-dept">Department</Label>
                <Select id="p-dept" value={form.department} onChange={e => set('department', e.target.value)} className="mt-2 w-full">
                  {hospitalDepartments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="p-spec">Specialty</Label>
                <Input id="p-spec" value={form.specialty} onChange={e => set('specialty', e.target.value)} placeholder="e.g. General Internal Medicine" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="p-duration">Duration</Label>
                <Select id="p-duration" value={form.duration} onChange={e => set('duration', e.target.value)} className="mt-2 w-full">
                  {['4 weeks', '6 weeks', '8 weeks'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="p-fee">Program fee (USD)</Label>
                <Input id="p-fee" type="number" value={form.fee} onChange={e => set('fee', Number(e.target.value))} className="mt-2" />
              </div>
              <div>
                <Label htmlFor="p-seats">Available seats</Label>
                <Input id="p-seats" type="number" value={form.seats} onChange={e => set('seats', Number(e.target.value))} className="mt-2" />
              </div>
              <div>
                <Label htmlFor="p-deadline">Application deadline</Label>
                <Input id="p-deadline" type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} className="mt-2" />
              </div>
              <div>
                <Label htmlFor="p-status">Status</Label>
                <Select id="p-status" value={form.status} onChange={e => set('status', e.target.value as HospitalProgramInput['status'])} className="mt-2 w-full">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="paused">Paused</option>
                  <option value="archived">Archived</option>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="p-desc">Description</Label>
                <Textarea id="p-desc" value={form.description} onChange={e => set('description', e.target.value)} rows={3} className="mt-2" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="p-elig">Eligibility criteria</Label>
                <Textarea id="p-elig" value={form.eligibility} onChange={e => set('eligibility', e.target.value)} rows={3} className="mt-2" />
              </div>
            </div>
          </div>

          {existing && (
            <section className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
              <h2 className="font-display text-base font-bold text-ink-900">Applications for this program</h2>
              <p className="mt-1 text-sm text-ink-500">{programApps.length} applications received.</p>
              <div className="mt-4">
                <HospitalApplicationsTable data={programApps} pageSize={5} />
              </div>
            </section>
          )}
        </section>

        {existing && (
          <aside className="space-y-6">
            <section className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
              <h3 className="font-display text-sm font-bold text-ink-900">Seats</h3>
              <p className="mt-2 font-display text-2xl font-bold text-ink-900">
                {existing.filled}<span className="text-base font-semibold text-ink-400">/{existing.seats}</span>
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100">
                <div
                  className={(existing.filled ?? 0) >= (existing.seats ?? 0) ? 'h-full rounded-full bg-red-500' : 'h-full rounded-full bg-brand-500'}
                  style={{
                    width:
                      (existing.seats ?? 0) > 0
                        ? `${Math.min(100, Math.round(((existing.filled ?? 0) / (existing.seats ?? 0)) * 100))}%`
                        : '0%',
                  }}
                />
              </div>
            </section>
            <section className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
              <h3 className="font-display text-sm font-bold text-ink-900">Faculty</h3>
              <div className="mt-3 space-y-2">
                {(existing.faculty ?? []).map(f => (
                  <p key={f} className="rounded-xl bg-ink-50 px-3 py-2 text-sm font-semibold text-ink-800">{f}</p>
                ))}
                {(existing.faculty ?? []).length === 0 && <p className="text-sm text-ink-500">No faculty assigned yet.</p>}
              </div>
            </section>
            <section className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
              <h3 className="font-display text-sm font-bold text-ink-900">Available dates</h3>
              <div className="mt-3 space-y-2">
                {(existing.availableDates ?? []).map(d => (
                  <p key={d} className="rounded-xl bg-ink-50 px-3 py-2 text-sm font-semibold text-ink-800">{d}</p>
                ))}
                {(existing.availableDates ?? []).length === 0 && <p className="text-sm text-ink-500">No dates listed.</p>}
              </div>
            </section>
            <section className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
              <h3 className="font-display text-sm font-bold text-ink-900">Required documents</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {(existing.requiredDocuments ?? []).map(d => (
                  <span key={d} className="rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold text-ink-700">{d}</span>
                ))}
              </div>
            </section>
          </aside>
        )}
      </div>
    </div>
  )
}

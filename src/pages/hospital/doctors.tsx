import { useMemo, useState } from 'react'
import { Plus, Repeat, Stethoscope, Users } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { PageLoader } from '@/components/ui/spinner'
import { StatusBadge, doctorAvailabilityMeta, doctorStatusMeta } from '@/components/ui/status-badge'
import { Avatar } from '@/components/ui/avatar'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { formatDate } from '@/lib/utils'
import { useCreateHospitalDoctor, useHospitalDoctors } from '@/lib/hospitalQueries'
import { hospitalDepartments } from '@/mocks/hospital/programs'
import type { HospitalDoctorInput } from '@/services/hospitalService'

const EMPTY: HospitalDoctorInput = {
  name: '',
  department: hospitalDepartments[0],
  specialty: '',
  email: '',
  phone: '',
  availability: 'High',
}

export function HospitalDoctorsPage() {
  const doctors = useHospitalDoctors()
  const create = useCreateHospitalDoctor()
  const toast = useToast()
  const [department, setDepartment] = useState('all')
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState<HospitalDoctorInput>(EMPTY)

  const filtered = useMemo(() => {
    let result = doctors.data ?? []
    if (department !== 'all') result = result.filter(d => d.department === department)
    return result
  }, [doctors.data, department])

  if (doctors.isLoading) return <PageLoader label="Loading doctors…" />

  const all = doctors.data ?? []

  function handleAdd() {
    if (!form.name?.trim() || !form.specialty?.trim() || !form.email?.trim()) {
      toast.error('Missing fields', 'Name, specialty, and email are required.')
      return
    }
    create.mutate(form, {
      onSuccess: d => {
        toast.success('Doctor added', `${d.name} is now available to supervise rotations.`)
        setForm(EMPTY)
        setAddOpen(false)
      },
      onError: () => toast.error('Could not add doctor'),
    })
  }

  return (
    <div>
      <PageHeader
        title="Doctors"
        subtitle="Faculty who supervise students on elective rotations."
        actions={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" aria-hidden />
            Add doctor
          </Button>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Total doctors</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink-900">{all.length}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Currently busy</p>
          <p className="mt-2 font-display text-2xl font-bold text-amber-600">
            {all.filter(d => d.status === 'busy').length}
          </p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">On leave</p>
          <p className="mt-2 font-display text-2xl font-bold text-red-600">
            {all.filter(d => d.status === 'on_leave').length}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Select value={department} onChange={e => setDepartment(e.target.value)} className="w-56" aria-label="Filter by department">
          <option value="all">All departments</option>
          {hospitalDepartments.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </Select>
        <p className="text-sm text-ink-500">
          <Stethoscope className="mr-1 inline size-4 align-[-3px]" aria-hidden />
          {filtered.length} doctor{filtered.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map(d => (
          <article key={d.id} className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar name={d.name} />
                <div>
                  <p className="font-display text-base font-bold text-ink-900">{d.name}</p>
                  <p className="text-sm text-ink-500">{d.specialty}</p>
                </div>
              </div>
              <StatusBadge label={doctorStatusMeta(d.status).label} tone={doctorStatusMeta(d.status).tone} />
            </div>
            <p className="mt-3 rounded-xl bg-ink-50 px-3 py-2 text-sm font-semibold text-ink-700">{d.department}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-ink-100 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Availability</p>
                <div className="mt-1">
                  <StatusBadge label={doctorAvailabilityMeta(d.availability).label} tone={doctorAvailabilityMeta(d.availability).tone} />
                </div>
              </div>
              <div className="rounded-2xl border border-ink-100 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Active rotations</p>
                <p className="mt-1 flex items-center gap-1.5 font-display text-lg font-bold text-ink-900">
                  <Repeat className="size-4 text-violet-600" aria-hidden />
                  {d.currentRotations}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-4 text-sm">
              <span className="flex items-center gap-1.5 text-ink-600">
                <Users className="size-4" aria-hidden />
                {d.studentsAssigned} students assigned
              </span>
              <span className="text-xs text-ink-400">Joined {formatDate(d.joinedAt)}</span>
            </div>
          </article>
        ))}
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add doctor"
        description="Register a new faculty member to supervise elective rotations."
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="doc-name">Full name</Label>
            <Input id="doc-name" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} className="mt-2" placeholder="e.g. Dr. Priya Raman" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="doc-dept">Department</Label>
              <Select id="doc-dept" value={form.department} onChange={e => setForm(prev => ({ ...prev, department: e.target.value }))} className="mt-2 w-full">
                {hospitalDepartments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="doc-spec">Specialty</Label>
              <Input id="doc-spec" value={form.specialty} onChange={e => setForm(prev => ({ ...prev, specialty: e.target.value }))} className="mt-2" placeholder="e.g. Pulmonary Medicine" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="doc-email">Email</Label>
              <Input id="doc-email" type="email" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} className="mt-2" placeholder="doctor@stmarys.org" />
            </div>
            <div>
              <Label htmlFor="doc-phone">Phone</Label>
              <Input id="doc-phone" value={form.phone} onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))} className="mt-2" placeholder="+1 (415) 668-0000" />
            </div>
          </div>
          <div>
            <Label htmlFor="doc-avail">Availability</Label>
            <Select id="doc-avail" value={form.availability} onChange={e => setForm(prev => ({ ...prev, availability: e.target.value as HospitalDoctorInput['availability'] }))} className="mt-2 w-full">
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </Select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setAddOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleAdd} disabled={create.isPending}>
            {create.isPending ? 'Adding…' : 'Add doctor'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Building2, ChevronRight, Contact, Download, Eye, Mail, MessageCircle, Pencil, Phone, Plus, Search, ShieldCheck, UserCheck } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { HospitalCodeManagement } from '@/components/admin/hospital-code-management'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { PageLoader } from '@/components/ui/spinner'
import { StatusBadge, hospitalStatusMeta, tierMeta } from '@/components/ui/status-badge'
import { useToast } from '@/components/ui/toast'
import { useAdminHospitals, useCreateHospital, useSetHospitalStatus } from '@/lib/adminQueries'
import { downloadCsv } from '@/lib/csv'
import { formatDate } from '@/lib/utils'
import type { HospitalRecord } from '@/mocks/admin/people'

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="font-display text-lg font-bold text-ink-900">{value}</p>
      <p className="text-xs text-ink-500">{label}</p>
    </div>
  )
}

function ContactHospitalModal({
  open,
  onClose,
  hospital,
}: {
  open: boolean
  onClose: () => void
  hospital: HospitalRecord | null
}) {
  const toast = useToast()

  if (!hospital) return null

  const phoneDigits = hospital.phone.replace(/\D/g, '')

  const options = [
    {
      key: 'email',
      label: 'Contact via Email',
      description: hospital.email,
      icon: Mail,
      tone: 'bg-brand-50 text-brand-600',
      action: () => {
        window.location.href = `mailto:${hospital.email}`
        toast.success('Email draft opened', `Composing to ${hospital.email}`)
      },
    },
    {
      key: 'whatsapp',
      label: 'Contact via WhatsApp',
      description: hospital.phone,
      icon: MessageCircle,
      tone: 'bg-emerald-50 text-emerald-600',
      action: () => {
        window.open(`https://wa.me/${phoneDigits}`, '_blank', 'noopener,noreferrer')
        toast.success('WhatsApp opened', `Starting a chat with ${hospital.name}`)
      },
    },
    {
      key: 'call',
      label: 'Call Hospital',
      description: hospital.phone,
      icon: Phone,
      tone: 'bg-sky-50 text-sky-600',
      action: () => {
        window.location.href = `tel:${hospital.phone}`
        toast.info('Call initiated', `Dialing ${hospital.phone}`)
      },
    },
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Contact hospital"
      description={`Choose a channel to reach ${hospital.name}`}
    >
      <div className="space-y-3">
        {options.map(opt => (
          <button
            key={opt.key}
            type="button"
            onClick={() => {
              opt.action()
              onClose()
            }}
            className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-ink-200 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift"
          >
            <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${opt.tone}`}>
              <opt.icon className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink-900">{opt.label}</span>
              <span className="block truncate text-xs text-ink-500">{opt.description}</span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-ink-300" aria-hidden />
          </button>
        ))}
      </div>
      <p className="mt-4 text-xs text-ink-400">
        Opens your default email, messaging, or phone app.
      </p>
    </Modal>
  )
}

export function AdminHospitalsPage() {
  const hospitals = useAdminHospitals()
  const create = useCreateHospital()
  const setStatus = useSetHospitalStatus()
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [tierFilter, setTierFilter] = useState('all')

  const [addOpen, setAddOpen] = useState(false)
  const [addName, setAddName] = useState('')
  const [addCity, setAddCity] = useState('')
  const [addState, setAddState] = useState('')

  const [viewing, setViewing] = useState<HospitalRecord | null>(null)
  const [contacting, setContacting] = useState<HospitalRecord | null>(null)

  const filtered = useMemo(() => {
    let result = hospitals.data ?? []
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(h => h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q))
    }
    if (statusFilter !== 'all') result = result.filter(h => h.status === statusFilter)
    if (tierFilter !== 'all') result = result.filter(h => h.tier === tierFilter)
    return result
  }, [hospitals.data, search, statusFilter, tierFilter])

  if (hospitals.isLoading) return <PageLoader label="Loading hospitals…" />

  const all = hospitals.data ?? []
  const onboarding = all.filter(h => h.status === 'onboarding').length
  const paused = all.filter(h => h.status === 'paused').length
  const premier = all.filter(h => h.tier === 'premier').length

  function handleExport() {
    downloadCsv(
      'hospitals.csv',
      all.map(h => ({
        name: h.name,
        city: h.city,
        state: h.state,
        tier: h.tier,
        programs: h.programs,
        doctors: h.doctors,
        students: h.students,
        rating: h.rating,
        status: h.status,
        joinedAt: h.joinedAt,
      })),
    )
  }

  return (
    <div>
      <PageHeader
        title="Hospitals"
        subtitle="Partner network — approvals, status, and contact quick actions."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="size-4" aria-hidden />
              Export CSV
            </Button>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="size-4" aria-hidden />
              Add hospital
            </Button>
          </>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Total hospitals</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink-900">{all.length}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Premier partners</p>
          <p className="mt-2 font-display text-2xl font-bold text-violet-700">{premier}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Awaiting approval</p>
          <p className="mt-2 font-display text-2xl font-bold text-sky-600">{onboarding}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Paused</p>
          <p className="mt-2 font-display text-2xl font-bold text-amber-600">{paused}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search hospital or city…"
            className="w-64 pl-9"
            aria-label="Search hospitals"
          />
        </div>
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-40" aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="onboarding">Awaiting approval</option>
          <option value="paused">Paused</option>
        </Select>
        <Select value={tierFilter} onChange={e => setTierFilter(e.target.value)} className="w-36" aria-label="Filter by tier">
          <option value="all">All tiers</option>
          <option value="premier">Premier</option>
          <option value="standard">Standard</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-3xl border border-dashed border-ink-300 bg-white/60 px-6 py-16 text-center">
          <div className="grid size-12 place-items-center rounded-2xl bg-ink-100 text-ink-400">
            <Building2 className="size-6" aria-hidden />
          </div>
          <p className="mt-3 font-display text-sm font-bold text-ink-800">No hospitals found</p>
          <p className="mt-1 text-sm text-ink-500">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(h => {
            const st = hospitalStatusMeta(h.status)
            const tier = tierMeta(h.tier)
            return (
              <div
                key={h.id}
                className="flex flex-col rounded-3xl border border-ink-200 bg-white p-5 shadow-soft transition-shadow hover:shadow-lift"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                      <Building2 className="size-5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-display text-base font-bold text-ink-900">{h.name}</p>
                      <p className="text-xs text-ink-500">
                        {h.city}, {h.state}
                      </p>
                    </div>
                  </div>
                  <StatusBadge label={tier.label} tone={tier.tone} />
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <StatusBadge label={st.label} tone={st.tone} />
                  {h.status === 'onboarding' && (
                    <span className="text-xs text-ink-400">Joined {formatDate(h.joinedAt)}</span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-4 gap-2 rounded-2xl bg-ink-50 p-3">
                  <Stat label="Programs" value={h.programs} />
                  <Stat label="Doctors" value={h.doctors} />
                  <Stat label="Students" value={h.students} />
                  <Stat label="Rating" value={h.rating || '—'} />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-4">
                  <Button variant="outline" size="sm" onClick={() => setViewing(h)}>
                    <Eye className="size-3.5" aria-hidden />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info('Edit profile', `Opening editor for ${h.name}.`)}
                  >
                    <Pencil className="size-3.5" aria-hidden />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setContacting(h)}
                  >
                    <Contact className="size-3.5" aria-hidden />
                    Contact
                  </Button>
                  {h.status === 'onboarding' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="!text-brand-700"
                      onClick={() =>
                        setStatus.mutate(
                          { hospitalId: h.id, status: 'active' },
                          {
                            onSuccess: () => toast.success('Hospital approved', `${h.name} is now active.`),
                            onError: () => toast.error('Could not approve hospital'),
                          },
                        )
                      }
                    >
                      <UserCheck className="size-3.5" aria-hidden />
                      Approve
                    </Button>
                  )}
                  {h.status === 'paused' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="!text-brand-700"
                      onClick={() =>
                        setStatus.mutate(
                          { hospitalId: h.id, status: 'active' },
                          { onSuccess: () => toast.success('Hospital reactivated', h.name) },
                        )
                      }
                    >
                      <ShieldCheck className="size-3.5" aria-hidden />
                      Reactivate
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add hospital"
        description="Create a partner hospital. It will start in the onboarding state."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setAddOpen(false)} disabled={create.isPending}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!addName.trim() || !addCity.trim() || !addState.trim() || create.isPending}
              onClick={() =>
                create.mutate(
                  { name: addName, city: addCity, state: addState },
                  {
                    onSuccess: h => {
                      toast.success('Hospital added', `${h.name} is now in onboarding.`)
                      setAddOpen(false)
                      setAddName('')
                      setAddCity('')
                      setAddState('')
                    },
                    onError: () => toast.error('Could not add hospital'),
                  },
                )
              }
            >
              Add hospital
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="hosp-name">Hospital name</Label>
            <Input id="hosp-name" value={addName} onChange={e => setAddName(e.target.value)} placeholder="e.g. City General Hospital" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hosp-city">City</Label>
              <Input id="hosp-city" value={addCity} onChange={e => setAddCity(e.target.value)} placeholder="Chicago" />
            </div>
            <div>
              <Label htmlFor="hosp-state">State</Label>
              <Input id="hosp-state" value={addState} onChange={e => setAddState(e.target.value)} placeholder="IL" />
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewing?.name ?? ''}
        description={viewing ? `${viewing.city}, ${viewing.state}` : undefined}
      >
        {viewing && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <StatusBadge label={tierMeta(viewing.tier).label} tone={tierMeta(viewing.tier).tone} />
              <StatusBadge label={hospitalStatusMeta(viewing.status).label} tone={hospitalStatusMeta(viewing.status).tone} />
            </div>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {(
                [
                  ['Programs', String(viewing.programs)],
                  ['Doctors', String(viewing.doctors)],
                  ['Students', String(viewing.students)],
                  ['Rating', String(viewing.rating || '—')],
                  ['Joined', formatDate(viewing.joinedAt)],
                ] as [string, string][]
              ).map(([k, v]) => (
                <div key={k} className="border-b border-ink-100 pb-2">
                  <dt className="text-xs font-bold uppercase tracking-wide text-ink-400">{k}</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-ink-900">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setContacting(viewing)}>
                <Contact className="size-3.5" aria-hidden />
                Contact
              </Button>
              {viewing.status === 'onboarding' && (
                <Button
                  size="sm"
                  onClick={() =>
                    setStatus.mutate(
                      { hospitalId: viewing.id, status: 'active' },
                      {
                        onSuccess: () => {
                          toast.success('Hospital approved', `${viewing.name} is now active.`)
                          setViewing(null)
                        },
                      },
                    )
                  }
                >
                  <UserCheck className="size-3.5" aria-hidden />
                  Approve
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ContactHospitalModal open={contacting !== null} onClose={() => setContacting(null)} hospital={contacting} />

      <HospitalCodeManagement />
    </div>
  )
}

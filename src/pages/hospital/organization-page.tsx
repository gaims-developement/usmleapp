import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { FormEvent } from 'react'
import {
  Building2,
  Copy,
  Globe,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Trash2,
  UserRound,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { PageLoader } from '@/components/ui/spinner'
import { ConfirmDialog } from '@/components/ui/modal'
import {
  useCreateHospitalDepartment,
  useDeleteHospitalDepartment,
  useHospitalOrganization,
  useRegenerateHospitalCode,
} from '@/lib/hospitalQueries'
import { formatDate } from '@/lib/utils'

export function HospitalOrganizationPage() {
  const organization = useHospitalOrganization()
  const createDepartment = useCreateHospitalDepartment()
  const deleteDepartment = useDeleteHospitalDepartment()
  const regenerateCode = useRegenerateHospitalCode()

  const [newDepartment, setNewDepartment] = useState('')
  const [departmentError, setDepartmentError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [confirmRegenerate, setConfirmRegenerate] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  if (organization.isLoading) return <PageLoader label="Loading your organization…" />

  const org = organization.data
  const code = org?.activeCode ?? null

  async function copyHospitalCode() {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code.code)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } catch {
      setCopiedCode(false)
    }
  }

  function handleAddDepartment(e: FormEvent) {
    e.preventDefault()
    setDepartmentError(null)
    const name = newDepartment.trim()
    if (!name) {
      setDepartmentError('Department name is required.')
      return
    }
    createDepartment.mutate(name, {
      onSuccess: () => setNewDepartment(''),
      onError: err => setDepartmentError(err instanceof Error ? err.message : 'Failed to add department.'),
    })
  }

  function handleDelete() {
    if (!deleteTarget) return
    deleteDepartment.mutate(deleteTarget.id, {
      onSettled: () => setDeleteTarget(null),
    })
  }

  return (
    <div>
      <PageHeader
        title="Organization"
        subtitle="Your registration code, departments, and clinical team."
        actions={
          <Link
            to="/dashboard/hospital"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-brand-700"
          >
            <Building2 className="size-4" aria-hidden />
            Back to dashboard
          </Link>
        }
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="space-y-6">
          <div className="rounded-3xl border border-brand-200 bg-brand-50 p-6 shadow-soft">
            <p className="text-sm font-semibold text-brand-800">Hospital Registration Code</p>
            <p className="mt-2 break-all font-mono text-2xl font-bold tracking-widest text-ink-900">
              {code?.code ?? '—'}
            </p>
            <p className="mt-2 text-xs text-brand-800/70">
              Doctors enter this code when registering so they are linked to your hospital. Used by{' '}
              {code?.usedCount ?? 0} doctor{code?.usedCount === 1 ? '' : 's'}.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => void copyHospitalCode()}
                disabled={!code}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-brand-200 bg-white px-3 py-2 text-xs font-semibold text-brand-700 transition-colors hover:border-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Copy className="size-3.5" aria-hidden />
                {copiedCode ? 'Copied' : 'Copy'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmRegenerate(true)}
                disabled={regenerateCode.isPending}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-brand-200 bg-white px-3 py-2 text-xs font-semibold text-brand-700 transition-colors hover:border-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw className="size-3.5" aria-hidden />
                {regenerateCode.isPending ? 'Working…' : 'Regenerate'}
              </button>
            </div>
            <p className="mt-3 text-xs text-ink-500">
              Regenerating deactivates the current code. Existing doctors stay linked.
            </p>
          </div>

          <div className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
            <h3 className="font-display text-sm font-bold text-ink-900">Hospital profile</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                <div>
                  <dt className="text-xs text-ink-500">Name</dt>
                  <dd className="font-semibold text-ink-900">{org?.profile.name ?? '—'}</dd>
                </div>
              </div>
              {(org?.profile.city || org?.profile.state || org?.profile.country) && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                  <div>
                    <dt className="text-xs text-ink-500">Location</dt>
                    <dd className="text-ink-900">
                      {[org?.profile.city, org?.profile.state, org?.profile.country].filter(Boolean).join(', ')}
                    </dd>
                  </div>
                </div>
              )}
              {org?.profile.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                  <div>
                    <dt className="text-xs text-ink-500">Address</dt>
                    <dd className="text-ink-900">{org?.profile.address}</dd>
                  </div>
                </div>
              )}
              {org?.profile.website && (
                <div className="flex items-start gap-3">
                  <Globe className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                  <div>
                    <dt className="text-xs text-ink-500">Website</dt>
                    <dd className="break-all text-ink-900">{org?.profile.website}</dd>
                  </div>
                </div>
              )}
              {org?.profile.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                  <div>
                    <dt className="text-xs text-ink-500">Phone</dt>
                    <dd className="text-ink-900">{org?.profile.phone}</dd>
                  </div>
                </div>
              )}
              {org?.profile.coordinatorName && (
                <div className="flex items-start gap-3">
                  <UserRound className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                  <div>
                    <dt className="text-xs text-ink-500">Coordinator</dt>
                    <dd className="text-ink-900">{org?.profile.coordinatorName}</dd>
                  </div>
                </div>
              )}
            </dl>
          </div>
        </section>

        <section className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
          <h3 className="font-display text-lg font-bold text-ink-900">Departments</h3>
          <p className="mt-1 text-sm text-ink-500">
            Doctors can join these departments, or specify their own during registration.
          </p>

          <form onSubmit={handleAddDepartment} className="mt-4 flex gap-2">
            <input
              type="text"
              value={newDepartment}
              onChange={e => setNewDepartment(e.target.value)}
              placeholder="e.g. Cardiology"
              className="min-w-0 flex-1 rounded-xl border border-ink-200 bg-ink-50/50 px-4 py-2.5 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
            />
            <button
              type="submit"
              disabled={createDepartment.isPending || newDepartment.trim().length === 0}
              className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="size-4" aria-hidden />
              Add
            </button>
          </form>
          {departmentError && (
            <p className="mt-2 text-xs text-red-600">{departmentError}</p>
          )}

          <ul className="mt-4 space-y-2">
            {org?.departments.map(dept => (
              <li
                key={dept.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-ink-100 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-900">{dept.name}</p>
                  <p className="text-xs text-ink-500">
                    {dept.doctorCount} doctor{dept.doctorCount === 1 ? '' : 's'} · added{' '}
                    {formatDate(dept.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteTarget({ id: dept.id, name: dept.name })}
                  className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-xl text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label={`Delete ${dept.name}`}
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </li>
            ))}
            {!org?.departments || org.departments.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-ink-200 px-4 py-6 text-center text-sm text-ink-400">
                No departments yet. Add your first department above.
              </li>
            ) : null}
          </ul>
        </section>

        <section className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
          <h3 className="font-display text-lg font-bold text-ink-900">Clinical team</h3>
          <p className="mt-1 text-sm text-ink-500">Doctors linked to your hospital.</p>

          <ul className="mt-4 space-y-2">
            {org?.doctors.map(doctor => (
              <li key={doctor.id} className="rounded-2xl border border-ink-100 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink-900">{doctor.name}</p>
                    <p className="truncate text-xs text-ink-500">{doctor.email}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                    {doctor.departmentName ?? doctor.specialty ?? 'General'}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-ink-400">
                  {[doctor.title, doctor.specialty].filter(Boolean).join(' · ') || 'Doctor'}
                </p>
              </li>
            ))}
            {!org?.doctors || org.doctors.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-ink-200 px-4 py-6 text-center text-sm text-ink-400">
                No doctors linked yet. Share your hospital code with them.
              </li>
            ) : null}
          </ul>
        </section>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete department"
        description={`Delete "${deleteTarget?.name ?? ''}"? Doctors currently assigned to this department will remain but lose their department link.`}
        confirmLabel="Delete"
        tone="danger"
        loading={deleteDepartment.isPending}
      />
      <ConfirmDialog
        open={confirmRegenerate}
        onClose={() => setConfirmRegenerate(false)}
        onConfirm={() =>
          regenerateCode.mutate(undefined, { onSettled: () => setConfirmRegenerate(false) })
        }
        title="Regenerate hospital code"
        description="Your current hospital code will be deactivated and a new one issued. Doctors already linked to your hospital will not be affected."
        confirmLabel="Regenerate"
        loading={regenerateCode.isPending}
      />
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Ban, Building2, Eye, Plus, Search, ShieldCheck, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { HospitalCodeManagement } from '@/components/admin/hospital-code-management'
import { Button, ButtonLink } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { Modal, ConfirmDialog } from '@/components/ui/modal'
import { PageLoader } from '@/components/ui/spinner'
import { hospitalStatusMeta, StatusBadge } from '@/components/ui/status-badge'
import { useToast } from '@/components/ui/toast'
import { useAdminHospitals, useRemoveHospital, useSetHospitalStatus } from '@/lib/adminQueries'
import { formatDate } from '@/lib/utils'
import type { HospitalRecord } from '@/mocks/admin/people'

export function SuperAdminHospitalsPage() {
  const hospitals = useAdminHospitals()
  const setStatus = useSetHospitalStatus()
  const remove = useRemoveHospital()
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [status, setStatusFilter] = useState('all')
  const [reviewing, setReviewing] = useState<HospitalRecord | null>(null)
  const [removing, setRemoving] = useState<HospitalRecord | null>(null)

  const filtered = useMemo(() => {
    let result = hospitals.data ?? []
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        h => h.name.toLowerCase().includes(q) || `${h.city}, ${h.state}`.toLowerCase().includes(q),
      )
    }
    if (status !== 'all') result = result.filter(h => h.status === status)
    return result
  }, [hospitals.data, search, status])

  if (hospitals.isLoading) return <PageLoader label="Loading hospitals…" />

  const totals = hospitals.data ?? []
  const active = totals.filter(h => h.status === 'active').length
  const paused = totals.filter(h => h.status === 'paused').length
  const onboarding = totals.filter(h => h.status === 'onboarding').length

  const columns: DataTableColumn<HospitalRecord>[] = [
    {
      key: 'hospital',
      header: 'Hospital',
      cell: r => (
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <Building2 className="size-4.5" aria-hidden />
          </span>
          <div>
            <p className="font-semibold text-ink-900">{r.name}</p>
            <p className="text-xs text-ink-500">
              {r.city}, {r.state}
            </p>
          </div>
        </div>
      ),
      sortValue: r => r.name,
    },
    { key: 'programs', header: 'Programs', cell: r => r.programs, align: 'right' },
    { key: 'doctors', header: 'Doctors', cell: r => r.doctors, align: 'right' },
    { key: 'students', header: 'Students', cell: r => r.students, align: 'right' },
    {
      key: 'rating',
      header: 'Rating',
      cell: r => <span className="font-semibold text-ink-800">{r.rating.toFixed(1)}</span>,
      align: 'right',
      sortValue: r => r.rating,
    },
    {
      key: 'status',
      header: 'Status',
      cell: r => {
        const meta = hospitalStatusMeta(r.status)
        return <StatusBadge label={meta.label} tone={meta.tone} />
      },
    },
    { key: 'joined', header: 'Joined', cell: r => formatDate(r.joinedAt), align: 'right' },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: r => (
        <Button variant="outline" size="sm" onClick={() => setReviewing(r)}>
          <Eye className="size-3.5" aria-hidden />
          Review
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Hospitals"
        subtitle="Partner hospitals, their programs, and enlisting status."
        actions={
          <ButtonLink to="/dashboard/super-admin/hospitals" size="sm">
            <Plus className="size-4" aria-hidden />
            Add hospital
          </ButtonLink>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Active hospitals</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink-900">{active}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Paused</p>
          <p className="mt-2 font-display text-2xl font-bold text-amber-600">{paused}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Onboarding</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink-900">{onboarding}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or city…"
            className="w-72 pl-9"
            aria-label="Search hospitals"
          />
        </div>
        <Select value={status} onChange={e => setStatusFilter(e.target.value)} className="w-44" aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="onboarding">Onboarding</option>
        </Select>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} data={filtered} keyField="id" pageSize={8} />
      </div>

      <HospitalCodeManagement />

      <Modal
        open={reviewing !== null}
        onClose={() => setReviewing(null)}
        title={reviewing?.name ?? 'Review hospital'}
        description={reviewing ? `${reviewing.city}, ${reviewing.state}` : undefined}
      >
        {reviewing && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge
                label={hospitalStatusMeta(reviewing.status).label}
                tone={hospitalStatusMeta(reviewing.status).tone}
              />
            </div>

            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {(
                [
                  ['Email', reviewing.email],
                  ['Phone', reviewing.phone],
                  ['Programs', String(reviewing.programs)],
                  ['Doctors', String(reviewing.doctors)],
                  ['Students', String(reviewing.students)],
                  ['Rating', String(reviewing.rating || '—')],
                  ['Joined', formatDate(reviewing.joinedAt)],
                ] as [string, string][]
              ).map(([k, v]) => (
                <div key={k} className="border-b border-ink-100 pb-2">
                  <dt className="text-xs font-bold uppercase tracking-wide text-ink-400">{k}</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-ink-900">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-wrap gap-2 border-t border-ink-100 pt-4">
              {reviewing.status === 'active' ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={setStatus.isPending}
                  onClick={() =>
                    setStatus.mutate(
                      { hospitalId: reviewing.id, status: 'paused' },
                      {
                        onSuccess: () => {
                          toast.success('Enlisting disabled', `${reviewing.name} will no longer be listed for new rotations.`)
                          setReviewing(null)
                        },
                        onError: () => toast.error('Could not update hospital'),
                      },
                    )
                  }
                >
                  <Ban className="size-3.5" aria-hidden />
                  Disable enlisting
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled={setStatus.isPending}
                  onClick={() =>
                    setStatus.mutate(
                      { hospitalId: reviewing.id, status: 'active' },
                      {
                        onSuccess: () => {
                          toast.success('Enlisting enabled', `${reviewing.name} can now accept new rotations.`)
                          setReviewing(null)
                        },
                        onError: () => toast.error('Could not update hospital'),
                      },
                    )
                  }
                >
                  <ShieldCheck className="size-3.5" aria-hidden />
                  Enable enlisting
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="!text-red-600 hover:!bg-red-50"
                disabled={remove.isPending}
                onClick={() => setRemoving(reviewing)}
              >
                <Trash2 className="size-3.5" aria-hidden />
                Remove hospital
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={() => {
          if (!removing) return
          remove.mutate(removing.id, {
            onSuccess: () => {
              toast.success('Hospital removed', `${removing.name} has been removed.`)
              setRemoving(null)
              setReviewing(null)
            },
            onError: () => toast.error('Could not remove hospital'),
          })
        }}
        title="Remove hospital"
        description={`Are you sure you want to remove ${removing?.name ?? 'this hospital'}? This cannot be undone.`}
        confirmLabel="Remove hospital"
        cancelLabel="Cancel"
        tone="danger"
        loading={remove.isPending}
      />
    </div>
  )
}

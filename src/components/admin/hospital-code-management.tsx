import { useState } from 'react'
import { Copy, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { StatusBadge } from '@/components/ui/status-badge'
import { useToast } from '@/components/ui/toast'
import { usePartnerHospitals, useRegenerateHospitalCode } from '@/lib/partnerQueries'
import type { PartnerHospital } from '@/mocks/partners/hospitals'

export function HospitalCodeManagement() {
  const hospitals = usePartnerHospitals()
  const regenerate = useRegenerateHospitalCode()
  const toast = useToast()
  const [copied, setCopied] = useState<string | null>(null)

  async function copy(code: string) {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(code)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      setCopied(null)
    }
  }

  const columns: DataTableColumn<PartnerHospital>[] = [
    {
      key: 'hospital',
      header: 'Hospital',
      cell: h => (
        <div>
          <p className="font-semibold text-ink-900">{h.name}</p>
          <p className="text-xs text-ink-500">{h.city || h.country}</p>
        </div>
      ),
      sortValue: h => h.name,
    },
    {
      key: 'code',
      header: 'Hospital Code',
      cell: h => <span className="font-mono font-bold tracking-wider text-ink-900">{h.hospitalCode}</span>,
      sortValue: h => h.hospitalCode,
    },
    {
      key: 'status',
      header: 'Status',
      cell: h => (
        <StatusBadge
          label={h.status === 'active' ? 'Active' : h.status === 'pending' ? 'Pending' : h.status === 'info_requested' ? 'Info requested' : 'Rejected'}
          tone={h.status === 'active' ? 'brand' : h.status === 'pending' ? 'amber' : h.status === 'info_requested' ? 'sky' : 'red'}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: h => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => void copy(h.hospitalCode)} title="Copy code">
            <Copy className="size-3.5" aria-hidden />
            {copied === h.hospitalCode ? 'Copied' : 'Copy'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={regenerate.isPending}
            onClick={() =>
              regenerate.mutate(h.id, {
                onSuccess: next => toast.success('Hospital code regenerated', `${next.name}: ${next.hospitalCode}`),
                onError: () => toast.error('Could not regenerate code'),
              })
            }
          >
            <RefreshCw className="size-3.5" aria-hidden />
            Regenerate
          </Button>
        </div>
      ),
    },
  ]

  return (
    <section className="mt-6 rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
      <div>
        <h2 className="font-display text-lg font-bold text-ink-900">Hospital Codes</h2>
        <p className="mt-1 text-sm text-ink-500">
          Admin-only code visibility, copying, and regeneration for doctor registration.
        </p>
      </div>
      <div className="mt-4">
        <DataTable
          columns={columns}
          data={hospitals.data ?? []}
          keyField="id"
          loading={hospitals.isLoading}
          pageSize={5}
          emptyTitle="No hospital codes"
          emptyDescription="Hospital codes will appear as partner hospitals register."
        />
      </div>
    </section>
  )
}

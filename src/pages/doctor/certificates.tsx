import { useMemo, useState } from 'react'
import { Award, BadgeCheck, Eye, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { PageLoader } from '@/components/ui/spinner'
import { StatusBadge, certificateStatusMeta, completionStatusMeta } from '@/components/ui/status-badge'
import { Avatar } from '@/components/ui/avatar'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { useCertificates, useSetCertificateStatus } from '@/lib/doctorQueries'
import { formatDate } from '@/lib/utils'
import type { CertificateJoined } from '@/services/doctorService'

export function DoctorCertificatesPage() {
  const certificates = useCertificates()
  const setStatus = useSetCertificateStatus()
  const toast = useToast()
  const [status, setStatusFilter] = useState<'all' | 'not_started' | 'generated' | 'approved' | 'issued'>('all')
  const [preview, setPreview] = useState<CertificateJoined | null>(null)

  const filtered = useMemo(
    () => (status === 'all' ? (certificates.data ?? []) : (certificates.data ?? []).filter(c => c.certificateStatus === status)),
    [certificates.data, status],
  )

  if (certificates.isLoading) return <PageLoader label="Loading certificates…" />

  function generate(cert: CertificateJoined) {
    setStatus.mutate(
      { certificateId: cert.id, status: 'generated' },
      {
        onSuccess: () => toast.success('Certificate generated', `A draft certificate was generated for ${cert.student.name}.`),
        onError: () => toast.error('Could not generate certificate'),
      },
    )
  }

  function issue(cert: CertificateJoined) {
    setStatus.mutate(
      { certificateId: cert.id, status: 'issued' },
      {
        onSuccess: () => toast.success('Certificate issued', `${cert.student.name}'s certificate is now issued.`),
        onError: () => toast.error('Could not issue certificate'),
      },
    )
  }

  const columns: DataTableColumn<CertificateJoined>[] = [
    {
      key: 'student',
      header: 'Student',
      sortValue: c => c.student.name,
      cell: cert => (
        <div className="flex items-center gap-3">
          <Avatar name={cert.student.name} />
          <div>
            <p className="font-semibold text-ink-900">{cert.student.name}</p>
            <p className="text-xs text-ink-500">{cert.id}</p>
          </div>
        </div>
      ),
    },
    { key: 'department', header: 'Department', sortValue: c => c.department, cell: cert => <span className="text-ink-600">{cert.department}</span> },
    { key: 'duration', header: 'Duration', cell: cert => <span className="text-ink-600">{cert.duration}</span> },
    {
      key: 'completion',
      header: 'Completion',
      sortValue: c => c.completionStatus,
      cell: cert => (
        <StatusBadge label={completionStatusMeta(cert.completionStatus).label} tone={completionStatusMeta(cert.completionStatus).tone} />
      ),
    },
    {
      key: 'certificate',
      header: 'Certificate',
      sortValue: c => c.certificateStatus,
      cell: cert => (
        <StatusBadge label={certificateStatusMeta(cert.certificateStatus).label} tone={certificateStatusMeta(cert.certificateStatus).tone} />
      ),
    },
    {
      key: 'issued',
      header: 'Issued',
      sortValue: c => c.issuedAt ?? '',
      cell: cert => <span className="text-ink-600">{cert.issuedAt ? formatDate(cert.issuedAt) : '—'}</span>,
    },
    {
      key: 'action',
      header: 'Action',
      cell: cert =>
        cert.certificateStatus === 'not_started' ? (
          <button
            type="button"
            onClick={() => generate(cert)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-700"
          >
            <Sparkles className="size-3.5" aria-hidden />
            Generate
          </button>
        ) : cert.certificateStatus === 'generated' || cert.certificateStatus === 'approved' ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreview(cert)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-700 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
            >
              <Eye className="size-3.5" aria-hidden />
              Preview
            </button>
            <button
              type="button"
              onClick={() => issue(cert)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              <BadgeCheck className="size-3.5" aria-hidden />
              Issue
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setPreview(cert)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-700 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
          >
            <Eye className="size-3.5" aria-hidden />
            View certificate
          </button>
        ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Certificates"
        subtitle="Generate and approve completion certificates for your students."
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={e => setStatusFilter(e.target.value as typeof status)}
          className="h-10 w-52 cursor-pointer rounded-xl border border-ink-300 bg-white px-3 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          aria-label="Filter by certificate status"
        >
          <option value="all">All statuses</option>
          <option value="not_started">Not started</option>
          <option value="generated">Generated</option>
          <option value="approved">Approved</option>
          <option value="issued">Issued</option>
        </select>
        <p className="text-sm text-ink-500">{filtered.length} certificates</p>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} data={filtered} keyField="id" pageSize={10} />
      </div>

      <Modal
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        title={preview ? `Certificate ${preview.id}` : ''}
        description={preview ? `Issued to ${preview.student.name}` : undefined}
        size="lg"
      >
        {preview && (
          <div className="relative overflow-hidden rounded-2xl border-2 border-brand-600 bg-white p-8 text-center">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-brand-600" />
            <div className="flex justify-center">
              <span className="grid size-16 place-items-center rounded-full bg-brand-600 text-white">
                <Award className="size-8" aria-hidden />
              </span>
            </div>
            <h3 className="mt-4 font-display text-2xl font-bold text-ink-900">Certificate of Completion</h3>
            <p className="mt-2 text-sm text-ink-500">This certifies that</p>
            <p className="mt-2 font-display text-xl font-bold text-brand-700">{preview.student.name}</p>
            <p className="mt-1 text-sm text-ink-600">has successfully completed an elective rotation in</p>
            <p className="mt-1 font-display text-lg font-bold text-ink-900">{preview.department}</p>
            <p className="mt-2 text-sm text-ink-500">Duration: {preview.duration}</p>
            <div className="mt-6 flex items-center justify-between border-t border-ink-100 pt-4 text-left text-xs text-ink-500">
              <div>
                <p className="font-semibold text-ink-700">Dr. Alan Cross</p>
                <p>Attending Physician, {preview.department}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-ink-700">{preview.issuedAt ? formatDate(preview.issuedAt) : 'Pending'}</p>
                <p>Issue date</p>
              </div>
            </div>
          </div>
        )}
        <div className="mt-6 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setPreview(null)}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  )
}

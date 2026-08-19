import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Stethoscope,
  XCircle,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { PageLoader } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import {
  useApproveMember,
  usePendingDoctors,
  usePendingReviewers,
  useRejectMember,
} from '@/lib/hospitalQueries'
import type { HospitalPendingMember } from '@/services/hospitalService'

export function HospitalPendingRegistrationsPage() {
  const { user } = useAuth()
  const hospitalStatus = user?.hospital?.status
  const pendingDoctors = usePendingDoctors()
  const pendingReviewers = usePendingReviewers()
  const approveMember = useApproveMember()
  const rejectMember = useRejectMember()

  const loading = pendingDoctors.isLoading || pendingReviewers.isLoading
  const doctors = pendingDoctors.data ?? []
  const reviewers = pendingReviewers.data ?? []
  const total = doctors.length + reviewers.length

  if (hospitalStatus !== 'active') {
    return (
      <div>
        <PageHeader title="Pending Registrations" subtitle="Your hospital account is pending approval." />
        <div className="mt-8 text-center text-sm text-ink-500">
          <p>You cannot manage registrations until your hospital account is approved.</p>
          <Link to="/dashboard/hospital" className="mt-4 inline-flex items-center gap-2 text-brand-700 hover:text-brand-800">
            <ArrowLeft className="size-4" /> Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Pending Registrations"
        subtitle={`${total} pending ${total === 1 ? 'registration' : 'registrations'} awaiting your review.`}
        actions={
          <Link
            to="/dashboard/hospital"
            className="inline-flex items-center gap-2 text-sm font-medium text-ink-600 hover:text-ink-900"
          >
            <ArrowLeft className="size-4" /> Back to dashboard
          </Link>
        }
      />

      {loading ? (
        <PageLoader />
      ) : total === 0 ? (
        <div className="mt-12 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-ink-100 text-ink-400">
            <CheckCircle2 className="size-7" />
          </span>
          <p className="mt-4 text-sm font-semibold text-ink-700">All caught up</p>
          <p className="mt-1 text-xs text-ink-500">No pending doctor or reviewer registrations at this time.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {doctors.length > 0 && (
            <PendingSection
              title="Pending Doctors"
              icon={<Stethoscope className="size-5 text-brand-600" />}
              members={doctors}
              role="DOCTOR"
              approveMember={approveMember}
              rejectMember={rejectMember}
            />
          )}
          {reviewers.length > 0 && (
            <PendingSection
              title="Pending Reviewers"
              icon={<ClipboardCheck className="size-5 text-violet-600" />}
              members={reviewers}
              role="REVIEWER"
              approveMember={approveMember}
              rejectMember={rejectMember}
            />
          )}
        </div>
      )}
    </div>
  )
}

function PendingSection({
  title,
  icon,
  members,
  role,
  approveMember,
  rejectMember,
}: {
  title: string
  icon: React.ReactNode
  members: HospitalPendingMember[]
  role: 'DOCTOR' | 'REVIEWER'
  approveMember: ReturnType<typeof useApproveMember>
  rejectMember: ReturnType<typeof useRejectMember>
}) {
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  function handleApprove(memberId: string) {
    approveMember.mutate({ memberId, role })
  }

  function handleReject(memberId: string) {
    rejectMember.mutate(
      { memberId, role, reason: rejectReason || undefined },
      { onSuccess: () => { setRejectingId(null); setRejectReason('') } },
    )
  }

  return (
    <section>
      <h3 className="flex items-center gap-2 text-sm font-bold text-ink-900">
        {icon}
        {title}
        <span className="ml-1 inline-flex items-center justify-center rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
          {members.length}
        </span>
      </h3>
      <div className="mt-3 space-y-3">
        {members.map(m => (
          <div
            key={m.id}
            className="flex flex-col gap-3 rounded-2xl border border-ink-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink-900">{m.name}</p>
              <p className="mt-0.5 truncate text-xs text-ink-500">{m.email}</p>
              {m.specialty && (
                <p className="mt-1 text-xs text-ink-400">Specialty: {m.specialty}</p>
              )}
              <p className="mt-1 text-xs text-ink-400">
                Registered: {new Date(m.registeredAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
              </p>
            </div>

            {rejectingId === m.id ? (
              <div className="flex flex-col gap-2 sm:items-end">
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Reason for rejection (optional)"
                  className="w-full rounded-xl border border-ink-200 px-3 py-2 text-xs text-ink-700 placeholder:text-ink-400 sm:w-64"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(m.id)}
                    disabled={rejectMember.isPending}
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    Confirm Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setRejectingId(null); setRejectReason('') }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleApprove(m.id)}
                  disabled={approveMember.isPending}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <CheckCircle2 className="mr-1 size-3.5" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setRejectingId(m.id)}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <XCircle className="mr-1 size-3.5" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

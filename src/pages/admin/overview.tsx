import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  ClipboardList,
  FileClock,
  GraduationCap,
  LifeBuoy,
  Megaphone,
  Phone,
  UserCheck,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button, ButtonLink } from '@/components/ui/button'
import { KpiCard } from '@/components/ui/kpi-card'
import { Widget } from '@/components/ui/widget'
import { QuickActions, type QuickAction } from '@/components/ui/quick-actions'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { PageLoader } from '@/components/ui/spinner'
import { StatusBadge, applicationStatusMeta, reviewerAvailabilityMeta, supportPriorityMeta, supportStatusMeta } from '@/components/ui/status-badge'
import { useToast } from '@/components/ui/toast'
import {
  ApplicationActions,
  ApplicationDetailModal,
} from '@/components/admin/applications'
import { PartnerApprovalQueue } from '@/components/admin/partner-approval-queue'
import {
  useAdminApplications,
  useAdminHospitals,
  useAdminReviewers,
  useOpsKpis,
  useSetHospitalStatus,
  useSupportTickets,
} from '@/lib/adminQueries'
import { formatDate } from '@/lib/utils'
import type { AdminApplication } from '@/mocks/admin/operations'
import type { ReviewerRecord } from '@/mocks/admin/people'

const ACTIVE_STATUSES = ['submitted', 'under_review', 'additional_info']

export function AdminOverviewPage() {
  const kpis = useOpsKpis()
  const applications = useAdminApplications()
  const reviewers = useAdminReviewers()
  const tickets = useSupportTickets()
  const hospitals = useAdminHospitals()
  const approve = useSetHospitalStatus()
  const toast = useToast()

  const [selected, setSelected] = useState<AdminApplication | null>(null)

  const queue = useMemo(
    () => (applications.data ?? []).filter(a => ACTIVE_STATUSES.includes(a.status)),
    [applications.data],
  )

  if (kpis.isLoading || applications.isLoading || reviewers.isLoading || tickets.isLoading || hospitals.isLoading) {
    return <PageLoader label="Loading operations dashboard…" />
  }

  const quickActions: QuickAction[] = [
    { label: 'Assign applications', description: `${queue.filter(a => a.reviewer === 'Unassigned').length} awaiting assignment`, icon: ClipboardList, to: '/dashboard/admin/applications', tone: 'amber' },
    { label: 'Review hospital approvals', description: `${(hospitals.data ?? []).filter(h => h.status === 'onboarding').length} onboarding now`, icon: Building2, to: '/dashboard/admin/hospitals', tone: 'violet' },
    { label: 'New announcement', description: 'Notify students & partners', icon: Megaphone, to: '/dashboard/admin/announcements', tone: 'accent' },
    { label: 'Create program', description: 'Publish an elective', icon: GraduationCap, to: '/dashboard/admin/programs', tone: 'brand' },
    { label: 'Open support inbox', description: `${(tickets.data ?? []).filter(t => t.status !== 'resolved').length} open tickets`, icon: LifeBuoy, to: '/dashboard/admin/support', tone: 'rose' },
    { label: 'Generate a report', description: 'Export operational data', icon: FileClock, to: '/dashboard/admin/reports', tone: 'sky' },
  ]

  const queueColumns: DataTableColumn<AdminApplication>[] = [
    {
      key: 'id',
      header: 'Application',
      cell: r => (
        <button type="button" onClick={() => setSelected(r)} className="cursor-pointer text-left font-semibold text-brand-700 hover:underline">
          {r.id}
        </button>
      ),
      sortValue: r => r.id,
    },
    { key: 'student', header: 'Student', cell: r => r.student, sortValue: r => r.student },
    { key: 'hospital', header: 'Hospital', cell: r => <span className="max-w-52 truncate">{r.hospital}</span> },
    {
      key: 'status',
      header: 'Status',
      cell: r => {
        const meta = applicationStatusMeta(r.status)
        return <StatusBadge label={meta.label} tone={meta.tone} />
      },
    },
    {
      key: 'submitted',
      header: 'Submitted',
      cell: r => formatDate(r.submittedAt),
      align: 'right',
      sortValue: r => r.submittedAt,
    },
    {
      key: 'actions',
      header: '',
      cell: r => <ApplicationActions application={r} onView={() => setSelected(r)} />,
      align: 'right',
    },
  ]

  const workloadColumns: DataTableColumn<ReviewerRecord>[] = [
    { key: 'name', header: 'Reviewer', cell: r => r.name, sortValue: r => r.name },
    {
      key: 'assigned',
      header: 'Assigned',
      cell: r => r.assigned,
      align: 'right',
      sortValue: r => r.assigned,
    },
    {
      key: 'pending',
      header: 'Pending',
      cell: r => <span className={r.pending >= 10 ? 'font-semibold text-red-600' : ''}>{r.pending}</span>,
      align: 'right',
      sortValue: r => r.pending,
    },
    {
      key: 'today',
      header: 'Done today',
      cell: r => r.completedToday,
      align: 'right',
      sortValue: r => r.completedToday,
    },
    {
      key: 'avg',
      header: 'Avg time',
      cell: r => r.avgReviewTime,
      align: 'right',
      sortValue: r => r.avgReviewTime,
    },
    {
      key: 'availability',
      header: 'Availability',
      cell: r => {
        const meta = reviewerAvailabilityMeta(r.availability)
        return <StatusBadge label={meta.label} tone={meta.tone} />
      },
    },
  ]

  const onboardingHospitals = (hospitals.data ?? []).filter(h => h.status === 'onboarding')

  return (
    <div>
      <PageHeader
        title="Operations Dashboard"
        subtitle="Day-to-day application flow, reviewer workload, and partner operations."
        actions={
          <>
            <ButtonLink to="/dashboard/admin/announcements" variant="outline" size="sm">
              <Megaphone className="size-4" aria-hidden />
              New announcement
            </ButtonLink>
            <ButtonLink to="/dashboard/admin/applications" size="sm">
              <ClipboardList className="size-4" aria-hidden />
              Full queue
            </ButtonLink>
          </>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(kpis.data ?? []).map(kpi => {
          const Icon = kpi.icon || ClipboardList
          return (
            <Link key={kpi.id || kpi.label} to={kpi.to || '/dashboard/admin/applications'} className="block">
              <KpiCard label={kpi.label} value={String(kpi.value)} icon={Icon} hint={kpi.hint} />
            </Link>
          )
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Widget
          title="Application queue"
          subtitle={`${queue.length} applications in flight · ${queue.filter(a => a.reviewer === 'Unassigned').length} unassigned`}
          className="lg:col-span-2"
          action={
            <ButtonLink to="/dashboard/admin/applications" variant="outline" size="sm">
              Manage queue
            </ButtonLink>
          }
        >
          <DataTable
            columns={queueColumns}
            data={queue}
            keyField="id"
            bare
            pageSize={6}
            emptyTitle="Queue is clear"
            emptyDescription="No applications awaiting triage right now."
          />
        </Widget>
        <Widget
          title="Reviewer workload"
          subtitle="Assigned vs pending · today"
          action={
            <ButtonLink to="/dashboard/admin/reviewers" variant="outline" size="sm">
              Manage
            </ButtonLink>
          }
        >
          <DataTable
            columns={workloadColumns}
            data={reviewers.data ?? []}
            keyField="id"
            bare
            pageSize={8}
          />
        </Widget>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Widget
          title="Support snapshot"
          subtitle="Latest open tickets"
          action={
            <ButtonLink to="/dashboard/admin/support" variant="outline" size="sm">
              Open inbox
            </ButtonLink>
          }
        >
          <ul className="divide-y divide-ink-100">
            {(tickets.data ?? [])
              .filter(t => t.status !== 'resolved')
              .slice(0, 5)
              .map(t => {
                const prio = supportPriorityMeta(t.priority)
                const st = supportStatusMeta(t.status)
                return (
                  <li key={t.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink-800">{t.subject}</p>
                      <p className="text-xs text-ink-500">
                        {t.from} · {t.id}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <StatusBadge label={prio.label} tone={prio.tone} />
                      <StatusBadge label={st.label} tone={st.tone} />
                    </div>
                  </li>
                )
              })}
          </ul>
        </Widget>

        <Widget
          title="Hospital approvals"
          subtitle={`${onboardingHospitals.length} awaiting review`}
        >
          {onboardingHospitals.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-500">No hospitals awaiting approval.</p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {onboardingHospitals.map(h => (
                <li key={h.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
                    <Building2 className="size-4.5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-800">{h.name}</p>
                    <p className="text-xs text-ink-500">
                      {h.city}, {h.state} · Joined {formatDate(h.joinedAt)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      approve.mutate(
                        { hospitalId: h.id, status: 'active' },
                        {
                          onSuccess: () => toast.success('Hospital approved', `${h.name} is now active.`),
                          onError: () => toast.error('Could not approve hospital'),
                        },
                      )
                    }
                    disabled={approve.isPending}
                  >
                    <UserCheck className="size-3.5" aria-hidden />
                    Approve
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Contact ${h.name}`}
                    title="Contact"
                    onClick={() => toast.info('Contact initiated', `Opening contact flow for ${h.name}.`)}
                  >
                    <Phone className="size-3.5" aria-hidden />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Widget>

        <Widget title="Quick actions">
          <QuickActions actions={quickActions} />
        </Widget>
      </div>

      <div className="mt-6">
        <PartnerApprovalQueue />
      </div>

      <ApplicationDetailModal open={selected !== null} onClose={() => setSelected(null)} application={selected} />
    </div>
  )
}

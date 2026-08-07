import {
  BarChart3,
  Building2,
  ClipboardList,
  Download,
  GraduationCap,
  Megaphone,
  UserPlus,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button, ButtonLink } from '@/components/ui/button'
import { KpiCard } from '@/components/ui/kpi-card'
import { Widget } from '@/components/ui/widget'
import { QuickActions, type QuickAction } from '@/components/ui/quick-actions'
import { ActivityFeed } from '@/components/ui/activity-feed'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { PageLoader } from '@/components/ui/spinner'
import { StatusBadge, applicationStatusMeta } from '@/components/ui/status-badge'
import { LineChart } from '@/components/charts/line-chart'
import { DonutChart } from '@/components/charts/donut-chart'
import { HBarChart } from '@/components/charts/hbar-chart'
import { PartnerApprovalQueue } from '@/components/admin/partner-approval-queue'
import { formatDate } from '@/lib/utils'
import {
  useAdminAnalytics,
  useAdminKpis,
  usePlatformUptime,
  useRecentActivity,
  useRecentApplications,
} from '@/lib/adminQueries'
import type { AdminApplication } from '@/mocks/admin/operations'

export function SuperAdminOverviewPage() {
  const kpis = useAdminKpis()
  const analytics = useAdminAnalytics()
  const activity = useRecentActivity()
  const recent = useRecentApplications()
  const uptime = usePlatformUptime()

  if (
    kpis.isLoading ||
    analytics.isLoading ||
    activity.isLoading ||
    recent.isLoading ||
    uptime.isLoading
  ) {
    return <PageLoader label="Loading dashboard…" />
  }

  const pendingReviews = kpis.data?.find(k => k.id === 'pending')?.value ?? '—'

  const quickActions: QuickAction[] = [
    { label: 'Invite admin', description: 'Add a platform administrator', icon: UserPlus, to: '/dashboard/super-admin/users', tone: 'brand' },
    { label: 'New announcement', description: 'Notify your audience', icon: Megaphone, to: '/dashboard/super-admin/announcements', tone: 'accent' },
    { label: 'Review applications', description: `${pendingReviews} pending reviews`, icon: ClipboardList, to: '/dashboard/super-admin/applications', tone: 'amber' },
    { label: 'Add hospital', description: 'Onboard a partner', icon: Building2, to: '/dashboard/super-admin/hospitals', tone: 'sky' },
    { label: 'Create program', description: 'Publish an elective', icon: GraduationCap, to: '/dashboard/super-admin/programs', tone: 'violet' },
    { label: 'View analytics', description: 'Full platform metrics', icon: BarChart3, to: '/dashboard/super-admin/analytics', tone: 'rose' },
  ]

  const columns: DataTableColumn<AdminApplication>[] = [
    {
      key: 'id',
      header: 'Application',
      cell: r => <span className="font-semibold text-ink-900">{r.id}</span>,
      sortValue: r => r.id,
    },
    { key: 'student', header: 'Student', cell: r => r.student, sortValue: r => r.student },
    { key: 'hospital', header: 'Hospital', cell: r => r.hospital },
    { key: 'specialty', header: 'Specialty', cell: r => r.specialty },
    {
      key: 'status',
      header: 'Status',
      cell: r => {
        const meta = applicationStatusMeta(r.status)
        return <StatusBadge label={meta.label} tone={meta.tone} />
      },
    },
    { key: 'reviewer', header: 'Reviewer', cell: r => r.reviewer },
    {
      key: 'submitted',
      header: 'Submitted',
      cell: r => formatDate(r.submittedAt),
      align: 'right',
      sortValue: r => r.submittedAt,
    },
    {
      key: 'action',
      header: '',
      cell: () => (
        <ButtonLink to="/dashboard/super-admin/applications" variant="ghost" size="sm" className="whitespace-nowrap">
          View
        </ButtonLink>
      ),
      align: 'right',
    },
  ]

  const analyticsData = analytics.data!

  return (
    <div>
      <PageHeader
        title="Operations Overview"
        subtitle="Platform-wide performance, activity, and pending work at a glance."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="size-4" aria-hidden />
              Export
            </Button>
            <ButtonLink to="/dashboard/super-admin/users" size="sm">
              <UserPlus className="size-4" aria-hidden />
              Invite admin
            </ButtonLink>
          </>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.data!.map(kpi => (
          <KpiCard key={kpi.id} label={kpi.label} value={kpi.value} icon={kpi.icon} delta={kpi.delta} deltaTone={kpi.deltaTone} hint={kpi.hint} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Widget title="Registration trend" subtitle="New students per month" className="lg:col-span-2">
          <LineChart data={analyticsData.monthlyRegistrations} />
        </Widget>
        <Widget title="Applications by status" subtitle="All active applications">
          <DonutChart data={analyticsData.applicationsByStatus} />
        </Widget>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Widget title="Applications by specialty" subtitle="Volume across disciplines">
          <HBarChart data={analyticsData.applicationsBySpecialty} />
        </Widget>
        <Widget title="Quick actions" className="lg:col-span-2">
          <QuickActions actions={quickActions} />
        </Widget>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Widget title="Recent activity" subtitle="Latest platform events" className="lg:col-span-2">
          <ActivityFeed items={activity.data ?? []} />
        </Widget>
        <Widget title="Platform health" subtitle="Service uptime · trailing 90 days">
          <ul className="space-y-4">
            {uptime.data!.map(service => (
              <li key={service.name}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-ink-600">{service.name}</span>
                  <span className={service.tone === 'warn' ? 'font-semibold text-amber-600' : 'font-semibold text-ink-800'}>
                    {service.uptime}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                  <div
                    className={`h-full rounded-full ${service.tone === 'warn' ? 'bg-amber-500' : 'bg-brand-500'}`}
                    style={{ width: `${service.uptime}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Widget>
      </div>

      <div className="mt-6">
        <Widget
          title="Recent applications"
          subtitle="Latest submissions across the platform"
          action={
            <ButtonLink to="/dashboard/super-admin/applications" variant="outline" size="sm">
              View all
            </ButtonLink>
          }
        >
          <DataTable columns={columns} data={recent.data ?? []} keyField="id" bare pageSize={6} />
        </Widget>
      </div>

      <div className="mt-6">
        <PartnerApprovalQueue title="Internal user approval queue" />
      </div>
    </div>
  )
}

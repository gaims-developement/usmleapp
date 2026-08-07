import { Download, TrendingDown, TrendingUp } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Widget } from '@/components/ui/widget'
import { PageLoader } from '@/components/ui/spinner'
import { LineChart } from '@/components/charts/line-chart'
import { DonutChart } from '@/components/charts/donut-chart'
import { HBarChart } from '@/components/charts/hbar-chart'
import { GroupedBarChart } from '@/components/charts/grouped-bar-chart'
import { useAdminAnalytics } from '@/lib/adminQueries'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function SuperAdminAnalyticsPage() {
  const analytics = useAdminAnalytics()

  if (analytics.isLoading) return <PageLoader label="Loading analytics…" />

  const data = analytics.data!

  const summary = [
    { label: 'Avg review turnaround', value: '3.1 days', note: 'down 0.4d', positive: true },
    { label: 'Conversion to offer', value: '27%', note: 'up 2.1pp', positive: true },
    { label: 'Offer to confirmation', value: '47%', note: 'up 1.4pp', positive: true },
    { label: 'Top source country', value: 'India', note: '33% of applicants', positive: null },
  ]

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Detailed platform metrics across registrations, applications, capacity, and revenue."
        actions={
          <Button variant="outline" size="sm">
            <Download className="size-4" aria-hidden />
            Export report
          </Button>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map(item => (
          <div key={item.label} className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
            <p className="text-sm text-ink-500">{item.label}</p>
            <div className="mt-2 flex items-baseline justify-between gap-2">
              <p className="font-display text-xl font-bold text-ink-900">{item.value}</p>
              {item.note && item.positive !== null && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 text-xs font-bold',
                    item.positive ? 'text-brand-700' : 'text-red-600',
                  )}
                >
                  {item.positive ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                  {item.note}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Widget title="Monthly registrations" subtitle="New accounts created per month" className="lg:col-span-2">
          <LineChart data={data.monthlyRegistrations} />
        </Widget>
        <Widget title="Applications by country" subtitle="Home country of applicants">
          <DonutChart data={data.applicationsByCountry} />
        </Widget>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Widget title="Applications by status" subtitle="Pipeline by current stage">
          <DonutChart data={data.applicationsByStatus} />
        </Widget>
        <Widget title="Applications by specialty" subtitle="Application volume by discipline" className="lg:col-span-2">
          <HBarChart data={data.applicationsBySpecialty} />
        </Widget>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Widget title="Electives filled vs available" subtitle="Seat utilization by specialty" className="lg:col-span-2">
          <GroupedBarChart
            labels={[
              { name: 'Filled', color: '#0d9488' },
              { name: 'Available', color: '#cbd5e1' },
            ]}
            data={data.electivesFilled.map(d => ({ label: d.label, values: [d.filled, d.available] }))}
          />
        </Widget>
        <Widget title="Revenue trend" subtitle="Monthly revenue from applications">
          <LineChart data={data.revenueTrend} color="#6366f1" valueFormat={formatCurrency} />
        </Widget>
      </div>
    </div>
  )
}

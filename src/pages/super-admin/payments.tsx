import { useMemo, useState } from 'react'
import { CreditCard, Download, Search } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { PageLoader } from '@/components/ui/spinner'
import { paymentStatusMeta, StatusBadge } from '@/components/ui/status-badge'
import { useAdminPayments } from '@/lib/adminQueries'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { PaymentRecord } from '@/mocks/admin/operations'

export function SuperAdminPaymentsPage() {
  const payments = useAdminPayments()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const filtered = useMemo(() => {
    let result = payments.data ?? []
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        p =>
          p.id.toLowerCase().includes(q) ||
          p.user.toLowerCase().includes(q) ||
          p.plan.toLowerCase().includes(q),
      )
    }
    if (status !== 'all') result = result.filter(p => p.status === status)
    return result
  }, [payments.data, search, status])

  if (payments.isLoading) return <PageLoader label="Loading payments…" />

  const totals = payments.data ?? []
  const revenue = totals.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
  const pendingAmount = totals.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)
  const refunds = totals.filter(p => p.status === 'refunded').reduce((sum, p) => sum + p.amount, 0)

  const columns: DataTableColumn<PaymentRecord>[] = [
    {
      key: 'id',
      header: 'Payment',
      cell: r => <span className="font-semibold text-ink-900">{r.id}</span>,
      sortValue: r => r.id,
    },
    { key: 'user', header: 'Customer', cell: r => r.user, sortValue: r => r.user },
    { key: 'plan', header: 'Plan', cell: r => r.plan },
    { key: 'method', header: 'Method', cell: r => r.method },
    {
      key: 'amount',
      header: 'Amount',
      cell: r => (
        <span className="font-semibold text-ink-800">{formatCurrency(r.amount)}</span>
      ),
      align: 'right',
      sortValue: r => r.amount,
    },
    {
      key: 'status',
      header: 'Status',
      cell: r => {
        const meta = paymentStatusMeta(r.status)
        return <StatusBadge label={meta.label} tone={meta.tone} />
      },
    },
    {
      key: 'date',
      header: 'Date',
      cell: r => formatDate(r.date),
      align: 'right',
      sortValue: r => r.date,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="All transactions, refunds, and billing activity."
        actions={
          <Button variant="outline" size="sm">
            <Download className="size-4" aria-hidden />
            Export
          </Button>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="flex items-center gap-1.5 text-sm text-ink-500">
            <CreditCard className="size-4" aria-hidden />
            Collected (paid)
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-ink-900">
            {formatCurrency(revenue)}
          </p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Pending</p>
          <p className="mt-2 font-display text-2xl font-bold text-amber-600">
            {formatCurrency(pendingAmount)}
          </p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Refunds issued</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink-900">
            {formatCurrency(refunds)}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID, customer, plan…"
            className="w-72 pl-9"
            aria-label="Search payments"
          />
        </div>
        <Select value={status} onChange={e => setStatus(e.target.value)} className="w-44" aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
          <option value="failed">Failed</option>
        </Select>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} data={filtered} keyField="id" pageSize={8} />
      </div>
    </div>
  )
}

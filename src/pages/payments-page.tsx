import { useEffect, useState } from 'react'
import { Download, Eye, Receipt } from 'lucide-react'
import { usePayments, usePaymentReceipt } from '@/lib/queries'
import { PageHeader } from '@/components/ui/page-header'
import { PageLoader, Spinner } from '@/components/ui/spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { StatusBadge } from '@/components/ui/status-badge'
import { paymentStatusMeta } from '@/components/ui/status-badge'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency, formatDate, paymentMethodLabels } from '@/lib/utils'
import { createReceiptCanvas, downloadReceipt } from '@/lib/receipt'
import type { Payment } from '@/lib/types'

const PAID = ['paid']
const PENDING = ['pending', 'awaiting_payment', 'payment_submitted', 'under_verification']
const REFUNDED = ['refunded']

function methodLabel(method: string): string {
  return paymentMethodLabels[method as keyof typeof paymentMethodLabels] ?? method.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function currency(value: number, code: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: code || 'USD',
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value)
}

export function PaymentsPage() {
  const { data, isPending } = usePayments()
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const receiptQuery = usePaymentReceipt(selectedPayment?.id ?? '', Boolean(selectedPayment))
  const receiptData = receiptQuery.data ?? null

  useEffect(() => {
    if (!receiptData) {
      setPreviewSrc(null)
      return
    }
    let cancelled = false
    void createReceiptCanvas(receiptData).then(canvas => {
      if (!cancelled) setPreviewSrc(canvas.toDataURL('image/png'))
    })
    return () => {
      cancelled = true
    }
  }, [receiptData])

  if (isPending) return <PageLoader label="Loading payments..." />

  const payments = data ?? []
  const paid = payments.filter(p => PAID.includes(p.status)).reduce((sum, p) => sum + p.amount, 0)
  const pending = payments.filter(p => PENDING.includes(p.status)).reduce((sum, p) => sum + p.amount, 0)
  const refunded = payments.filter(p => REFUNDED.includes(p.status)).reduce((sum, p) => sum + p.amount, 0)

  const cards = [
    { label: 'Total paid', value: paid, accent: 'text-emerald-600' },
    { label: 'Pending', value: pending, accent: 'text-amber-600' },
    { label: 'Refunded', value: refunded, accent: 'text-ink-500' },
  ]

  const closePreview = () => {
    setSelectedPayment(null)
    setDownloadError(null)
  }

  const canDownload =
    receiptData !== null && PAID.includes(receiptData.status) && previewSrc !== null

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" subtitle="Payment history for your elective applications and receipts." />

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(card => (
          <div key={card.label} className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-ink-500">{card.label}</p>
            <p className={cn('mt-1 text-2xl font-bold', card.accent)}>{formatCurrency(card.value)}</p>
          </div>
        ))}
      </div>

      {payments.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-200 bg-ink-50 text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Elective</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Method</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Amount</th>
                <th className="px-4 py-3 text-right font-semibold">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {payments.map(payment => {
                const canDownloadReceipt = PAID.includes(payment.status)
                return (
                  <tr key={payment.id} className="hover:bg-ink-50/50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink-800">{payment.specialty}</p>
                      <p className="text-xs text-ink-500">{payment.hospital}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-600">{formatDate(payment.paidAt || payment.submittedAt)}</td>
                    <td className="px-4 py-3 text-ink-600">{methodLabel(payment.paymentMethod)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge {...paymentStatusMeta(payment.status)} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-ink-800">{currency(payment.amount, payment.currency)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setDownloadError(null)
                          if (canDownloadReceipt) setSelectedPayment(payment)
                        }}
                        disabled={!canDownloadReceipt}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
                          canDownloadReceipt
                            ? 'cursor-pointer border-ink-300 text-ink-700 hover:border-brand-400 hover:text-brand-700'
                            : 'cursor-not-allowed border-ink-200 text-ink-300',
                        )}
                      >
                        <Eye className="size-3.5" aria-hidden />
                        Receipt
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={<Receipt className="size-7" />}
          title="No payments yet"
          description="Payments you make for elective applications will appear here."
        />
      )}

      <Modal
        open={Boolean(selectedPayment)}
        onClose={closePreview}
        title="Payment Receipt"
        description={receiptData ? receiptData.receiptNumber : undefined}
        size="lg"
        footer={
          <>
            {downloadError && <p className="mr-auto text-sm font-medium text-red-600">{downloadError}</p>}
            <Button
              variant="primary"
              size="sm"
              disabled={!canDownload}
              onClick={() => {
                if (!receiptData) return
                void downloadReceipt(receiptData).catch(() => {
                  setDownloadError('Could not generate receipt image.')
                })
              }}
            >
              <Download className="size-4" aria-hidden />
              Download Receipt
            </Button>
          </>
        }
      >
        {receiptQuery.isPending && (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-2xl border border-ink-200 bg-ink-50">
            <Spinner className="size-6" />
            <p className="text-sm text-ink-500">Loading receipt...</p>
          </div>
        )}
        {receiptQuery.isError && (
          <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-ink-200 bg-ink-50">
            <p className="text-sm font-medium text-red-600">
              The receipt could not be loaded for this payment.
            </p>
          </div>
        )}
        {previewSrc && (
          <div className="rounded-2xl border border-ink-200 bg-ink-50 p-3">
            <img
              src={previewSrc}
              alt="Payment receipt preview"
              className="mx-auto max-h-[68vh] w-auto rounded-xl bg-white shadow-sm"
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

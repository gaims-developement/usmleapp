import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { PaymentMethod } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function parseDateValue(value?: string | null): Date | null {
  if (!value) return null
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value)
  const d = isDateOnly ? new Date(`${value}T00:00:00`) : new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d
}

export function formatDate(value?: string | null): string {
  const d = parseDateValue(value)
  if (!d) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatMemberSince(value?: string | null): string {
  const d = parseDateValue(value)
  if (!d) {
    if (import.meta.env.DEV) {
      console.warn(`[utils] Member-since date is missing or invalid: ${String(value ?? '(empty)')}`)
    }
    return '—'
  }
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

const MINUTE_MS = 60_000

export function formatNotificationTime(value?: string | Date | null): string {
  const date = value instanceof Date ? value : value ? new Date(value) : null
  if (!date || Number.isNaN(date.getTime())) return ''
  const now = new Date()
  const diffMs = Math.max(0, now.getTime() - date.getTime())
  if (diffMs < MINUTE_MS) return 'Now'
  const minutes = Math.ceil(diffMs / MINUTE_MS)
  if (minutes <= 60) return `${minutes} min ago`
  const sameDay = date.toDateString() === now.toDateString()
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  if (sameDay) return time
  const isThisYear = date.getFullYear() === now.getFullYear()
  if (isThisYear) {
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  }
  return date.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function initialsOf(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  razorpay: 'Razorpay',
  stripe: 'Stripe',
  card: 'Debit / Credit card',
  bank_transfer: 'Bank transfer',
  upi: 'UPI',
  paypal: 'PayPal',
}


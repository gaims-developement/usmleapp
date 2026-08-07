import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type DeltaTone = 'up' | 'down' | 'neutral'

interface KpiCardProps {
  label: string
  value: string
  icon: LucideIcon
  delta?: string
  deltaTone?: DeltaTone
  hint?: string
  className?: string
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  delta,
  deltaTone = 'up',
  hint,
  className,
}: KpiCardProps) {
  const deltaClass =
    deltaTone === 'up'
      ? 'bg-brand-50 text-brand-700'
      : deltaTone === 'down'
        ? 'bg-red-50 text-red-600'
        : 'bg-ink-100 text-ink-600'
  const DeltaIcon = deltaTone === 'up' ? ArrowUpRight : deltaTone === 'down' ? ArrowDownRight : Minus

  return (
    <div
      className={cn(
        'rounded-3xl border border-ink-200 bg-white p-5 shadow-soft transition-shadow hover:shadow-lift',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <span className="grid size-10 place-items-center rounded-xl bg-ink-50 text-ink-600">
          <Icon className="size-5" aria-hidden />
        </span>
        {delta && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold',
              deltaClass,
            )}
          >
            <DeltaIcon className="size-3.5" aria-hidden />
            {delta}
          </span>
        )}
      </div>
      <p className="mt-4 font-display text-2xl font-bold text-ink-900">{value}</p>
      <p className="mt-1 text-sm text-ink-500">{label}</p>
      {hint && <p className="mt-2 text-xs text-ink-400">{hint}</p>}
    </div>
  )
}

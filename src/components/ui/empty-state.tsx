import type { ReactNode } from 'react'
import { ButtonLink } from '@/components/ui/button'

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionTo,
}: {
  icon: ReactNode
  title: string
  description: string
  actionLabel?: string
  actionTo?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-ink-300 bg-white/60 px-6 py-16 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">{icon}</div>
      <h3 className="mt-4 font-display text-lg font-bold text-ink-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-600">{description}</p>
      {actionLabel && actionTo && (
        <ButtonLink to={actionTo} size="sm" className="mt-5">
          {actionLabel}
        </ButtonLink>
      )}
    </div>
  )
}

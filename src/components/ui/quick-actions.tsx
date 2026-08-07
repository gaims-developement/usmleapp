import { ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ButtonLink } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface QuickAction {
  label: string
  description?: string
  icon: LucideIcon
  to?: string
  onClick?: () => void
  tone?: 'brand' | 'accent' | 'amber' | 'violet' | 'sky' | 'rose'
}

const toneMap: Record<NonNullable<QuickAction['tone']>, string> = {
  brand: 'bg-brand-50 text-brand-600',
  accent: 'bg-accent-50 text-accent-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
  sky: 'bg-sky-50 text-sky-600',
  rose: 'bg-rose-50 text-rose-600',
}

export function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {actions.map(action => {
        const inner = (
          <>
            <span
              className={cn(
                'grid size-10 shrink-0 place-items-center rounded-xl',
                toneMap[action.tone ?? 'brand'],
              )}
            >
              <action.icon className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink-800">{action.label}</span>
              {action.description && (
                <span className="block truncate text-xs text-ink-500">{action.description}</span>
              )}
            </span>
            <ChevronRight className="size-4 shrink-0 text-ink-300" aria-hidden />
          </>
        )
        const cls = cn(
          'flex items-center gap-3 rounded-2xl border border-ink-200 bg-white p-3.5 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift',
        )
        return action.to ? (
          <ButtonLink key={action.label} to={action.to} variant="ghost" className={cls}>
            {inner}
          </ButtonLink>
        ) : (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className={cn('cursor-pointer', cls)}
          >
            {inner}
          </button>
        )
      })}
    </div>
  )
}

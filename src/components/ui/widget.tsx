import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Widget({
  title,
  subtitle,
  action,
  children,
  className,
  bodyClassName,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section className={cn('rounded-3xl border border-ink-200 bg-white p-5 shadow-soft sm:p-6', className)}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-base font-bold text-ink-900">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}

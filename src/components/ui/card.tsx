import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('rounded-3xl border border-ink-200 bg-white p-5 shadow-soft sm:p-6', className)}>
      {children}
    </div>
  )
}

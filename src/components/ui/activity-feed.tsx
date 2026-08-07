import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ActivityFeedItem {
  id: string
  icon: LucideIcon
  title: string
  detail?: string
  time: string
  iconClassName?: string
}

export function ActivityFeed({ items }: { items: ActivityFeedItem[] }) {
  return (
    <ol className="divide-y divide-ink-100">
      {items.map(item => (
        <li key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
          <span
            className={cn(
              'mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg',
              item.iconClassName ?? 'bg-brand-50 text-brand-600',
            )}
          >
            <item.icon className="size-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink-800">{item.title}</p>
            {item.detail && <p className="truncate text-xs text-ink-500">{item.detail}</p>}
          </div>
          <span className="shrink-0 text-xs text-ink-400">{item.time}</span>
        </li>
      ))}
    </ol>
  )
}

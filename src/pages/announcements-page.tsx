import { useState } from 'react'
import { CalendarDays, ChevronDown, Megaphone, Pin } from 'lucide-react'
import { announcementCategoryMeta } from '@/mocks/announcements'
import { useAnnouncements } from '@/lib/studentQueries'
import { PageHeader } from '@/components/ui/page-header'
import { PageLoader } from '@/components/ui/spinner'
import { StatusBadge } from '@/components/ui/status-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'

const categoryTone: Record<string, 'brand' | 'amber' | 'sky' | 'violet' | 'neutral'> = {
  platform: 'brand',
  deadline: 'amber',
  resources: 'sky',
  match: 'violet',
  community: 'neutral',
}

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function AnnouncementsPage() {
  const { data, isPending } = useAnnouncements()
  const [openId, setOpenId] = useState<string | null>(null)

  if (isPending) return <PageLoader label="Loading announcements…" />

  const items = data ?? []

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Announcements" subtitle="Latest updates from the IMG Prep team." />
        <EmptyState
          icon={<Megaphone className="size-7" />}
          title="No announcements yet"
          description="Check back soon for platform updates, deadlines, and match news."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        subtitle="Latest updates on deadlines, new features, resources, and the match."
      />

      <div className="space-y-4">
        {items.map(announcement => {
          const meta = announcementCategoryMeta[announcement.category]
          const expanded = openId === announcement.id
          return (
            <article
              key={announcement.id}
              className={cn(
                'rounded-3xl border bg-white p-6 shadow-soft transition-colors',
                expanded ? 'border-brand-300' : 'border-ink-200 hover:border-ink-300',
              )}
            >
              <button
                type="button"
                onClick={() => setOpenId(expanded ? null : announcement.id)}
                className="flex w-full cursor-pointer items-start gap-3 text-left"
                aria-expanded={expanded}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {announcement.pinned && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-800">
                        <Pin className="size-3" aria-hidden />
                        Pinned
                      </span>
                    )}
                    <StatusBadge label={meta.label} tone={categoryTone[announcement.category]} />
                  </div>
                  <h2 className="mt-2 font-display text-lg font-bold leading-snug text-ink-900">
                    {announcement.title}
                  </h2>
                  <p className="mt-1 text-sm text-ink-600">{announcement.summary}</p>
                </div>
                <ChevronDown
                  className={cn('mt-1 size-5 shrink-0 text-ink-400 transition-transform', expanded && 'rotate-180')}
                  aria-hidden
                />
              </button>

              {expanded && (
                <div className="mt-4 border-t border-ink-100 pt-4">
                  <p className="text-sm leading-relaxed text-ink-700">{announcement.body}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-ink-500">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" aria-hidden />
                      {formatDate(announcement.date)}
                    </span>
                    <span className="font-medium text-ink-600">{announcement.author}</span>
                  </div>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}

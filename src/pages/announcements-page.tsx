import { useMemo, useRef, useState } from 'react'
import { Bell, CalendarDays, ChevronDown, Megaphone, Pin, Search, UploadCloud } from 'lucide-react'
import { announcementCategoryMeta } from '@/mocks/announcements'
import { useAnnouncements, useStudentNotifications } from '@/lib/studentQueries'
import { useUploadDocument } from '@/lib/queries'
import { PageHeader } from '@/components/ui/page-header'
import { PageLoader } from '@/components/ui/spinner'
import { StatusBadge } from '@/components/ui/status-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { cn, formatNotificationTime } from '@/lib/utils'

const categoryTone: Record<string, 'brand' | 'amber' | 'sky' | 'violet' | 'neutral'> = {
  platform: 'brand',
  deadline: 'amber',
  resources: 'sky',
  match: 'violet',
  community: 'neutral',
}

function formatAnnouncementDate(iso: string) {
  if (!iso || iso === '—') return 'Recently'
  return new Date(iso + (iso.includes('T') ? '' : 'T00:00:00')).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function AnnouncementsPage() {
  const announcements = useAnnouncements()
  const notifications = useStudentNotifications()
  const uploadDocument = useUploadDocument()
  const toast = useToast()
  const reuploadInputRef = useRef<HTMLInputElement>(null)

  const [activeTab, setActiveTab] = useState<'all' | 'notifications' | 'announcements'>('all')
  const [search, setSearch] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [reuploadingDocumentId, setReuploadingDocumentId] = useState<string | null>(null)

  // Map system notifications to unified feed format
  const notificationItems = useMemo(() => {
    const raw = notifications.data ?? []
    return raw.map(n => ({
      id: `notif-${n.id}`,
      originalId: n.id,
      itemType: 'NOTIFICATION' as const,
      title: n.title,
      body: (n as { body?: string; message?: string }).body || n.message || '',
      details: (n as { details?: Record<string, unknown> | null }).details ?? null,
      date: n.createdAt ?? n.rejectedAt ?? null,
      read: n.read,
      category: 'platform',
      documentId: n.documentId ?? null,
      documentName: n.documentName ?? null,
      rejectionReason: n.rejectionReason ?? null,
    }))
  }, [notifications.data])

  // Map announcements to unified feed format
  const announcementItems = useMemo(() => {
    const raw = announcements.data ?? []
    return raw.map(a => ({
      id: `ann-${a.id}`,
      originalId: a.id,
      itemType: 'ANNOUNCEMENT' as const,
      title: a.title,
      summary: a.summary,
      body: a.body,
      date: a.date,
      read: true,
      author: a.author,
      pinned: a.pinned,
      category: a.category,
    }))
  }, [announcements.data])

  // Combine and filter feed items
  const combinedFeed = useMemo(() => {
    let list: Array<
      | (typeof notificationItems)[number]
      | (typeof announcementItems)[number]
    > = []

    if (activeTab === 'all') {
      list = [...notificationItems, ...announcementItems]
    } else if (activeTab === 'notifications') {
      list = notificationItems
    } else {
      list = announcementItems
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        item => item.title.toLowerCase().includes(q) || item.body.toLowerCase().includes(q),
      )
    }

    return list
  }, [activeTab, notificationItems, announcementItems, search])

  const isLoading = announcements.isPending || notifications.isLoading
  if (isLoading) return <PageLoader label="Loading notifications & announcements…" />

  function openReuploadPicker(documentId: string) {
    const input = reuploadInputRef.current
    if (!input) return
    input.dataset.documentId = documentId
    input.click()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications & Announcements"
        subtitle="Latest updates on document verification, deadlines, platform features, and match news."
      />

      {/* TOP FILTER TABS & SEARCH BAR */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-ink-200 bg-white p-4 shadow-soft">
        <div className="flex items-center gap-1 rounded-xl bg-ink-100/70 p-1 text-xs font-semibold text-ink-600">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={cn(
              'cursor-pointer rounded-lg px-4 py-2 transition-colors',
              activeTab === 'all'
                ? 'bg-white text-ink-900 shadow-sm'
                : 'hover:text-ink-900',
            )}
          >
            All ({notificationItems.length + announcementItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={cn(
              'cursor-pointer rounded-lg px-4 py-2 transition-colors flex items-center gap-1.5',
              activeTab === 'notifications'
                ? 'bg-blue-600 text-white shadow-sm font-bold'
                : 'hover:text-ink-900 text-blue-700',
            )}
          >
            <span className="size-2 rounded-full bg-blue-400" />
            Notifications ({notificationItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('announcements')}
            className={cn(
              'cursor-pointer rounded-lg px-4 py-2 transition-colors flex items-center gap-1.5',
              activeTab === 'announcements'
                ? 'bg-amber-600 text-white shadow-sm font-bold'
                : 'hover:text-ink-900 text-amber-700',
            )}
          >
            <span className="size-2 rounded-full bg-amber-400" />
            Announcements ({announcementItems.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or message…"
            className="pl-10"
          />
        </div>
      </div>

      {/* FEED LIST */}
      <div className="space-y-3">
        {combinedFeed.length === 0 ? (
          <EmptyState
            icon={<Megaphone className="size-7" />}
            title="No items found"
            description="Check back soon for notifications and match updates."
          />
        ) : (
          combinedFeed.map(item => {
            const isNotification = item.itemType === 'NOTIFICATION'
            const isAnnouncement = item.itemType === 'ANNOUNCEMENT'
            const expanded = openId === item.id
            const meta = isAnnouncement && item.category ? announcementCategoryMeta[item.category] : null

            return (
              <article
                key={item.id}
                className={cn(
                  'rounded-2xl border p-5 transition-all shadow-soft',
                  isNotification
                    ? item.read
                      ? 'border-blue-200/80 bg-blue-50/20 border-l-4 border-l-blue-500'
                      : 'border-blue-300 bg-blue-50/70 border-l-4 border-l-blue-600 shadow-sm'
                    : 'border-amber-200/80 bg-amber-50/20 border-l-4 border-l-amber-500',
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(expanded ? null : item.id)}
                  className="flex w-full cursor-pointer items-start gap-4 text-left"
                  aria-expanded={expanded}
                >
                  <span
                    className={cn(
                      'grid size-10 shrink-0 place-items-center rounded-xl font-bold mt-0.5',
                      isNotification
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-100 text-amber-700',
                    )}
                  >
                    {isNotification ? (
                      <Bell className="size-5" aria-hidden />
                    ) : (
                      <Megaphone className="size-5" aria-hidden />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                          isNotification
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800',
                        )}
                      >
                        {isNotification ? 'NOTIFICATION' : 'ANNOUNCEMENT'}
                      </span>
                      {isAnnouncement && item.pinned && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-800">
                          <Pin className="size-3" aria-hidden />
                          Pinned
                        </span>
                      )}
                      {meta && <StatusBadge label={meta.label} tone={categoryTone[item.category!]} />}
                      {isNotification && !item.read && (
                        <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                          UNREAD
                        </span>
                      )}
                    </div>

                    <h2 className="mt-1.5 font-display text-base font-bold leading-snug text-ink-900">
                      {item.title}
                    </h2>
                    <p className="mt-1 text-sm text-ink-600 leading-relaxed">
                      {'summary' in item && item.summary ? item.summary : item.body}
                    </p>
                  </div>

                  <ChevronDown
                    className={cn('mt-1 size-5 shrink-0 text-ink-400 transition-transform', expanded && 'rotate-180')}
                    aria-hidden
                  />
                </button>

                {expanded && (
                  <div className="mt-4 border-t border-ink-200/60 pt-4 pl-14">
                    {isNotification && 'rejectionReason' in item && item.rejectionReason ? (
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-ink-500">
                            Rejection reason
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink-700">
                            {item.rejectionReason}
                          </p>
                        </div>
                        {item.documentId && (
                          <button
                            type="button"
                            onClick={() => openReuploadPicker(item.documentId!)}
                            disabled={reuploadingDocumentId === item.documentId}
                            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100"
                          >
                            <UploadCloud className="size-4" aria-hidden />
                            {reuploadingDocumentId === item.documentId ? 'Uploading...' : 'Re-upload Document'}
                          </button>
                        )}
                      </div>
                    ) : isNotification && 'details' in item && item.details && typeof item.details === 'object' && Object.keys(item.details).length > 0 ? (
                      <div className="space-y-3">
                        {Object.entries(item.details as Record<string, unknown>).filter(([, v]) => v != null && v !== '').map(([key, value]) => (
                          <div key={key} className="flex items-start gap-3 text-sm">
                            <span className="min-w-[7rem] font-medium text-ink-500 shrink-0">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                            </span>
                            <span className="text-ink-800">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    ) : isNotification ? (
                      <p className="text-sm leading-relaxed text-ink-700">{item.body}</p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-ink-500">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="size-3.5" aria-hidden />
                        {isNotification ? formatNotificationTime(item.date) : formatAnnouncementDate(item.date)}
                      </span>
                      {'author' in item && item.author && (
                        <span className="font-medium text-ink-600">by {item.author}</span>
                      )}
                    </div>
                  </div>
                )}
              </article>
            )
          })
        )}
      </div>
      <input
        ref={reuploadInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          const documentId = e.target.dataset.documentId
          if (file && documentId) {
            const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
            const isImage = file.type.startsWith('image/')
            const tooLarge = isPdf ? file.size > 5 * 1024 * 1024 : isImage ? file.size > 1 * 1024 * 1024 : false
            if (!isPdf && !isImage) {
              toast.error('File not accepted', 'Only PDF, JPG, PNG, or WEBP files are allowed.')
            } else if (tooLarge) {
              toast.error('File too large', isPdf ? 'PDFs must be 5 MB or smaller.' : 'Images must be 1 MB or smaller.')
            } else {
              setReuploadingDocumentId(documentId)
              uploadDocument.mutate(
                { id: documentId, file },
                {
                  onSettled: () => {
                    setReuploadingDocumentId(null)
                  },
                },
              )
            }
          }
          e.target.value = ''
        }}
      />
    </div>
  )
}

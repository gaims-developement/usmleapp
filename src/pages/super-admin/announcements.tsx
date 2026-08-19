import { useMemo, useState } from 'react'
import {
  Bell,
  Calendar,
  CheckCheck,
  CircleAlert,
  Eye,
  Megaphone,
  Plus,
  Search,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { PageLoader } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/toast'
import { ApiError } from '@/lib/apiClient'
import {
  useAnnouncements,
  useMarkNotificationsRead,
  useNotifications,
  useSendAnnouncement,
} from '@/lib/adminQueries'
import { cn, formatDate, formatNotificationTime } from '@/lib/utils'

const audienceOptions = [
  { value: 'ALL', label: 'All Users' },
  { value: 'STUDENT', label: 'Students' },
  { value: 'DOCTOR', label: 'Doctors' },
  { value: 'REVIEWER', label: 'Reviewers' },
  { value: 'HOSPITAL', label: 'Hospital Staff' },
  { value: 'ADMIN', label: 'Admins' },
  { value: 'SUPER_ADMIN', label: 'Super Admins' },
]

const emptyComposer = {
  type: 'announcement' as 'announcement' | 'notification',
  title: '',
  message: '',
  audience: 'ALL',
  priority: 'normal' as 'normal' | 'important' | 'urgent',
  titleError: '',
  messageError: '',
  submitError: '',
}

export function SuperAdminAnnouncementsPage() {
  const announcements = useAnnouncements()
  const notifications = useNotifications()
  const markRead = useMarkNotificationsRead()
  const send = useSendAnnouncement()
  const toast = useToast()

  const [activeTab, setActiveTab] = useState<'all' | 'notifications' | 'announcements'>('all')
  const [search, setSearch] = useState('')
  const [composerOpen, setComposerOpen] = useState(false)
  const [composer, setComposer] = useState(emptyComposer)

  function handleSend() {
    const title = composer.title.trim()
    const message = composer.message.trim()
    const titleError = title ? '' : 'Title is required.'
    const messageError = message ? '' : 'Message is required.'

    if (titleError || messageError) {
      setComposer(c => ({ ...c, titleError, messageError, submitError: '' }))
      toast.error('Please complete the required fields.')
      return
    }

    send.mutate(
      {
        type: composer.type,
        title,
        body: message,
        audience: composer.audience === 'ALL' ? 'ALL' : [composer.audience],
        priority: composer.priority,
      },
      {
        onSuccess: () => {
          toast.success('Announcement sent successfully.')
          setComposerOpen(false)
          setComposer(emptyComposer)
        },
        onError: (error: unknown) => {
          const message = error instanceof ApiError
            ? error.message
            : 'Could not send the announcement. Please try again.'
          setComposer(c => ({ ...c, submitError: message }))
          toast.error('Could not send announcement', message)
        },
      },
    )
  }

  // Map notifications to unified feed format
  const notificationItems = useMemo(() => {
    const raw = notifications.data ?? []
    return raw.map(n => ({
      id: `notif-${n.id}`,
      originalId: n.id,
      itemType: 'NOTIFICATION' as const,
      title: n.title,
      body: n.body,
      date: n.createdAt ? formatNotificationTime(n.createdAt) : n.time || 'Recently',
      read: n.read,
      tone: n.tone || 'info',
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
      body: a.body || `Audience: ${a.audience} · ${a.status.toUpperCase()} · Published: ${a.publishedAt ? formatDate(a.publishedAt) : '—'}`,
      date: a.publishedAt ? formatDate(a.publishedAt) : 'Draft',
      read: true,
      author: a.author,
      views: a.views,
      status: a.status,
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

  const isLoading = announcements.isLoading || notifications.isLoading
  if (isLoading) return <PageLoader label="Loading notifications & announcements…" />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications & Announcements"
        subtitle="Manage system alerts, student notifications, and platform-wide communications."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => markRead.mutate()}>
              <CheckCheck className="size-4" aria-hidden />
              Mark all read
            </Button>
            <Button size="sm" onClick={() => setComposerOpen(true)}>
              <Plus className="size-4" aria-hidden />
              New announcement
            </Button>
          </div>
        }
      />

      {/* TOP CATEGORY FILTER TABS & SEARCH BAR */}
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
            placeholder="Search by title or content…"
            className="pl-10"
          />
        </div>
      </div>

      {/* UNIFIED CARDS FEED */}
      <div className="space-y-3">
        {combinedFeed.length === 0 ? (
          <div className="rounded-2xl border border-ink-200 bg-white p-12 text-center text-ink-500">
            <Bell className="mx-auto size-8 text-ink-300 mb-2" />
            <p className="font-semibold text-ink-700">No items found</p>
            <p className="text-xs text-ink-400 mt-1">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          combinedFeed.map(item => {
            const isNotification = item.itemType === 'NOTIFICATION'

            return (
              <div
                key={item.id}
                className={cn(
                  'relative flex flex-col gap-3 rounded-2xl border p-5 transition-all shadow-soft sm:flex-row sm:items-start sm:justify-between',
                  isNotification
                    ? item.read
                      ? 'border-blue-200/80 bg-blue-50/20 border-l-4 border-l-blue-500'
                      : 'border-blue-300 bg-blue-50/70 border-l-4 border-l-blue-600 shadow-sm'
                    : 'border-amber-200/80 bg-amber-50/20 border-l-4 border-l-amber-500',
                )}
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <span
                    className={cn(
                      'grid size-10 shrink-0 place-items-center rounded-xl font-bold',
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
                      {!item.read && isNotification && (
                        <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                          UNREAD
                        </span>
                      )}
                    </div>

                    <h3 className="mt-1.5 font-display text-base font-bold text-ink-900 leading-snug">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-ink-600 leading-relaxed">{item.body}</p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3 text-xs text-ink-400 self-end sm:self-start">
                  <span className="inline-flex items-center gap-1 font-medium text-ink-500">
                    <Calendar className="size-3.5" aria-hidden />
                    {item.date}
                  </span>
                  {'views' in item && item.views !== undefined && (
                    <span className="inline-flex items-center gap-1 font-semibold text-ink-600">
                      <Eye className="size-3.5 text-ink-400" aria-hidden />
                      {item.views.toLocaleString()} views
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* CREATE ANNOUNCEMENT / NOTIFICATION MODAL */}
      <Modal
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        title="Create Announcement"
        description="Send an announcement or notification to users across IMG Prep."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setComposerOpen(false)} disabled={send.isPending}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSend} disabled={send.isPending}>
              {send.isPending ? 'Sending…' : 'Send Announcement'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {composer.submitError && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>{composer.submitError}</span>
            </div>
          )}

          <div>
            <Label htmlFor="comp-type">Announcement type</Label>
            <Select
              id="comp-type"
              value={composer.type}
              onChange={e => setComposer(c => ({ ...c, type: e.target.value as 'announcement' | 'notification' }))}
              aria-label="Select announcement type"
            >
              <option value="announcement">Announcement</option>
              <option value="notification">Notification</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="comp-title">Title</Label>
            <Input
              id="comp-title"
              value={composer.title}
              onChange={e => setComposer(c => ({ ...c, title: e.target.value, titleError: '' }))}
              placeholder="Enter announcement title"
              maxLength={200}
            />
            {composer.titleError && <p className="mt-1 text-xs font-medium text-red-600">{composer.titleError}</p>}
          </div>

          <div>
            <Label htmlFor="comp-message">Message / Content</Label>
            <Textarea
              id="comp-message"
              value={composer.message}
              onChange={e => setComposer(c => ({ ...c, message: e.target.value, messageError: '' }))}
              rows={4}
              placeholder="Write your announcement..."
              maxLength={10000}
            />
            {composer.messageError && <p className="mt-1 text-xs font-medium text-red-600">{composer.messageError}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="comp-audience">Recipient / Audience</Label>
              <Select
                id="comp-audience"
                value={composer.audience}
                onChange={e => setComposer(c => ({ ...c, audience: e.target.value }))}
                aria-label="Select audience"
              >
                {audienceOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="comp-priority">Priority</Label>
              <Select
                id="comp-priority"
                value={composer.priority}
                onChange={e => setComposer(c => ({ ...c, priority: e.target.value as 'normal' | 'important' | 'urgent' }))}
                aria-label="Select priority"
              >
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </Select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

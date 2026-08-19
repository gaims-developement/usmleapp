import { useEffect, useMemo, useState } from 'react'
import { Bell, Calendar, Download, Eye, Megaphone, Plus, Search } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Modal, ConfirmDialog } from '@/components/ui/modal'
import { PageLoader } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/toast'
import {
  useAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
  useNotifications,
  useUpdateAnnouncement,
  type NewAnnouncementInput,
} from '@/lib/adminQueries'
import { downloadCsv } from '@/lib/csv'
import { cn, formatDate, formatNotificationTime } from '@/lib/utils'
import type { Announcement } from '@/mocks/admin/content'

const audiences = ['All students', 'All users', 'Reviewers', 'Hospitals & students', 'Doctors']

  const emptyForm: NewAnnouncementInput = {
    title: '',
    body: '',
    audience: 'All students',
    status: 'draft',
    publishedAt: '',
  }

export function AdminAnnouncementsPage() {
  const announcements = useAnnouncements()
  const create = useCreateAnnouncement()
  const update = useUpdateAnnouncement()
  const remove = useDeleteAnnouncement()
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [form, setForm] = useState<NewAnnouncementInput>(emptyForm)
  const [body, setBody] = useState('')
  const [deleting, setDeleting] = useState<Announcement | null>(null)

  useEffect(() => {
    if (!editorOpen) return
    if (editing) {
      setForm({
        title: editing.title,
        body: editing.body ?? '',
        audience: editing.audience,
        status: editing.status,
        publishedAt: editing.publishedAt !== '—' ? editing.publishedAt : '',
      })
      setBody(editing.body ?? '')
    } else {
      setForm(emptyForm)
      setBody('')
    }
  }, [editorOpen, editing])

  const notifications = useNotifications()
  const [activeTab, setActiveTab] = useState<'all' | 'notifications' | 'announcements'>('all')

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

  if (announcements.isLoading || notifications.isLoading) return <PageLoader label="Loading notifications & announcements…" />

  const all = announcements.data ?? []

  function handleExport() {
    downloadCsv(
      'announcements.csv',
      all.map(a => ({
        title: a.title,
        audience: a.audience,
        status: a.status,
        author: a.author,
        date: a.publishedAt,
        views: a.views,
      })),
    )
  }

  const canSubmit = form.title.trim() && form.audience && (form.status !== 'scheduled' || Boolean(form.publishedAt))

  function handleSubmit() {
    const payload = {
      ...form,
      body,
      publishedAt: form.status === 'draft' ? '' : form.publishedAt,
    }
    if (editing) {
      update.mutate(
        { announcementId: editing.id, data: payload },
        {
          onSuccess: () => {
            toast.success('Announcement updated', form.title)
            setEditorOpen(false)
          },
          onError: () => toast.error('Could not update announcement'),
        },
      )
    } else {
      create.mutate(payload, {
        onSuccess: () => {
          toast.success('Announcement created', form.title)
          setEditorOpen(false)
        },
        onError: () => toast.error('Could not create announcement'),
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications & Announcements"
        subtitle="Manage system alerts, student notifications, and platform-wide communications."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="size-4" aria-hidden />
              Export CSV
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setEditing(null)
                setEditorOpen(true)
              }}
            >
              <Plus className="size-4" aria-hidden />
              New announcement
            </Button>
          </>
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

      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editing ? 'Edit announcement' : 'New announcement'}
        description={editing ? editing.id : 'Draft, schedule, or publish immediately.'}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setEditorOpen(false)} disabled={create.isPending || update.isPending}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={!canSubmit || create.isPending || update.isPending}>
              {editing ? 'Save changes' : 'Create announcement'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="ann-title">Title</Label>
            <Input id="ann-title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Winter rotation windows now open" />
          </div>
          <div>
            <Label htmlFor="ann-body">Message</Label>
            <Textarea id="ann-body" value={body} onChange={e => setBody(e.target.value)} rows={4} placeholder="Write the announcement body…" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ann-audience">Audience</Label>
              <Select id="ann-audience" value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))} aria-label="Select audience">
                {audiences.map(a => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="ann-status">Status</Label>
              <Select id="ann-status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as NewAnnouncementInput['status'] }))} aria-label="Select status">
                <option value="draft">Draft</option>
                <option value="published">Publish now</option>
                <option value="scheduled">Schedule</option>
              </Select>
            </div>
          </div>
          {form.status === 'scheduled' && (
            <div>
              <Label htmlFor="ann-date">Publish on</Label>
              <Input id="ann-date" type="date" value={form.publishedAt} onChange={e => setForm(f => ({ ...f, publishedAt: e.target.value }))} />
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return
          remove.mutate(deleting.id, {
            onSuccess: () => {
              toast.success('Announcement deleted', deleting.title)
              setDeleting(null)
            },
            onError: () => toast.error('Could not delete announcement'),
          })
        }}
        title="Delete announcement"
        description={`Delete “${deleting?.title}”? This cannot be undone.`}
        confirmLabel="Delete"
        tone="danger"
      />
    </div>
  )
}

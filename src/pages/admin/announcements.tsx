import { useEffect, useMemo, useState } from 'react'
import { Download, Eye, Megaphone, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Modal, ConfirmDialog } from '@/components/ui/modal'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { PageLoader } from '@/components/ui/spinner'
import { StatusBadge, announcementStatusMeta } from '@/components/ui/status-badge'
import { useToast } from '@/components/ui/toast'
import {
  useAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
  useUpdateAnnouncement,
  type NewAnnouncementInput,
} from '@/lib/adminQueries'
import { downloadCsv } from '@/lib/csv'
import { formatDate } from '@/lib/utils'
import type { Announcement } from '@/mocks/admin/content'

const audiences = ['All students', 'All users', 'Reviewers', 'Hospitals & students', 'Doctors']

const emptyForm: NewAnnouncementInput = {
  title: '',
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
  const [statusFilter, setStatusFilter] = useState('all')
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
        audience: editing.audience,
        status: editing.status,
        publishedAt: editing.publishedAt !== '—' ? editing.publishedAt : '',
      })
      setBody('')
    } else {
      setForm(emptyForm)
      setBody('')
    }
  }, [editorOpen, editing])

  const filtered = useMemo(() => {
    let result = announcements.data ?? []
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(a => a.title.toLowerCase().includes(q) || a.author.toLowerCase().includes(q))
    }
    if (statusFilter !== 'all') result = result.filter(a => a.status === statusFilter)
    return result
  }, [announcements.data, search, statusFilter])

  if (announcements.isLoading) return <PageLoader label="Loading announcements…" />

  const all = announcements.data ?? []
  const published = all.filter(a => a.status === 'published').length
  const scheduled = all.filter(a => a.status === 'scheduled').length
  const drafts = all.filter(a => a.status === 'draft').length

  const columns: DataTableColumn<Announcement>[] = [
    {
      key: 'title',
      header: 'Announcement',
      cell: r => (
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-50 text-accent-600">
            <Megaphone className="size-4.5" aria-hidden />
          </span>
          <div>
            <p className="font-semibold text-ink-900">{r.title}</p>
            <p className="text-xs text-ink-500">by {r.author}</p>
          </div>
        </div>
      ),
      sortValue: r => r.title,
    },
    { key: 'audience', header: 'Audience', cell: r => r.audience, sortValue: r => r.audience },
    {
      key: 'status',
      header: 'Status',
      cell: r => {
        const meta = announcementStatusMeta(r.status)
        return <StatusBadge label={meta.label} tone={meta.tone} />
      },
    },
    {
      key: 'publishedAt',
      header: 'Date',
      cell: r => (r.publishedAt === '—' ? 'Not set' : formatDate(r.publishedAt)),
      sortValue: r => r.publishedAt,
    },
    {
      key: 'views',
      header: 'Views',
      cell: r => (r.views > 0 ? r.views.toLocaleString() : '—'),
      align: 'right',
      sortValue: r => r.views,
    },
    {
      key: 'actions',
      header: '',
      cell: r => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => toast.info('Preview', `Previewing “${r.title}”.`)}>
            <Eye className="size-3.5" aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditing(r)
              setEditorOpen(true)
            }}
          >
            <Pencil className="size-3.5" aria-hidden />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="!text-red-600"
            onClick={() => setDeleting(r)}
            aria-label={`Delete ${r.title}`}
          >
            <Trash2 className="size-3.5" aria-hidden />
          </Button>
        </div>
      ),
      align: 'right',
    },
  ]

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
    <div>
      <PageHeader
        title="Announcements"
        subtitle="Create, schedule, and publish announcements to students and partners."
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

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Total</p>
          <div className="mt-2 flex items-center gap-2">
            <Megaphone className="size-5 text-accent-600" aria-hidden />
            <p className="font-display text-2xl font-bold text-ink-900">{all.length}</p>
          </div>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Published</p>
          <p className="mt-2 font-display text-2xl font-bold text-brand-700">{published}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Scheduled</p>
          <p className="mt-2 font-display text-2xl font-bold text-amber-600">{scheduled}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Drafts</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink-600">{drafts}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search announcements…"
            className="w-72 pl-9"
            aria-label="Search announcements"
          />
        </div>
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-40" aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
          <option value="draft">Draft</option>
        </Select>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} data={filtered} keyField="id" pageSize={10} />
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

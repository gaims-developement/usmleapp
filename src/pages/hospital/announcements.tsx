import { useState } from 'react'
import { Megaphone, Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PageLoader } from '@/components/ui/spinner'
import { StatusBadge, announcementStatusMeta } from '@/components/ui/status-badge'
import { Modal, ConfirmDialog } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import {
  useCreateHospitalAnnouncement,
  useDeleteHospitalAnnouncement,
  useHospitalAnnouncements,
  useUpdateHospitalAnnouncement,
} from '@/lib/hospitalQueries'
import { formatDate } from '@/lib/utils'
import type { HospitalAnnouncementInput } from '@/services/hospitalService'
import type { HospitalAnnouncement } from '@/mocks/hospital/announcements'

const audiences = [
  ['All Students', 'All Students'],
  ['Departments', 'Departments'],
  ['Coordinators', 'Coordinators'],
]

const EMPTY: HospitalAnnouncementInput = { title: '', body: '', audience: 'All Students', status: 'draft' }

export function HospitalAnnouncementsPage() {
  const announcements = useHospitalAnnouncements()
  const create = useCreateHospitalAnnouncement()
  const update = useUpdateHospitalAnnouncement()
  const remove = useDeleteHospitalAnnouncement()
  const toast = useToast()

  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<HospitalAnnouncement | null>(null)
  const [form, setForm] = useState<HospitalAnnouncementInput>(EMPTY)
  const [deleting, setDeleting] = useState<HospitalAnnouncement | null>(null)

  if (announcements.isLoading) return <PageLoader label="Loading announcements…" />

  function openNew() {
    setEditing(null)
    setForm(EMPTY)
    setEditorOpen(true)
  }

  function openEdit(a: HospitalAnnouncement) {
    setEditing(a)
    setForm({ title: a.title, body: a.body, audience: a.audience, status: a.status })
    setEditorOpen(true)
  }

  function handleSave() {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error('Missing fields', 'Title and body are required.')
      return
    }
    if (editing) {
      update.mutate(
        { announcementId: editing.id, patch: form },
        {
          onSuccess: () => {
            toast.success('Announcement updated', form.title)
            setEditorOpen(false)
          },
          onError: () => toast.error('Could not update announcement'),
        },
      )
    } else {
      create.mutate(form, {
        onSuccess: () => {
          toast.success('Announcement created', form.title)
          setEditorOpen(false)
        },
        onError: () => toast.error('Could not create announcement'),
      })
    }
  }

  const published = (announcements.data ?? []).filter(a => a.status === 'published')

  return (
    <div>
      <PageHeader
        title="Announcements"
        subtitle="Communicate with students, departments, and coordinators."
        actions={
          <Button size="sm" onClick={openNew}>
            <Plus className="size-4" aria-hidden />
            New announcement
          </Button>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Total announcements</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink-900">{announcements.data?.length ?? 0}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Published</p>
          <p className="mt-2 font-display text-2xl font-bold text-brand-600">{published.length}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Drafts</p>
          <p className="mt-2 font-display text-2xl font-bold text-neutral-600">
            {(announcements.data ?? []).filter(a => a.status === 'draft').length}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {(announcements.data ?? []).map(a => (
          <article key={a.id} className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Megaphone className="size-4.5 text-brand-600" aria-hidden />
                  <h3 className="font-display text-base font-bold text-ink-900">{a.title}</h3>
                  <StatusBadge label={announcementStatusMeta(a.status).label} tone={announcementStatusMeta(a.status).tone} />
                </div>
                <p className="mt-1 text-sm text-ink-500">
                  {a.id} · {a.author} · {a.publishedAt ? formatDate(a.publishedAt) : 'Not published'} · {a.audience}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(a)}>
                  <Pencil className="size-3.5" aria-hidden />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="!text-red-600" onClick={() => setDeleting(a)}>
                  <Trash2 className="size-3.5" aria-hidden />
                  Delete
                </Button>
              </div>
            </div>
            <p className="mt-3 text-sm text-ink-700">{a.body}</p>
          </article>
        ))}
      </div>

      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editing ? 'Edit announcement' : 'New announcement'}
        description={editing ? `Updating ${editing.id}.` : 'Share a message with your audience.'}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="a-title">Title</Label>
            <Input id="a-title" value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} className="mt-2" placeholder="e.g. Winter cohort orientation details" />
          </div>
          <div>
            <Label htmlFor="a-body">Body</Label>
            <Textarea id="a-body" value={form.body} onChange={e => setForm(prev => ({ ...prev, body: e.target.value }))} rows={4} className="mt-2" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="a-audience">Audience</Label>
              <Select id="a-audience" value={form.audience} onChange={e => setForm(prev => ({ ...prev, audience: e.target.value as HospitalAnnouncementInput['audience'] }))} className="mt-2 w-full">
                {audiences.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="a-status">Status</Label>
              <Select id="a-status" value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value as HospitalAnnouncementInput['status'] }))} className="mt-2 w-full">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </Select>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setEditorOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={create.isPending || update.isPending}>
            {create.isPending || update.isPending ? 'Saving…' : editing ? 'Save changes' : 'Create'}
          </Button>
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
        title="Delete announcement?"
        description={`“${deleting?.title}” will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete"
        tone="danger"
        loading={remove.isPending}
      />
    </div>
  )
}

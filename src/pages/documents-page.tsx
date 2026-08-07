import { useRef, useState } from 'react'
import {
  AlertTriangle,
  CalendarClock,
  FileText,
  FolderOpen,
  Loader2,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from 'lucide-react'
import type { UserDocument } from '@/lib/types'
import { useDocuments, useRemoveDocument, useUploadDocument } from '@/lib/queries'
import { PageHeader } from '@/components/ui/page-header'
import { PageLoader } from '@/components/ui/spinner'
import { UploadDropzone } from '@/components/ui/upload-dropzone'
import { Progress } from '@/components/ui/progress'
import { documentStatusMeta, StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const categoryOrder = ['Identity', 'Legal', 'Education', 'Exams', 'Medical', 'Evaluation']

function formatUploadDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function DocumentsPage() {
  const { data, isPending } = useDocuments()
  const upload = useUploadDocument()
  const remove = useRemoveDocument()
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const hiddenInputRef = useRef<HTMLInputElement>(null)

  if (isPending) return <PageLoader label="Loading documents…" />

  const docs = data ?? []
  const required = docs.filter(d => d.required)
  const ready = docs.filter(d => d.status === 'uploaded' || d.status === 'expiring')
  const readyRequired = required.filter(d => d.status === 'uploaded' || d.status === 'expiring').length
  const allRequiredReady = readyRequired === required.length

  const groups = categoryOrder
    .map(cat => ({ category: cat, docs: docs.filter(d => d.category === cat) }))
    .filter(g => g.docs.length > 0)

  async function handleUpload(docId: string, file: File) {
    setUploadingId(docId)
    try {
      await upload.mutateAsync({ id: docId, file })
    } finally {
      setUploadingId(null)
    }
  }

  function triggerPicker(docId: string) {
    const input = hiddenInputRef.current
    if (!input) return
    input.dataset.docId = docId
    input.click()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        subtitle="Upload and manage the documents required for your elective applications."
      />

      <div className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-display text-lg font-bold text-ink-900">
              {readyRequired} of {required.length} required documents ready
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-600">
              {allRequiredReady ? (
                <>
                  <ShieldCheck className="size-4 text-brand-600" aria-hidden />
                  You&apos;re ready to apply to any elective.
                </>
              ) : (
                <>
                  <AlertTriangle className="size-4 text-amber-600" aria-hidden />
                  Complete your file vault before submitting applications.
                </>
              )}
            </p>
          </div>
          <span className="text-sm font-semibold text-ink-800">
            {ready.length} of {docs.length} uploaded
          </span>
        </div>
        <Progress
          value={(readyRequired / Math.max(required.length, 1)) * 100}
          className="mt-4"
          barClassName={allRequiredReady ? 'bg-brand-600' : 'bg-amber-500'}
        />
      </div>

      <UploadDropzone onFile={setPendingFile} />

      <div className="space-y-8">
        {groups.map(group => (
          <section key={group.category}>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-400">
              {group.category}
            </h2>
            <div className="space-y-3">
              {group.docs.map(doc => (
                <DocumentRow
                  key={doc.id}
                  doc={doc}
                  uploading={uploadingId === doc.id}
                  onUpload={() => triggerPicker(doc.id)}
                  onRemove={() => {
                    if (window.confirm(`Remove "${doc.name}" from your documents?`)) {
                      remove.mutate(doc.id)
                    }
                  }}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <input
        ref={hiddenInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          const docId = e.target.dataset.docId
          if (file && docId) void handleUpload(docId, file)
          e.target.value = ''
        }}
      />

      {pendingFile && (
        <FileTargetModal
          file={pendingFile}
          docs={docs}
          onCancel={() => setPendingFile(null)}
          onSelect={async id => {
            await handleUpload(id, pendingFile)
            setPendingFile(null)
          }}
        />
      )}
    </div>
  )
}

function DocumentRow({
  doc,
  uploading,
  onUpload,
  onRemove,
}: {
  doc: UserDocument
  uploading: boolean
  onUpload: () => void
  onRemove: () => void
}) {
  const meta = documentStatusMeta(doc.status)
  const uploaded = doc.status === 'uploaded' || doc.status === 'expiring'

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-ink-200 bg-white px-5 py-4 shadow-soft">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ink-100 text-ink-500">
        <FileText className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-ink-900">{doc.name}</p>
          {!doc.required && <span className="text-xs text-ink-400">Optional</span>}
          <StatusBadge label={meta.label} tone={meta.tone} />
        </div>
        {uploaded && doc.fileName ? (
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-500">
            <span className="inline-flex items-center gap-1">
              <UploadCloud className="size-3.5" aria-hidden />
              {doc.fileName}
            </span>
            <span>Uploaded {doc.uploadedAt ? formatUploadDate(doc.uploadedAt) : ''}</span>
            {doc.expiresAt && (
              <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                <CalendarClock className="size-3.5" aria-hidden />
                Expires {formatUploadDate(doc.expiresAt)}
              </span>
            )}
          </p>
        ) : (
          <p className="mt-0.5 text-xs text-ink-400">Not uploaded yet</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {uploaded ? (
          <>
            <Button variant="outline" size="sm" onClick={onUpload} disabled={uploading}>
              {uploading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <UploadCloud className="size-4" aria-hidden />}
              Replace
            </Button>
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${doc.name}`}
              className="grid size-9 cursor-pointer place-items-center rounded-lg text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="size-4.5" aria-hidden />
            </button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={onUpload} disabled={uploading}>
            {uploading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <UploadCloud className="size-4" aria-hidden />}
            Upload
          </Button>
        )}
      </div>
    </div>
  )
}

function FileTargetModal({
  file,
  docs,
  onCancel,
  onSelect,
}: {
  file: File
  docs: UserDocument[]
  onCancel: () => void
  onSelect: (id: string) => Promise<void>
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink-950/50 p-4 sm:items-center" role="dialog" aria-modal>
      <div className="w-full max-w-md rounded-3xl border border-ink-200 bg-white p-6 shadow-lift">
        <h2 className="font-display text-lg font-bold text-ink-900">Which document is this?</h2>
        <p className="mt-1 truncate text-sm text-ink-600">
          <span className="font-medium text-ink-800">{file.name}</span> ({formatBytes(file.size)})
        </p>
        <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
          {docs.map(doc => {
            const isUploaded = doc.status === 'uploaded' || doc.status === 'expiring'
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => void onSelect(doc.id)}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                  'border-ink-200 hover:border-brand-400 hover:bg-brand-50/40',
                )}
              >
                <FolderOpen className="size-4 shrink-0 text-ink-400" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink-900">
                  {doc.name}
                </span>
                {isUploaded && <span className="shrink-0 text-xs font-medium text-ink-400">Replace</span>}
              </button>
            )
          })}
        </div>
        <Button variant="outline" size="md" className="mt-4 w-full" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

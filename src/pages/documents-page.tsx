import { useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  CalendarClock,
  Download,
  Eye,
  FileText,
  FileX,
  FolderOpen,
  Loader2,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from 'lucide-react'
import type { UserDocument } from '@/lib/types'
import { useDocuments, useRemoveDocument, useUploadDocument } from '@/lib/queries'
import { apiGetBlob, documentPreviewErrorMessage } from '@/lib/apiClient'
import { PageHeader } from '@/components/ui/page-header'
import { PageLoader, Spinner } from '@/components/ui/spinner'
import { UploadDropzone } from '@/components/ui/upload-dropzone'
import { Progress } from '@/components/ui/progress'
import { documentStatusMeta, StatusBadge } from '@/components/ui/status-badge'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

const categoryOrder = ['Identity', 'Legal', 'Education', 'Exams', 'Medical', 'Evaluation']
const MAX_PDF_BYTES = 5 * 1024 * 1024
const MAX_IMAGE_BYTES = 1 * 1024 * 1024

function validateDocumentFile(file: File): string | null {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  const isImage = file.type.startsWith('image/')
  if (!isPdf && !isImage) {
    return 'Only PDF, JPG, PNG, or WEBP files are allowed.'
  }
  if (isPdf && file.size > MAX_PDF_BYTES) {
    return 'PDFs must be 5 MB or smaller.'
  }
  if (isImage && file.size > MAX_IMAGE_BYTES) {
    return 'Images must be 1 MB or smaller.'
  }
  return null
}

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
  const toast = useToast()
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const hiddenInputRef = useRef<HTMLInputElement>(null)

  const [viewingDoc, setViewingDoc] = useState<UserDocument | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [fileLoading, setFileLoading] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

  useEffect(() => {
    if (!viewingDoc) {
      setFileUrl(null)
      setFileError(null)
      setFileLoading(false)
      return
    }

    const docId = viewingDoc.dbId ?? viewingDoc.id
    if (!docId) {
      setFileUrl(null)
      setFileLoading(false)
      setFileError('No file is linked to this document entry.')
      return
    }

    let isMounted = true
    let blobUrl: string | null = null

    async function fetchFileBlob() {
      setFileLoading(true)
      setFileError(null)

      try {
        const { blob, contentType } = await apiGetBlob(`/documents/${docId}/file`)
        if (isMounted) {
          const finalBlob = contentType ? new Blob([blob], { type: contentType }) : blob
          blobUrl = URL.createObjectURL(finalBlob)
          setFileUrl(blobUrl)
        }
      } catch (err) {
        if (isMounted) {
          setFileError(documentPreviewErrorMessage(err))
        }
      } finally {
        if (isMounted) setFileLoading(false)
      }
    }

    void fetchFileBlob()

    return () => {
      isMounted = false
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [viewingDoc])

  const isPdf = viewingDoc ? (viewingDoc.fileName ?? '').toLowerCase().endsWith('.pdf') : false
  const isImage = viewingDoc ? /\.(jpg|jpeg|png|webp)$/i.test(viewingDoc.fileName ?? '') : false

  function handleDownloadViewingFile() {
    if (!viewingDoc) return
    if (fileUrl) {
      const a = document.createElement('a')
      a.href = fileUrl
      a.download = viewingDoc.fileName ?? `${viewingDoc.name}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

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
    const validationError = validateDocumentFile(file)
    if (validationError) {
      toast.error('File not accepted', validationError)
      return
    }
    setUploadingId(docId)
    try {
      await upload.mutateAsync({ id: docId, file })
    } finally {
      setUploadingId(null)
    }
  }

  function handleFileSelected(file: File) {
    const validationError = validateDocumentFile(file)
    if (validationError) {
      toast.error('File not accepted', validationError)
      return
    }
    setPendingFile(file)
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

      <UploadDropzone onFile={handleFileSelected} />

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
                  onPreview={() => setViewingDoc(doc)}
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
        accept=".pdf,.jpg,.jpeg,.png,.webp"
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

      <Modal
        open={!!viewingDoc}
        onClose={() => setViewingDoc(null)}
        title={viewingDoc ? viewingDoc.name : 'Document Preview'}
        description={viewingDoc?.uploadedAt ? `Uploaded ${formatUploadDate(viewingDoc.uploadedAt)}` : undefined}
        size="lg"
        footer={
          viewingDoc && (
            <div className="flex w-full items-center justify-between gap-3">
              <Button variant="outline" size="sm" onClick={handleDownloadViewingFile}>
                <Download className="size-4" aria-hidden />
                Download
              </Button>
              <Button size="sm" onClick={() => setViewingDoc(null)}>
                Close
              </Button>
            </div>
          )
        }
      >
        {viewingDoc && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-ink-50 px-4 py-2.5 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-ink-700">Status:</span>
                <StatusBadge label={documentStatusMeta(viewingDoc.status).label} tone={documentStatusMeta(viewingDoc.status).tone} />
              </div>
              {viewingDoc.fileName && <span className="font-mono text-xs text-ink-500">{viewingDoc.fileName}</span>}
            </div>

            <div className="flex min-h-[400px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-ink-200 bg-ink-900/5 p-2">
              {fileLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-500">
                  <Spinner className="size-7 text-brand-600" />
                  <p className="text-sm font-medium">Loading document stream…</p>
                </div>
              ) : fileError ? (
                <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                  <div className="grid size-14 place-items-center rounded-2xl bg-amber-100 text-amber-700">
                    <FileX className="size-7" aria-hidden />
                  </div>
                  <div>
                    <h5 className="text-base font-bold text-ink-900">Preview Unavailable</h5>
                    <p className="mt-1 max-w-md text-xs text-ink-500">{fileError}</p>
                    <div className="mt-4 space-y-1 rounded-xl border border-ink-200 bg-white p-3 text-left font-mono text-xs text-ink-600">
                      <p><span className="font-bold text-ink-800">Document:</span> {viewingDoc.name}</p>
                      {viewingDoc.fileName && <p><span className="font-bold text-ink-800">Filename:</span> {viewingDoc.fileName}</p>}
                      {viewingDoc.uploadedAt && <p><span className="font-bold text-ink-800">Uploaded:</span> {formatUploadDate(viewingDoc.uploadedAt)}</p>}
                    </div>
                  </div>
                </div>
              ) : fileUrl ? (
                isPdf ? (
                  <iframe
                    src={fileUrl}
                    className="h-[520px] w-full rounded-xl border border-ink-200 bg-white"
                    title={viewingDoc.name}
                  />
                ) : isImage ? (
                  <img
                    src={fileUrl}
                    alt={viewingDoc.name}
                    className="mx-auto max-h-[520px] w-auto rounded-xl object-contain shadow-soft"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                    <FileText className="size-12 text-ink-400" aria-hidden />
                    <p className="text-sm font-medium text-ink-700">File format cannot be previewed in browser.</p>
                    <Button variant="outline" size="sm" onClick={handleDownloadViewingFile}>
                      <Download className="size-4" aria-hidden />
                      Download to View
                    </Button>
                  </div>
                )
              ) : (
                <div className="py-12 text-sm text-ink-400">No document preview available.</div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function DocumentRow({
  doc,
  uploading,
  onPreview,
  onUpload,
  onRemove,
}: {
  doc: UserDocument
  uploading: boolean
  onPreview: () => void
  onUpload: () => void
  onRemove: () => void
}) {
  const meta = documentStatusMeta(doc.status)
  const uploaded = doc.status === 'uploaded' || doc.status === 'expiring'
  const isRejected = doc.status === 'rejected'

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border bg-white px-5 py-4 shadow-soft sm:flex-row sm:items-center sm:gap-4',
        isRejected ? 'border-red-300 bg-red-50/10' : 'border-ink-200',
      )}
    >
      <div className="flex flex-1 items-start gap-4 min-w-0">
        <span
          className={cn(
            'grid size-11 shrink-0 place-items-center rounded-xl',
            isRejected ? 'bg-red-100 text-red-600' : 'bg-ink-100 text-ink-500',
          )}
        >
          <FileText className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-ink-900">{doc.name}</p>
            {!doc.required && <span className="text-xs text-ink-400">Optional</span>}
            {doc.version && doc.version > 1 && (
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-semibold text-brand-800">
                v{doc.version}
              </span>
            )}
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
          ) : isRejected ? (
            <div className="mt-2.5 rounded-xl border border-red-200 bg-red-50/90 p-3 text-xs text-red-900">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden />
                <div>
                  <p className="font-bold text-red-900">Reason for rejection:</p>
                  <p className="mt-0.5 font-medium text-red-800">
                    "{doc.note || 'Please upload a clearer scan of this document.'}"
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-0.5 text-xs text-ink-400">Not uploaded yet</p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-end gap-2 pt-2 sm:pt-0">
        {uploaded ? (
          <>
            <Button variant="outline" size="sm" onClick={onPreview}>
              <Eye className="size-4" aria-hidden />
              Preview
            </Button>
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
        ) : isRejected ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onUpload}
            disabled={uploading}
            className="border-red-300 text-red-700 bg-red-50 hover:bg-red-100 hover:border-red-400 font-semibold"
          >
            {uploading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <UploadCloud className="size-4" aria-hidden />}
            Re-upload Document
          </Button>
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

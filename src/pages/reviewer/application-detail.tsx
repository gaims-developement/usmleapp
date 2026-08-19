import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  FileWarning,
  FileX,
  GraduationCap,
  MessageSquare,
  Save,
  Send,
  ShieldCheck,
  StickyNote,
  User,
  X,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/ui/modal'
import { PageLoader, Spinner } from '@/components/ui/spinner'
import { Avatar } from '@/components/ui/avatar'
import {
  StatusBadge,
  reviewDocMeta,
  reviewerAppStatusMeta,
  reviewerRecommendationMeta,
} from '@/components/ui/status-badge'
import { useToast } from '@/components/ui/toast'
import {
  useApproveApplication,
  useForwardToHospital,
  useRejectApplication,
  useRequestChanges,
  useReviewerApplication,
  useSaveDraft,
  useSendMessageToStudent,
  useSetDocumentNote,
  useSetDocumentVerification,
  useStartReview,
} from '@/lib/reviewerQueries'
import { formatCurrency, formatDate } from '@/lib/utils'
import { apiGetBlob, documentPreviewErrorMessage } from '@/lib/apiClient'
import { ELIGIBILITY_ITEMS, type DocVerification, type EligibilityCheck, type ReviewDocType, type ReviewDocument, type ReviewerApplication, type ReviewerRecommendation } from '@/mocks/reviewer/applications'

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-b border-ink-100 pb-2">
      <dt className="text-xs font-bold uppercase tracking-wide text-ink-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-ink-900">{value || '—'}</dd>
    </div>
  )
}

function SectionCard({ icon: Icon, title, children }: { icon: typeof User; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <Icon className="size-4.5" aria-hidden />
        </span>
        <h2 className="font-display text-base font-bold text-ink-900">{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

export function ReviewerApplicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()

  const app = useReviewerApplication(id ?? '')
  const start = useStartReview()
  const setDocVerification = useSetDocumentVerification()
  const setDocNote = useSetDocumentNote()
  const saveDraft = useSaveDraft()
  const approve = useApproveApplication()
  const reject = useRejectApplication()
  const requestChanges = useRequestChanges()
  const forward = useForwardToHospital()
  const sendToStudent = useSendMessageToStudent()

  const [reviewerNotes, setReviewerNotes] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [recommendation, setRecommendation] = useState<ReviewerRecommendation>('')
  const [eligibility, setEligibility] = useState<EligibilityCheck | null>(null)

  const [noteDoc, setNoteDoc] = useState<ReviewDocType | null>(null)
  const [noteValue, setNoteValue] = useState('')

  const [messageOpen, setMessageOpen] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectText, setRejectText] = useState('')
  const [changesOpen, setChangesOpen] = useState(false)
  const [changesText, setChangesText] = useState('')
  const [approved, setApproved] = useState(false)

  const [viewingDoc, setViewingDoc] = useState<ReviewDocument | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [fileLoading, setFileLoading] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

  useEffect(() => {
    if (app.data) {
      setReviewerNotes(app.data.reviewerNotes)
      setInternalNotes(app.data.internalNotes)
      setRecommendation(app.data.recommendation)
      setEligibility({ ...app.data.eligibility })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app.data?.id])

  useEffect(() => {
    if (!viewingDoc) {
      setFileUrl(null)
      setFileError(null)
      setFileLoading(false)
      return
    }

    if (!viewingDoc.id) {
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
        const { blob, contentType } = await apiGetBlob(`/documents/${viewingDoc!.id}/file`)
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

  if (app.isLoading) return <PageLoader label="Loading application…" />
  if (!id || app.isError || !app.data) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <div className="grid size-14 place-items-center rounded-3xl bg-ink-100 text-ink-400">
          <FileWarning className="size-7" aria-hidden />
        </div>
        <p className="font-display text-base font-bold text-ink-900">Application not found</p>
        <Link to="/dashboard/reviewer" className="text-sm font-semibold text-brand-700 hover:text-brand-900">
          Back to dashboard
        </Link>
      </div>
    )
  }

  const a: ReviewerApplication = app.data
  const decisionPending = approve.isPending || reject.isPending || requestChanges.isPending || forward.isPending
  const isApproved = a.status === 'approved'
  const draft = {
    reviewerNotes,
    internalNotes,
    recommendation,
    eligibility: eligibility ?? undefined,
  }

  const stMeta = reviewerAppStatusMeta(a.status)

  function afterDecide(label: string) {
    toast.success(label, `${a.id} · ${a.student.name}`)
    navigate('/dashboard/reviewer')
  }

  function handleDocStatus(doc: ReviewDocument, verification: DocVerification) {
    if (!doc.applicationDocumentId) {
      toast.error('Could not update document', 'This document cannot be updated.')
      return
    }
    setDocVerification.mutate(
      {
        applicationId: a.id,
        documentId: doc.applicationDocumentId,
        verification,
        ...(verification === 'rejected' && doc.note ? { note: doc.note } : {}),
      },
      {
        onSuccess: () =>
          toast.success('Document updated', `${doc.name} marked as ${verification.replace(/_/g, ' ')}.`),
        onError: () => toast.error('Could not update document'),
      },
    )
  }

  const handleDownloadDoc = async (doc: ReviewDocument) => {
    if (!doc.id) {
      toast.error('Download Unavailable', 'No physical file is available for this entry.')
      return
    }
    try {
      const { blob, contentType } = await apiGetBlob(`/documents/${doc.id}/file`)
      const finalBlob = contentType ? new Blob([blob], { type: contentType }) : blob
      const url = URL.createObjectURL(finalBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.fileName ?? `${doc.name}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Downloading', `Started download for ${doc.fileName ?? doc.name}`)
    } catch (err) {
      toast.error('Download Unavailable', err instanceof Error ? err.message : 'No physical file is available for this entry.')
    }
  }

  const handleDownloadViewingFile = () => {
    if (!viewingDoc) return
    if (fileUrl) {
      const a = document.createElement('a')
      a.href = fileUrl
      a.download = viewingDoc.fileName ?? `${viewingDoc.name}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      toast.success('Downloading', `Started download for ${viewingDoc.fileName ?? viewingDoc.name}`)
    } else {
      toast.error('Download Unavailable', 'No physical file is available to download for this entry.')
    }
  }

  const isPdf = viewingDoc
    ? viewingDoc.mimeType === 'application/pdf' || (viewingDoc.fileName ?? '').toLowerCase().endsWith('.pdf')
    : false

  const isImage = viewingDoc
    ? viewingDoc.mimeType?.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(viewingDoc.fileName ?? '')
    : false

  const verifiedCount = a.documents.filter(d => d.verification === 'verified').length

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="mt-0.5 grid size-10 cursor-pointer place-items-center rounded-xl border border-ink-200 bg-white text-ink-600 transition-colors hover:bg-ink-50"
          >
            <ArrowLeft className="size-4.5" aria-hidden />
          </button>
          <div>
            <h1 className="font-display text-xl font-bold text-ink-900">{a.id} · {a.student.name}</h1>
            <p className="text-sm text-ink-500">
              {a.hospital} · {a.specialty} · submitted {formatDate(a.submittedAt)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge label={stMeta.label} tone={stMeta.tone} />
          <button
            type="button"
            onClick={() => setMessageOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3.5 py-2 text-xs font-semibold text-ink-700 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
          >
            <MessageSquare className="size-3.5" aria-hidden />
            Message student
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard icon={User} title="Student Information">
            <div className="flex items-center gap-4">
              <Avatar name={a.student.name} className="size-14 text-lg" />
              <div className="min-w-0">
                <p className="font-display text-base font-bold text-ink-900">{a.student.name}</p>
                <p className="text-sm text-ink-500">{a.student.currentStatus}</p>
                <p className="mt-0.5 text-xs text-ink-400">
                  {a.student.email} · {a.student.phone}
                </p>
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              <InfoRow label="Email" value={a.student.email} />
              <InfoRow label="Phone" value={a.student.phone} />
              <InfoRow label="Country" value={a.student.country} />
              <InfoRow label="Medical School" value={a.student.medicalSchool} />
              <InfoRow label="Graduation Year" value={a.student.graduationYear} />
              <InfoRow label="Current Status" value={a.student.currentStatus} />
            </dl>
          </SectionCard>

          <SectionCard icon={Building2} title="Elective Application">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              <InfoRow label="Hospital" value={a.hospital} />
              <InfoRow label="Specialty" value={a.specialty} />
              <InfoRow label="Rotation Dates" value={`${formatDate(a.rotationStart)} – ${formatDate(a.rotationEnd)}`} />
              <InfoRow label="Duration" value={a.duration} />
              <InfoRow label="Program Fee" value={formatCurrency(a.programFee)} />
              <InfoRow label="Application Date" value={formatDate(a.applicationDate)} />
            </dl>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-ink-400">Current status</span>
              <StatusBadge label={stMeta.label} tone={stMeta.tone} />
            </div>
          </SectionCard>

          <SectionCard icon={GraduationCap} title="Academic Information">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              <InfoRow label="Medical School" value={a.student.medicalSchool} />
              <InfoRow label="Graduation Year" value={a.student.graduationYear} />
              <InfoRow label="Current Year" value={a.student.currentYear} />
              <InfoRow label="USMLE Step 1" value={a.student.usmleStep1} />
              <InfoRow label="USMLE Step 2 CK" value={a.student.usmleStep2Ck} />
              <InfoRow label="Clinical Experience" value={a.student.clinicalExperience} />
              <InfoRow label="Research Experience" value={a.student.researchExperience} />
            </dl>
          </SectionCard>

          <SectionCard icon={BadgeCheck} title="Uploaded Documents">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-ink-400">
                {verifiedCount} of {a.documents.length} verified
              </span>
              <div className="h-1.5 w-40 overflow-hidden rounded-full bg-ink-100">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all"
                  style={{ width: `${(verifiedCount / a.documents.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {a.documents.map(doc => {
                const docMeta = reviewDocMeta(doc.verification)
                const editing = noteDoc === doc.name
                return (
                  <div key={doc.name} className="flex flex-col rounded-2xl border border-ink-200 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-ink-900">{doc.name}</p>
                        <p className="text-xs text-ink-500">Uploaded {formatDate(doc.uploadedAt)}</p>
                      </div>
                      <StatusBadge label={docMeta.label} tone={docMeta.tone} />
                    </div>
                    {doc.note && !editing && (
                      <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800">{doc.note}</p>
                    )}
                    <div className="mt-3 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setViewingDoc(doc)}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-ink-200 px-2.5 py-1 text-xs font-semibold text-ink-700 transition-colors hover:bg-ink-50"
                      >
                        <Eye className="size-3.5" aria-hidden />
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDownloadDoc(doc)}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-ink-200 px-2.5 py-1 text-xs font-semibold text-ink-700 transition-colors hover:bg-ink-50"
                      >
                        <Download className="size-3.5" aria-hidden />
                        Download
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-ink-100 pt-3">
                      {(
                        [
                          ['verified', 'Verify', 'bg-brand-600 text-white hover:bg-brand-700', Check],
                          ['requires_update', 'Request update', 'border-amber-300 text-amber-700 hover:bg-amber-50', FileWarning],
                          ['rejected', 'Reject', 'border-red-200 text-red-600 hover:bg-red-50', XCircle],
                        ] as [DocVerification, string, string, typeof Check][]
                      ).map(([v, label, cls, IconComp]) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => handleDocStatus(doc, v)}
                          className={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${cls}`}
                        >
                          <IconComp className="size-3.5" aria-hidden />
                          {label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          if (editing) {
                            setNoteDoc(null)
                          } else {
                            setNoteDoc(doc.name)
                            setNoteValue(doc.note)
                          }
                        }}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-ink-200 px-2.5 py-1 text-xs font-semibold text-ink-600 transition-colors hover:bg-ink-50"
                      >
                        <StickyNote className="size-3.5" aria-hidden />
                        {editing ? 'Close' : 'Note'}
                      </button>
                    </div>
                    {editing && (
                      <div className="mt-3 space-y-2">
                        <Textarea
                          value={noteValue}
                          onChange={e => setNoteValue(e.target.value)}
                          rows={2}
                          placeholder="Add a note for the student or other reviewers…"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setNoteDoc(null)}
                            disabled={setDocNote.isPending}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            disabled={setDocNote.isPending}
                            onClick={() =>
                              setDocNote.mutate(
                                { applicationId: a.id, documentId: doc.applicationDocumentId!, note: noteValue },
                                {
                                  onSuccess: () => {
                                    toast.success('Note saved', `${doc.name} updated.`)
                                    setNoteDoc(null)
                                  },
                                  onError: () => toast.error('Could not save note'),
                                },
                              )
                            }
                          >
                            <Save className="size-3.5" aria-hidden />
                            Save note
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </SectionCard>

          <SectionCard icon={ShieldCheck} title="Eligibility Checklist">
            <div className="grid gap-2 sm:grid-cols-2">
              {ELIGIBILITY_ITEMS.map(item => {
                const checked = eligibility?.[item.key] ?? false
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      setEligibility(prev => (prev ? { ...prev, [item.key]: !prev[item.key] } : prev))
                    }
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${
                      checked
                        ? 'border-brand-300 bg-brand-50 text-brand-800'
                        : 'border-ink-200 text-ink-600 hover:border-ink-300'
                    }`}
                  >
                    <span
                      className={`grid size-5 shrink-0 place-items-center rounded-md border ${
                        checked ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-300 bg-white text-transparent'
                      }`}
                    >
                      <Check className="size-3.5" aria-hidden />
                    </span>
                    {item.label}
                  </button>
                )
              })}
            </div>
            <p className="mt-3 text-xs text-ink-400">Changes are saved when you save a draft or make a decision.</p>
          </SectionCard>
        </div>

        <aside className="h-fit space-y-6 lg:sticky lg:top-32">
          <section className="rounded-3xl border border-ink-200 bg-white p-5 shadow-lift">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-ink-900">Review Panel</h2>
              <StatusBadge label={reviewerRecommendationMeta(recommendation).label} tone={reviewerRecommendationMeta(recommendation).tone} />
            </div>

            {a.status === 'submitted' && (
              <button
                type="button"
                disabled={start.isPending}
                onClick={() =>
                  start.mutate(a.id, {
                    onSuccess: () => toast.success('Review started', `${a.id} is now under review.`),
                  })
                }
                className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-brand-300 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 className="size-4" aria-hidden />
                Start review
              </button>
            )}

            <div className="mt-5 space-y-4">
              <div>
                <Label htmlFor="rv-notes">Reviewer Notes</Label>
                <Textarea
                  id="rv-notes"
                  value={reviewerNotes}
                  onChange={e => setReviewerNotes(e.target.value)}
                  rows={3}
                  placeholder="Notes visible to the student…"
                />
              </div>
              <div>
                <Label htmlFor="rv-internal">Internal Notes</Label>
                <Textarea
                  id="rv-internal"
                  value={internalNotes}
                  onChange={e => setInternalNotes(e.target.value)}
                  rows={2}
                  placeholder="Private notes for your team…"
                />
              </div>
              <div>
                <Label htmlFor="rv-recommendation">Overall Recommendation</Label>
                <Select
                  id="rv-recommendation"
                  value={recommendation}
                  onChange={e => setRecommendation(e.target.value as ReviewerRecommendation)}
                >
                  <option value="">Not set</option>
                  <option value="approve">Approve</option>
                  <option value="reject">Reject</option>
                  <option value="request_changes">Request changes</option>
                  <option value="forward">Forward to hospital</option>
                </Select>
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                disabled={saveDraft.isPending || decisionPending}
                onClick={() =>
                  saveDraft.mutate(
                    { applicationId: a.id, draft },
                    {
                      onSuccess: () => toast.success('Draft saved', `${a.id} review progress saved.`),
                      onError: () => toast.error('Could not save draft'),
                    },
                  )
                }
              >
                <Save className="size-4" aria-hidden />
                Save Draft
              </Button>
              <Button
                size="sm"
                className="w-full"
                disabled={decisionPending}
                onClick={() =>
                  approve.mutate(
                    { applicationId: a.id, draft },
                    {
                      onSuccess: () => {
                        toast.success('Application approved', `${a.id} · ${a.student.name}`)
                        setApproved(true)
                      },
                      onError: () => toast.error('Could not approve application'),
                    },
                  )
                }
              >
                <CheckCircle2 className="size-4" aria-hidden />
                Approve Application
              </Button>
              <Button
                size="sm"
                className="w-full !bg-emerald-600 hover:!bg-emerald-700 disabled:!bg-ink-100 disabled:!text-ink-400 disabled:hover:!bg-ink-100"
                disabled={decisionPending || !isApproved}
                title={!isApproved ? 'Approve the application first to unlock sending it to the hospital.' : undefined}
                onClick={() => forward.mutate({ applicationId: a.id, draft }, { onSuccess: () => afterDecide('Application forwarded') })}
              >
                <Send className="size-4" aria-hidden />
                {isApproved ? 'Send to Hospital' : 'Approve to unlock'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full !border-amber-300 !text-amber-700 hover:!bg-amber-50"
                disabled={decisionPending}
                onClick={() => setChangesOpen(true)}
              >
                <FileWarning className="size-4" aria-hidden />
                Request Changes
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full !border-red-200 !text-red-600 hover:!bg-red-50"
                disabled={decisionPending}
                onClick={() => setRejectOpen(true)}
              >
                <XCircle className="size-4" aria-hidden />
                Reject Application
              </Button>
            </div>
          </section>

          <section className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4.5 text-ink-400" aria-hidden />
              <h3 className="font-display text-sm font-bold text-ink-900">Rotation snapshot</h3>
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-500">Hospital</dt>
                <dd className="max-w-48 text-right font-semibold text-ink-900">{a.hospital}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Specialty</dt>
                <dd className="font-semibold text-ink-900">{a.specialty}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Duration</dt>
                <dd className="font-semibold text-ink-900">{a.duration}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Starts</dt>
                <dd className="font-semibold text-ink-900">{formatDate(a.rotationStart)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Fee</dt>
                <dd className="font-semibold text-ink-900">{formatCurrency(a.programFee)}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>

      <Modal
        open={messageOpen}
        onClose={() => setMessageOpen(false)}
        title="Message student"
        description={`Send a message to ${a.student.name} about ${a.id}.`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setMessageOpen(false)} disabled={sendToStudent.isPending}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!messageText.trim() || sendToStudent.isPending}
              onClick={() =>
                sendToStudent.mutate(
                  { studentId: a.studentId, applicationId: a.id, text: messageText.trim() },
                  {
                    onSuccess: () => {
                      toast.success('Message sent', `Sent to ${a.student.name}.`)
                      setMessageOpen(false)
                      setMessageText('')
                    },
                    onError: () => toast.error('Could not send message'),
                  },
                )
              }
            >
              <Send className="size-4" aria-hidden />
              Send message
            </Button>
          </>
        }
      >
        <div>
          <Label htmlFor="msg-text">Message</Label>
          <Textarea
            id="msg-text"
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            rows={4}
            placeholder="Type your message to the applicant…"
          />
        </div>
      </Modal>

      <Modal
        open={changesOpen}
        onClose={() => setChangesOpen(false)}
        title="Request changes"
        description={`Let ${a.student.name} know what needs to be updated.`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setChangesOpen(false)} disabled={requestChanges.isPending}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!changesText.trim() || requestChanges.isPending}
              onClick={() =>
                requestChanges.mutate(
                  { applicationId: a.id, draft, message: changesText.trim() },
                  {
                    onSuccess: () => afterDecide('Changes requested'),
                    onError: () => toast.error('Could not update application'),
                  },
                )
              }
            >
              <FileWarning className="size-4" aria-hidden />
              Send request
            </Button>
          </>
        }
      >
        <div>
          <Label htmlFor="chg-text">Message to student</Label>
          <Textarea
            id="chg-text"
            value={changesText}
            onChange={e => setChangesText(e.target.value)}
            rows={4}
            placeholder="e.g. Please re-upload your transcript in a clearer scan…"
          />
        </div>
      </Modal>

      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject application"
        description={`This will close ${a.id}. You can optionally notify ${a.student.name}.`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setRejectOpen(false)} disabled={reject.isPending}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="!bg-red-600 hover:!bg-red-700"
              disabled={reject.isPending}
              onClick={() =>
                reject.mutate(
                  { applicationId: a.id, draft, message: rejectText.trim() || undefined },
                  {
                    onSuccess: () => afterDecide('Application rejected'),
                    onError: () => toast.error('Could not update application'),
                  },
                )
              }
            >
              <X className="size-4" aria-hidden />
              Reject application
            </Button>
          </>
        }
      >
        <div>
          <Label htmlFor="rej-text">Message to student (optional)</Label>
          <Textarea
            id="rej-text"
            value={rejectText}
            onChange={e => setRejectText(e.target.value)}
            rows={4}
            placeholder="Explain the reason and next steps…"
          />
        </div>
      </Modal>

      <Modal
        open={approved}
        onClose={() => setApproved(false)}
        title="Application approved"
        description={`${a.id} · ${a.student.name}`}
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/reviewer')}>
              Back to dashboard
            </Button>
            <Button size="sm" onClick={() => setApproved(false)}>
              Done
            </Button>
          </>
        }
      >
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="size-9" aria-hidden />
          </span>
          <p className="text-sm text-ink-600">
            This application has been approved. A green tick now shows next to it in the applications section, and you
            can now <span className="font-semibold text-ink-900">send it to the hospital</span>.
          </p>
        </div>
      </Modal>

      <Modal
        open={!!viewingDoc}
        onClose={() => setViewingDoc(null)}
        title={viewingDoc ? viewingDoc.name : 'Document Preview'}
        description={viewingDoc ? `Uploaded ${formatDate(viewingDoc.uploadedAt)}` : undefined}
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
                <StatusBadge label={reviewDocMeta(viewingDoc.verification).label} tone={reviewDocMeta(viewingDoc.verification).tone} />
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
                      <p><span className="font-bold text-ink-800">Uploaded:</span> {formatDate(viewingDoc.uploadedAt)}</p>
                      {viewingDoc.note && <p><span className="font-bold text-ink-800">Note:</span> {viewingDoc.note}</p>}
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

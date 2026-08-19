import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Check,
  Download,
  Eye,
  FileCheck2,
  FileText,
  FileX,
  FolderOpen,
  GraduationCap,
  Search,
  ShieldX,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button, ButtonLink } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { PageLoader, Spinner } from '@/components/ui/spinner'
import { Modal } from '@/components/ui/modal'
import { StatusBadge } from '@/components/ui/status-badge'
import { useToast } from '@/components/ui/toast'
import { apiGetBlob, documentPreviewErrorMessage } from '@/lib/apiClient'
import {
  useSetDocStatus,
  useStudentGroupedDocuments,
} from '@/lib/adminQueries'
import type { StudentDocumentGroup, StudentDocumentItem } from '@/services/adminService'
import type { DocVerificationStatus } from '@/mocks/admin/operations'
import { cn, formatDate } from '@/lib/utils'

export function SuperAdminDocumentsPage() {
  const studentDocsQuery = useStudentGroupedDocuments()
  const setStatus = useSetDocStatus()
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedStudent, setSelectedStudent] = useState<StudentDocumentGroup | null>(null)
  const [viewingFile, setViewingFile] = useState<StudentDocumentItem | null>(null)

  // Rejection modal state
  const [rejectingDoc, setRejectingDoc] = useState<StudentDocumentItem | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // Document file blob preview state
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [fileLoading, setFileLoading] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

  const studentGroups = studentDocsQuery.data ?? []

  // Update selected student when data changes after mutation
  const activeStudent = useMemo(() => {
    if (!selectedStudent) return null
    return studentGroups.find(s => s.studentId === selectedStudent.studentId) ?? selectedStudent
  }, [selectedStudent, studentGroups])

  // Fetch document blob for actual file preview
  useEffect(() => {
    if (!viewingFile) {
      setFileUrl(null)
      setFileError(null)
      setFileLoading(false)
      return
    }

    let isMounted = true
    let blobUrl: string | null = null

    async function fetchFileBlob() {
      setFileLoading(true)
      setFileError(null)

      try {
        const { blob, contentType } = await apiGetBlob(`/documents/${viewingFile!.id}/file`)
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
  }, [viewingFile])

  const filtered = useMemo(() => {
    let result = studentGroups
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.college.toLowerCase().includes(q),
      )
    }
    if (statusFilter !== 'all') {
      if (statusFilter === 'needs_review') {
        result = result.filter(
          s => s.overallStatus === 'Pending Review' || s.overallStatus === 'Action Required',
        )
      } else if (statusFilter === 'pending') {
        result = result.filter(s => s.overallStatus === 'Pending Review')
      } else if (statusFilter === 'complete') {
        result = result.filter(s => s.overallStatus === 'Complete')
      } else if (statusFilter === 'rejected') {
        result = result.filter(s => s.overallStatus === 'Action Required')
      }
    }
    return result
  }, [studentGroups, search, statusFilter])

  if (studentDocsQuery.isLoading) return <PageLoader label="Loading applicant documents…" />

  const totalApplicants = studentGroups.length
  const pendingReviewCount = studentGroups.filter(
    s => s.overallStatus === 'Pending Review' || s.overallStatus === 'Partially Verified',
  ).length
  const completeCount = studentGroups.filter(s => s.overallStatus === 'Complete').length
  const actionRequiredCount = studentGroups.filter(s => s.overallStatus === 'Action Required').length

  const handleApproveDoc = async (docId: string, docName: string) => {
    try {
      await setStatus.mutateAsync({
        id: docId,
        status: 'verified' as DocVerificationStatus,
      })
      toast.success('Document Approved', `${docName} marked as verified.`)
      if (viewingFile?.id === docId) setViewingFile(null)
    } catch {
      toast.error('Error', 'Could not update document status.')
    }
  }

  const handleOpenRejectModal = (doc: StudentDocumentItem) => {
    setRejectingDoc(doc)
    setRejectionReason('')
  }

  const handleConfirmReject = async () => {
    if (!rejectingDoc) return
    const reason = rejectionReason.trim() || 'Document requirements not met.'
    try {
      await setStatus.mutateAsync({
        id: rejectingDoc.id,
        status: 'rejected' as DocVerificationStatus,
        note: reason,
      })
      toast.success('Document Rejected', `${rejectingDoc.name} marked as rejected.`)
      if (viewingFile?.id === rejectingDoc.id) setViewingFile(null)
      setRejectingDoc(null)
      setRejectionReason('')
    } catch {
      toast.error('Error', 'Could not reject document.')
    }
  }

  const handleDownloadFile = () => {
    if (!viewingFile) return
    if (fileUrl) {
      const a = document.createElement('a')
      a.href = fileUrl
      a.download = viewingFile.fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      toast.success('Downloading', `Started download for ${viewingFile.fileName}`)
    } else {
      toast.error('Download Unavailable', 'No physical file is available to download for this entry.')
    }
  }

  const isPdf = viewingFile
    ? viewingFile.mimeType === 'application/pdf' || viewingFile.fileName.toLowerCase().endsWith('.pdf')
    : false

  const isImage = viewingFile
    ? viewingFile.mimeType?.startsWith('image/') ||
      /\.(jpg|jpeg|png|webp)$/i.test(viewingFile.fileName)
    : false

  const columns: DataTableColumn<StudentDocumentGroup>[] = [
    {
      key: 'applicant',
      header: 'Applicant / Student',
      cell: r => (
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600 font-bold">
            {r.name.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-ink-900 truncate">{r.name}</p>
            <p className="text-xs text-ink-500 truncate">{r.email}</p>
            <p className="text-xs text-ink-400 truncate flex items-center gap-1 mt-0.5">
              <GraduationCap className="size-3 shrink-0" />
              {r.college}
            </p>
          </div>
        </div>
      ),
      sortValue: r => r.name,
    },
    {
      key: 'documentsCount',
      header: 'Documents',
      cell: r => (
        <div>
          <span className="font-semibold text-ink-900">{r.totalDocs} files</span>
          <p className="text-xs text-ink-500">
            {r.verifiedDocs}/{r.totalDocs} verified
          </p>
        </div>
      ),
      align: 'left',
      sortValue: r => r.totalDocs,
    },
    {
      key: 'completion',
      header: 'Completion',
      cell: r => {
        const pct = r.totalDocs > 0 ? Math.round((r.verifiedDocs / r.totalDocs) * 100) : 0
        return (
          <div className="w-32">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-ink-700">{pct}%</span>
              <span className="text-ink-400">{r.verifiedDocs}/{r.totalDocs}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-ink-100 overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-300',
                  pct === 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-brand-500' : 'bg-amber-400',
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      },
    },
    {
      key: 'status',
      header: 'Overall Status',
      cell: r => {
        let label = r.overallStatus
        let tone: 'brand' | 'emerald' | 'amber' | 'red' | 'neutral' = 'neutral'
        if (r.overallStatus === 'Complete') tone = 'emerald'
        else if (r.overallStatus === 'Pending Review') tone = 'amber'
        else if (r.overallStatus === 'Partially Verified') tone = 'brand'
        else if (r.overallStatus === 'Action Required') tone = 'red'
        return <StatusBadge label={label} tone={tone} />
      },
    },
    {
      key: 'lastUpload',
      header: 'Last Upload',
      cell: r => (r.lastUpload !== '—' ? formatDate(r.lastUpload) : '—'),
      align: 'right',
      sortValue: r => r.lastUpload,
    },
    {
      key: 'action',
      header: '',
      align: 'right',
      cell: r => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedStudent(r)}
          className="whitespace-nowrap"
        >
          <FolderOpen className="size-3.5" aria-hidden />
          Review Checklist
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Student Document Verification"
        subtitle="Review, approve, and reject student credential packages grouped by applicant."
        actions={
          <ButtonLink to="/dashboard/super-admin/documents" size="sm">
            <FileCheck2 className="size-4" aria-hidden />
            Applicant Queue
          </ButtonLink>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Total Applicants</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink-900">{totalApplicants}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Pending Review</p>
          <p className="mt-2 font-display text-2xl font-bold text-amber-600">{pendingReviewCount}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Verified Complete</p>
          <p className="mt-2 font-display text-2xl font-bold text-emerald-600">{completeCount}</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink-500">Action Required / Rejected</p>
          <p className="mt-2 font-display text-2xl font-bold text-rose-600">{actionRequiredCount}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by student name, email, college…"
            className="w-80 pl-9"
            aria-label="Search student documents"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="w-48"
          aria-label="Filter by overall status"
        >
          <option value="all">All Applicants</option>
          <option value="needs_review">Needs Review / Action Required</option>
          <option value="pending">Pending Review Only</option>
          <option value="complete">Complete Only</option>
          <option value="rejected">Rejected Only</option>
        </Select>
      </div>

      <div className="mt-4">
        <DataTable
          columns={columns}
          data={filtered}
          keyField="studentId"
          pageSize={8}
          emptyTitle="No applicants found"
          emptyDescription="There are no student document packages matching your filter criteria."
        />
      </div>

      {/* STUDENT DOCUMENT CHECKLIST REVIEW MODAL */}
      <Modal
        open={!!activeStudent}
        onClose={() => setSelectedStudent(null)}
        title={activeStudent ? `${activeStudent.name}'s Document Package` : 'Student Document Review'}
        description={activeStudent ? `${activeStudent.email} · ${activeStudent.college}` : undefined}
      >
        {activeStudent && (
          <div className="space-y-6">
            {/* Student Header Details */}
            <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-ink-900 text-base">{activeStudent.name}</h4>
                  <p className="text-xs text-ink-500">{activeStudent.college} {activeStudent.graduationYear ? `(Class of ${activeStudent.graduationYear})` : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-ink-600">
                    {activeStudent.verifiedDocs} of {activeStudent.totalDocs} Verified
                  </span>
                  <StatusBadge
                    label={activeStudent.overallStatus}
                    tone={
                      activeStudent.overallStatus === 'Complete'
                        ? 'emerald'
                        : activeStudent.overallStatus === 'Action Required'
                        ? 'red'
                        : activeStudent.overallStatus === 'Pending Review'
                        ? 'amber'
                        : 'brand'
                    }
                  />
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="h-2 w-full rounded-full bg-ink-200 overflow-hidden">
                  <div
                    className="h-full bg-brand-600 transition-all duration-300"
                    style={{
                      width: `${
                        activeStudent.totalDocs > 0
                          ? Math.round((activeStudent.verifiedDocs / activeStudent.totalDocs) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Document Checklist Items */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-400">
                Uploaded Document Checklist ({activeStudent.documents.length})
              </h4>

              {activeStudent.documents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-ink-200 p-6 text-center text-ink-500 text-sm">
                  No documents have been uploaded by this applicant yet.
                </div>
              ) : (
                <div className="divide-y divide-ink-100 rounded-2xl border border-ink-200 bg-white">
                  {activeStudent.documents.map(doc => {
                    const isVerified = doc.status === 'verified' || doc.status === 'VERIFIED'
                    const isRejected = doc.status === 'rejected' || doc.status === 'REJECTED'

                    return (
                      <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <span
                            className={cn(
                              'grid size-9 shrink-0 place-items-center rounded-xl mt-0.5',
                              isVerified
                                ? 'bg-emerald-50 text-emerald-600'
                                : isRejected
                                ? 'bg-rose-50 text-rose-600'
                                : 'bg-amber-50 text-amber-600',
                            )}
                          >
                            <FileText className="size-4.5" aria-hidden />
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-ink-900 text-sm">{doc.name}</p>
                              <span className="rounded-md bg-ink-100 px-2 py-0.5 text-[10px] font-medium text-ink-600">
                                {doc.category}
                              </span>
                            </div>
                            <p className="text-xs text-ink-400 mt-0.5">
                              File: <span className="font-mono text-ink-600">{doc.fileName}</span> · Uploaded: {doc.uploadedAt}
                            </p>
                            {doc.note && (
                              <p className="mt-1 text-xs text-rose-600 bg-rose-50 rounded-lg p-1.5 flex items-center gap-1.5">
                                <AlertCircle className="size-3.5 shrink-0" />
                                Rejection reason: {doc.note}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <StatusBadge
                            label={isVerified ? 'Verified' : isRejected ? 'Rejected' : 'Pending'}
                            tone={isVerified ? 'emerald' : isRejected ? 'red' : 'amber'}
                          />
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setViewingFile(doc)}
                            className="whitespace-nowrap"
                          >
                            <Eye className="size-3.5" aria-hidden />
                            Review
                          </Button>
                          {!isVerified && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={setStatus.isPending}
                              onClick={() => void handleApproveDoc(doc.id, doc.name)}
                              className="text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
                            >
                              <Check className="size-3.5" aria-hidden />
                              Approve
                            </Button>
                          )}
                          {!isRejected && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={setStatus.isPending}
                              onClick={() => handleOpenRejectModal(doc)}
                              className="text-rose-600 hover:bg-rose-50 hover:border-rose-300"
                            >
                              <ShieldX className="size-3.5" aria-hidden />
                              Reject
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* REJECTION REASON MODAL */}
      <Modal
        open={!!rejectingDoc}
        onClose={() => setRejectingDoc(null)}
        title={`Reject ${rejectingDoc?.name ?? 'Document'}`}
        description="Provide a reason for rejecting this document. The student will receive a notification with this reason and a Re-upload button."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setRejectingDoc(null)}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={setStatus.isPending}
              onClick={() => void handleConfirmReject()}
              className="!bg-rose-600 hover:!bg-rose-700 text-white"
            >
              {setStatus.isPending ? <Spinner className="size-4" /> : <ShieldX className="size-4" aria-hidden />}
              Reject Document
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm font-medium text-ink-800">
            Why are you rejecting this document? <span className="text-rose-600 font-bold">*</span>
          </p>
          <Input
            value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)}
            placeholder="e.g. Please upload a clearer scan. The current document is unreadable."
            aria-label="Rejection reason"
          />
        </div>
      </Modal>

      {/* ACTUAL DOCUMENT PREVIEW & WORKFLOW MODAL */}
      <Modal
        open={!!viewingFile}
        onClose={() => setViewingFile(null)}
        title={viewingFile ? viewingFile.name : 'Document Review'}
        description={
          viewingFile && activeStudent
            ? `Student: ${activeStudent.name} · Uploaded: ${viewingFile.uploadedAt}`
            : undefined
        }
        footer={
          viewingFile && (
            <div className="flex flex-wrap items-center justify-between gap-3 w-full">
              <Button variant="outline" size="sm" onClick={handleDownloadFile}>
                <Download className="size-4" aria-hidden />
                Download
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={setStatus.isPending}
                  onClick={() => handleOpenRejectModal(viewingFile)}
                  className="text-rose-600 hover:bg-rose-50 hover:border-rose-300"
                >
                  <ShieldX className="size-4" aria-hidden />
                  Reject
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={setStatus.isPending}
                  onClick={() => void handleApproveDoc(viewingFile.id, viewingFile.name)}
                >
                  <Check className="size-4" aria-hidden />
                  Approve
                </Button>
              </div>
            </div>
          )
        }
      >
        {viewingFile && (
          <div className="space-y-4">
            {/* Status Header */}
            <div className="flex items-center justify-between rounded-xl bg-ink-50 px-4 py-2.5 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-ink-700">Status:</span>
                <StatusBadge
                  label={
                    viewingFile.status === 'verified'
                      ? 'Verified'
                      : viewingFile.status === 'rejected'
                      ? 'Rejected'
                      : 'Pending Review'
                  }
                  tone={
                    viewingFile.status === 'verified'
                      ? 'emerald'
                      : viewingFile.status === 'rejected'
                      ? 'red'
                      : 'amber'
                  }
                />
                {viewingFile.version && (
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-800">
                    v{viewingFile.version}
                  </span>
                )}
              </div>
              <span className="text-xs text-ink-500 font-mono">{viewingFile.fileName}</span>
            </div>

            {/* Viewer Content */}
            <div className="min-h-[400px] flex flex-col items-center justify-center rounded-2xl border border-ink-200 bg-ink-900/5 p-2 overflow-hidden">
              {fileLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-500">
                  <Spinner className="size-7 text-brand-600" />
                  <p className="text-sm font-medium">Loading document stream…</p>
                </div>
              ) : fileError ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
                  <div className="grid size-14 place-items-center rounded-2xl bg-amber-100 text-amber-700">
                    <FileX className="size-7" />
                  </div>
                  <div>
                    <h5 className="font-bold text-ink-900 text-base">Preview Unavailable</h5>
                    <p className="text-xs text-ink-500 mt-1 max-w-md">{fileError}</p>
                    <div className="mt-4 rounded-xl bg-white border border-ink-200 p-3 text-left text-xs space-y-1 font-mono text-ink-600">
                      <p><span className="font-bold text-ink-800">Filename:</span> {viewingFile.fileName}</p>
                      <p><span className="font-bold text-ink-800">Category:</span> {viewingFile.category}</p>
                      <p><span className="font-bold text-ink-800">Uploaded:</span> {viewingFile.uploadedAt}</p>
                    </div>
                  </div>
                </div>
              ) : fileUrl ? (
                isPdf ? (
                  <iframe
                    src={fileUrl}
                    className="w-full h-[520px] rounded-xl border border-ink-200 bg-white"
                    title={viewingFile.name}
                  />
                ) : isImage ? (
                  <img
                    src={fileUrl}
                    alt={viewingFile.name}
                    className="max-h-[520px] w-auto mx-auto object-contain rounded-xl shadow-soft"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                    <FileText className="size-12 text-ink-400" />
                    <p className="text-sm font-medium text-ink-700">File format cannot be previewed in browser.</p>
                    <Button variant="outline" size="sm" onClick={handleDownloadFile}>
                      <Download className="size-4" /> Download to View
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

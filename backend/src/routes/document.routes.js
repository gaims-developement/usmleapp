import { Router } from 'express'
import multer from 'multer'
import { prisma } from '../db/prisma.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'
import { AppError } from '../utils/app-error.js'
import { storageService } from '../services/storage/storage.service.js'
import { notify } from './notification.routes.js'

export const documentRouter = Router()

documentRouter.use(authenticate)

const MAX_PDF_BYTES = 5 * 1024 * 1024
const MAX_IMAGE_BYTES = 1 * 1024 * 1024

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PDF_BYTES },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ]
    if (!allowedTypes.includes(file.mimetype.toLowerCase())) {
      return cb(new AppError('Only PDF, JPG, PNG, and WEBP files are allowed.', 400, 'INVALID_FILE_TYPE'))
    }
    cb(null, true)
  },
})

const DEFAULT_DOCUMENTS = [
  { id: 'doc-passport', name: 'Passport', category: 'Identity', required: true },
  { id: 'doc-visa', name: 'Visa / I-20 Documents', category: 'Legal', required: true },
  { id: 'doc-cv', name: 'CV / Resume', category: 'Education', required: true },
  { id: 'doc-transcript', name: 'Medical School Transcript', category: 'Education', required: true },
  { id: 'doc-step1', name: 'USMLE Step 1 Score Report', category: 'Exams', required: true },
  { id: 'doc-step2', name: 'USMLE Step 2 CK Score Report', category: 'Exams', required: false },
  { id: 'doc-english', name: 'English Proficiency (IELTS / TOEFL)', category: 'Exams', required: false },
  { id: 'doc-immunizations', name: 'Immunization Record', category: 'Medical', required: true },
  { id: 'doc-tb', name: 'TB Screening / PPD', category: 'Medical', required: true },
  { id: 'doc-lor', name: 'Letter of Recommendation', category: 'Evaluation', required: true },
  { id: 'doc-personal-statement', name: 'Personal Statement', category: 'Evaluation', required: true },
]

// GET /api/documents - Get student document checklist
documentRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = req.user.id

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: { documents: true },
    })

    if (!studentProfile) {
      return res.json({ success: true, data: DEFAULT_DOCUMENTS.map(d => ({ ...d, status: 'missing' })) })
    }

    const dbDocs = studentProfile.documents
    const merged = DEFAULT_DOCUMENTS.map(doc => {
      const dbMatch = dbDocs.find(
        d => d.name.toLowerCase() === doc.name.toLowerCase() || d.name.toLowerCase() === doc.id.toLowerCase(),
      )
      if (dbMatch) {
        return {
          ...doc,
          dbId: dbMatch.id,
          status: dbMatch.status,
          fileName: dbMatch.fileName ?? undefined,
          uploadedAt: dbMatch.uploadedAt?.toISOString().slice(0, 10) ?? undefined,
          expiresAt: dbMatch.expiresAt?.toISOString().slice(0, 10) ?? undefined,
          note: dbMatch.note ?? undefined,
        }
      }
      return {
        ...doc,
        status: 'missing',
      }
    })

    return res.json({ success: true, data: merged })
  }),
)

// GET /api/documents/:id/file - Stream document file for preview/download (RBAC protected)
documentRouter.get(
  '/:id/file',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const user = req.user

    // Search by document ID or studentProfileId + name match
    let doc = await prisma.studentDocument.findUnique({
      where: { id },
      include: { studentProfile: { include: { user: true } } },
    })

    if (!doc) {
      // Try finding by ID string (e.g. 'doc-cv') for active user
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: user.id },
      })
      if (studentProfile) {
        const docDef = DEFAULT_DOCUMENTS.find(d => d.id === id || d.name.toLowerCase() === id.toLowerCase())
        if (docDef) {
          doc = await prisma.studentDocument.findFirst({
            where: { studentProfileId: studentProfile.id, name: docDef.name },
            include: { studentProfile: { include: { user: true } } },
          })
        }
      }
    }

    if (!doc) {
      throw new AppError('Document record not found', 404, 'DOCUMENT_RECORD_NOT_FOUND')
    }

    const ownerUserId = doc.studentProfile.userId

    // RBAC Authorization Check
    const role = user.role?.name
    if (role === 'STUDENT') {
      if (ownerUserId !== user.id) {
        throw new AppError('You are not authorized to view this document.', 403, 'DOCUMENT_ACCESS_DENIED')
      }
    } else if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
      if (doc.studentProfile.user.isDemo !== user.isDemo) {
        throw new AppError('You are not authorized to view this document.', 403, 'DOCUMENT_ACCESS_DENIED')
      }
    } else if (role === 'REVIEWER') {
      // Reviewer authorized if in same hospital or assigned to student's applications
      const reviewerProfile = await prisma.reviewerProfile.findUnique({ where: { userId: user.id } })
      if (!reviewerProfile) {
        throw new AppError('You are not authorized to view this document.', 403, 'DOCUMENT_ACCESS_DENIED')
      }
      const hasAccess = await prisma.application.findFirst({
        where: {
          studentProfileId: doc.studentProfileId,
          OR: reviewerProfile.hospitalId
            ? [{ reviewerProfileId: reviewerProfile.id }, { program: { hospitalId: reviewerProfile.hospitalId } }]
            : [{ reviewerProfileId: reviewerProfile.id }],
        },
      })
      if (!hasAccess && doc.studentProfile.user.isDemo !== user.isDemo) {
        throw new AppError('You are not authorized to view this document.', 403, 'DOCUMENT_ACCESS_DENIED')
      }
    } else if (role === 'HOSPITAL') {
      const hospitalProfile = await prisma.hospitalProfile.findUnique({ where: { userId: user.id } })
      if (!hospitalProfile) {
        throw new AppError('You are not authorized to view this document.', 403, 'DOCUMENT_ACCESS_DENIED')
      }
      const hasApp = await prisma.application.findFirst({
        where: {
          studentProfileId: doc.studentProfileId,
          program: { hospitalId: hospitalProfile.id },
        },
      })
      if (!hasApp) {
        throw new AppError('You are not authorized to view this document.', 403, 'DOCUMENT_ACCESS_DENIED')
      }
    } else if (role === 'DOCTOR') {
      const doctorProfile = await prisma.doctorProfile.findUnique({ where: { userId: user.id } })
      if (!doctorProfile) {
        throw new AppError('You are not authorized to view this document.', 403, 'DOCUMENT_ACCESS_DENIED')
      }
      const hasAccess = await prisma.application.findFirst({
        where: {
          studentProfileId: doc.studentProfileId,
          doctorProfileId: doctorProfile.id,
        },
      })
      if (!hasAccess && doc.studentProfile.user.isDemo !== user.isDemo) {
        throw new AppError('You are not authorized to view this document.', 403, 'DOCUMENT_ACCESS_DENIED')
      }
    }

function inferMimeType(fileName) {
  if (!fileName) return 'application/pdf'
  const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase()
  switch (ext) {
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.webp':
      return 'image/webp'
    case '.gif':
      return 'image/gif'
    case '.pdf':
      return 'application/pdf'
    default:
      return 'application/octet-stream'
  }
}

    // Check if physical file path exists
    if (!doc.storagePath) {
      throw new AppError('No physical file was uploaded for this document entry.', 404, 'CLOUDINARY_ASSET_NOT_FOUND')
    }

    // Provider streaming / redirect
    const fileResult = await storageService.getFileStream(doc.storagePath)

    if (fileResult.redirectUrl) {
      return res.redirect(fileResult.redirectUrl)
    }

    const fileName = doc.fileName || 'document.pdf'
    const mimeType = doc.mimeType || inferMimeType(fileName)

    console.log('[DocumentStream] Serving document file:', {
      id: doc.id,
      fileName,
      mimeType,
      fileSize: doc.fileSize,
      storagePath: doc.storagePath,
    })

    res.setHeader('Content-Type', mimeType)
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(fileName)}"`)

    if (doc.fileSize) {
      res.setHeader('Content-Length', doc.fileSize)
    }

    fileResult.stream.pipe(res)
  }),
)

// POST /api/documents/:id - Upload document file (multipart / json fallback)
documentRouter.post(
  '/:id',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const userId = req.user.id

    let studentProfile = await prisma.studentProfile.findUnique({
      where: { userId },
    })
    if (!studentProfile) {
      studentProfile = await prisma.studentProfile.create({
        data: { userId },
      })
    }

    const docDef = DEFAULT_DOCUMENTS.find(d => d.id === id || d.name.toLowerCase() === id.toLowerCase())
    const existingById = await prisma.studentDocument.findFirst({
      where: { id, studentProfileId: studentProfile.id },
    })
    const docName = existingById?.name ?? docDef?.name ?? id

    let uploadResult = null
    if (req.file) {
      const isImage = (req.file.mimetype || '').startsWith('image/')
      const maxSize = isImage ? MAX_IMAGE_BYTES : MAX_PDF_BYTES
      if (req.file.size > maxSize) {
        throw new AppError(
          isImage ? 'Images must be 1 MB or smaller.' : 'PDFs must be 5 MB or smaller.',
          400,
          'FILE_TOO_LARGE',
        )
      }
      console.log('[DocumentUpload] Received file upload:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      })
      uploadResult = await storageService.uploadFile({
        file: req.file,
        studentProfileId: studentProfile.id,
        documentId: id,
      })
    }

    const existing = existingById ?? await prisma.studentDocument.findFirst({
      where: { studentProfileId: studentProfile.id, name: docName },
    })

    const today = new Date()
    const fileName = uploadResult?.fileName || req.body.fileName || `${docName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`
    const mimeType = uploadResult?.mimeType || inferMimeType(fileName)

    if (existing) {
      const nextVersion = (existing.version || 1) + 1
      await prisma.studentDocument.update({
        where: { id: existing.id },
        data: {
          status: 'uploaded',
          fileName,
          mimeType,
          fileSize: uploadResult?.fileSize || null,
          storageProvider: uploadResult?.storageProvider || 'local',
          storagePath: uploadResult?.storagePath || existing.storagePath || null,
          uploadedAt: today,
          version: nextVersion,
        },
      })
    } else {
      await prisma.studentDocument.create({
        data: {
          studentProfileId: studentProfile.id,
          name: docName,
          category: docDef?.category ?? 'General',
          required: docDef?.required ?? true,
          status: 'uploaded',
          fileName,
          mimeType,
          fileSize: uploadResult?.fileSize || null,
          storageProvider: uploadResult?.storageProvider || 'local',
          storagePath: uploadResult?.storagePath || null,
          uploadedAt: today,
          version: 1,
        },
      })
    }

    // Notify admins if student resubmits a rejected document
    const superAdmins = await prisma.user.findMany({
      where: { isDemo: req.user.isDemo, role: { name: 'SUPER_ADMIN' } },
      select: { id: true },
    })
    for (const admin of superAdmins) {
      await notify(admin.id, {
        tone: 'INFO',
        title: 'Document Resubmitted',
        body: `${req.user.name} uploaded a new version of ${docName} for review.`,
      })
    }

    // Notify reviewers assigned to this student's applications
    const reviewerApps = await prisma.application.findMany({
      where: { studentProfileId: studentProfile.id, reviewerProfileId: { not: null } },
      select: { reviewerProfile: { select: { userId: true } } },
    })
    for (const app of reviewerApps) {
      if (!app.reviewerProfile?.userId) continue
      await notify(app.reviewerProfile.userId, {
        tone: 'INFO',
        title: 'Student updated documents',
        body: `${req.user.name} uploaded ${docName} for review.`,
        documentId: existing?.id ?? null,
      })
    }

    return res.json({ success: true, data: { status: 'uploaded', fileName } })
  }),
)

// DELETE /api/documents/:id - Remove document
documentRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const userId = req.user.id

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId },
    })
    if (!studentProfile) {
      return res.json({ success: true })
    }

    const docDef = DEFAULT_DOCUMENTS.find(d => d.id === id || d.name.toLowerCase() === id.toLowerCase())
    const docName = docDef?.name ?? id

    const existing = await prisma.studentDocument.findFirst({
      where: { studentProfileId: studentProfile.id, name: docName },
    })

    if (existing) {
      if (existing.storagePath) {
        await storageService.deleteFile(existing.storagePath)
      }
      await prisma.studentDocument.update({
        where: { id: existing.id },
        data: {
          status: 'missing',
          fileName: null,
          mimeType: null,
          fileSize: null,
          storageProvider: null,
          storagePath: null,
          uploadedAt: null,
          expiresAt: null,
          note: null,
        },
      })
    }

    return res.json({ success: true })
  }),
)

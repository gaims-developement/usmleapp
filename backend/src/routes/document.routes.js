import { Router } from 'express'
import { prisma } from '../db/prisma.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'

export const documentRouter = Router()

documentRouter.use(authenticate)

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
      const dbMatch = dbDocs.find(d => d.name.toLowerCase() === doc.name.toLowerCase() || d.name.toLowerCase() === doc.id.toLowerCase())
      if (dbMatch) {
        return {
          ...doc,
          status: dbMatch.status,
          fileName: dbMatch.fileName ?? undefined,
          uploadedAt: dbMatch.uploadedAt?.toISOString().slice(0, 10) ?? undefined,
          expiresAt: dbMatch.expiresAt?.toISOString().slice(0, 10) ?? undefined,
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

// POST /api/documents/:id - Upload document
documentRouter.post(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const { fileName } = req.body // Expecting JSON { fileName } for simplicity, or we can handle file upload
    const userId = req.user.id

    let studentProfile = await prisma.studentProfile.findUnique({
      where: { userId },
    })
    if (!studentProfile) {
      studentProfile = await prisma.studentProfile.create({
        data: { userId },
      })
    }

    // Find document definition matching the id
    const docDef = DEFAULT_DOCUMENTS.find(d => d.id === id || d.name.toLowerCase() === id.toLowerCase())
    const docName = docDef?.name ?? id

    // Upsert database row
    const existing = await prisma.studentDocument.findFirst({
      where: { studentProfileId: studentProfile.id, name: docName },
    })

    const today = new Date()
    if (existing) {
      await prisma.studentDocument.update({
        where: { id: existing.id },
        data: {
          status: 'uploaded',
          fileName: fileName || `${docName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`,
          uploadedAt: today,
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
          fileName: fileName || `${docName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`,
          uploadedAt: today,
        },
      })
    }

    return res.json({ success: true, data: { status: 'uploaded' } })
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
      await prisma.studentDocument.update({
        where: { id: existing.id },
        data: {
          status: 'missing',
          fileName: null,
          uploadedAt: null,
          expiresAt: null,
        },
      })
    }

    return res.json({ success: true })
  }),
)

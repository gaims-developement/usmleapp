import multer from 'multer'
import { AppError } from '../utils/app-error.js'

const storage = multer.memoryStorage()

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter(_req, file, cb) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(new AppError('Unsupported file type', 400, 'UNSUPPORTED_FILE_TYPE'))
    }
    return cb(null, true)
  },
})

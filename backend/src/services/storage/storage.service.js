import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { v2 as cloudinary } from 'cloudinary'
import { AppError } from '../../utils/app-error.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Base directory for local file uploads (backend/uploads)
const UPLOADS_DIR = path.resolve(__dirname, '../../../uploads')

/**
 * Local Filesystem Storage Provider
 */
class LocalStorageProvider {
  async uploadFile({ file, studentProfileId, documentId }) {
    const targetDir = path.join(UPLOADS_DIR, 'documents', String(studentProfileId), String(documentId))
    await fs.promises.mkdir(targetDir, { recursive: true })

    const fileExt = path.extname(file.originalname) || '.pdf'
    const safeBase = path
      .basename(file.originalname, fileExt)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
    const fileName = `${Date.now()}_${safeBase}${fileExt}`
    const fullPath = path.join(targetDir, fileName)

    await fs.promises.writeFile(fullPath, file.buffer)

    // Store relative path in DB
    const relativePath = path.relative(UPLOADS_DIR, fullPath).replace(/\\/g, '/')

    return {
      storageProvider: 'local',
      storagePath: relativePath,
      fileName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
    }
  }

  async getFileStream(storagePath) {
    const fullPath = path.resolve(UPLOADS_DIR, storagePath)

    // Security check: ensure path stays within UPLOADS_DIR
    if (!fullPath.startsWith(UPLOADS_DIR)) {
      throw new AppError('Invalid document file path', 400, 'INVALID_PATH')
    }

    try {
      await fs.promises.access(fullPath, fs.constants.R_OK)
    } catch {
      throw new AppError('File not found on local storage', 404, 'FILE_NOT_FOUND')
    }

    return {
      stream: fs.createReadStream(fullPath),
      fullPath,
    }
  }

  async deleteFile(storagePath) {
    if (!storagePath) return
    const fullPath = path.resolve(UPLOADS_DIR, storagePath)
    if (fullPath.startsWith(UPLOADS_DIR)) {
      try {
        await fs.promises.unlink(fullPath)
      } catch {
        // Ignore missing file on delete
      }
    }
  }
}

/**
 * Cloudinary Storage Provider
 */
class CloudinaryStorageProvider {
  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    })
    console.log('[storage] Cloudinary configured (safe diagnostic):', {
      cloud_name: cloudName,
      api_key: apiKey ? `...${String(apiKey).slice(-4)}` : '(empty)',
      api_secret: apiSecret ? 'set' : '(empty)',
    })
  }

  async uploadFile({ file, studentProfileId }) {
    return new Promise((resolve, reject) => {
      const folder = `usmleapp/documents/${studentProfileId}`
      const isPdf = file.mimetype === 'application/pdf'

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: isPdf ? 'raw' : 'auto',
          public_id: `${Date.now()}_${path.basename(file.originalname, path.extname(file.originalname)).replace(/[^a-zA-Z0-9_-]/g, '_')}`,
        },
        (error, result) => {
          if (error) {
            console.error('[storage] Cloudinary upload failed (safe diagnostic):', {
              message: error.message,
              name: error.name,
              http_code: error.http_code ?? null,
              cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
              api_key: process.env.CLOUDINARY_API_KEY
                ? `...${String(process.env.CLOUDINARY_API_KEY).slice(-4)}`
                : '(empty)',
            })
            return reject(new AppError(`Cloudinary Upload Error: ${error.message}`, 500, 'CLOUDINARY_ERROR'))
          }
          resolve({
            storageProvider: 'cloudinary',
            storagePath: result.secure_url,
            fileName: file.originalname,
            mimeType: file.mimetype,
            fileSize: file.size,
          })
        },
      )

      uploadStream.end(file.buffer)
    })
  }

  async getFileStream(storagePath) {
    // For Cloudinary, storagePath is the secure_url
    return {
      redirectUrl: storagePath,
    }
  }

  async deleteFile(storagePath) {
    // Cloudinary public_id deletion can be added if public_id is saved
  }
}

/**
 * Storage Service Factory
 */
class StorageService {
  constructor() {
    const providerType = (process.env.STORAGE_PROVIDER || '').toLowerCase()
    const cloudinaryConfigured = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET,
    )

    if (providerType === 'cloudinary' && !cloudinaryConfigured) {
      console.warn(
        '[storage] STORAGE_PROVIDER=cloudinary but Cloudinary credentials are missing; falling back to local storage.',
      )
      this.provider = new LocalStorageProvider()
    } else if (providerType === 'cloudinary' || (cloudinaryConfigured && providerType !== 'local')) {
      this.provider = new CloudinaryStorageProvider()
    } else {
      this.provider = new LocalStorageProvider()
    }
  }

  async uploadFile(options) {
    return this.provider.uploadFile(options)
  }

  async getFileStream(storagePath) {
    return this.provider.getFileStream(storagePath)
  }

  async deleteFile(storagePath) {
    return this.provider.deleteFile(storagePath)
  }
}

export const storageService = new StorageService()

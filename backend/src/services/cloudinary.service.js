import { cloudinary } from '../config/cloudinary.js'

export function uploadBufferToCloudinary(fileBuffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error)
      return resolve(result)
    })

    stream.end(fileBuffer)
  })
}

export function deleteCloudinaryAsset(publicId) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) return reject(error)
      return resolve(result)
    })
  })
}

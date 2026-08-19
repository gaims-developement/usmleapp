import 'dotenv/config'
import https from 'node:https'
import { v2 as cloudinary } from 'cloudinary'

const captured = []
const origRequest = https.request
https.request = function (options, callback) {
  const req = origRequest.call(this, options, callback)
  req.on('response', res => {
    if (res.statusCode >= 400) {
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => {
        const bodyText = Buffer.concat(chunks).toString('utf8')
        captured.push({ status: res.statusCode, body: bodyText })
      })
    }
  })
  return req
}

const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? ''
const apiKey = process.env.CLOUDINARY_API_KEY ?? ''
const apiSecret = process.env.CLOUDINARY_API_SECRET ?? ''

cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret })

console.log('--- Upload test with body capture ---')
const folder = 'usmleapp/documents/diagnostic'
const publicId = `diagnostic_${Date.now()}`
try {
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto', public_id: publicId },
      (error, result) => (error ? reject(error) : resolve(result)),
    )
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64',
    )
    stream.end(png)
  })
  console.log('UPLOAD OK:', JSON.stringify({ public_id: result.public_id, url: result.secure_url }))
  try {
    const d = await cloudinary.uploader.destroy(publicId)
    console.log('cleanup destroy:', JSON.stringify(d))
  } catch (e) {
    console.log('cleanup destroy failed:', e.message)
  }
} catch (e) {
  console.log('UPLOAD FAILED:', JSON.stringify({ name: e.name, message: e.message, http_code: e.http_code }))
}

await new Promise(r => setTimeout(r, 1500))

console.log('--- Captured response bodies ---')
if (captured.length === 0) {
  console.log('(none captured)')
} else {
  for (const c of captured) {
    console.log('http status:', c.status)
    console.log('body:', c.body)
  }
}

process.exit(0)

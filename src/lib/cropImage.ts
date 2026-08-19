export function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
): Promise<File> {
  const image = new Image()
  image.crossOrigin = 'anonymous'

  return new Promise((resolve, reject) => {
    image.onload = () => {
      const canvas = document.createElement('canvas')
      const size = Math.min(pixelCrop.width, pixelCrop.height, 800)
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas not supported'))

      const scale = image.naturalWidth / image.width
      const sx = pixelCrop.x * scale
      const sy = pixelCrop.y * scale
      const sw = pixelCrop.width * scale
      const sh = pixelCrop.height * scale

      ctx.drawImage(image, sx, sy, sw, sh, 0, 0, size, size)

      canvas.toBlob(
        blob => {
          if (!blob) return reject(new Error('Canvas toBlob failed'))
          resolve(new File([blob], 'avatar.jpg', { type: 'image/jpeg' }))
        },
        'image/jpeg',
        0.92,
      )
    }
    image.onerror = () => reject(new Error('Failed to load image'))
    image.src = imageSrc
  })
}

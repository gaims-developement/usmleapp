import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { RotateCw, ZoomIn, ZoomOut } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { getCroppedImg } from '@/lib/cropImage'

interface ImageCropperProps {
  open: boolean
  imageSrc: string
  onCropComplete: (file: File) => void
  onClose: () => void
}

export function ImageCropper({ open, imageSrc, onCropComplete, onClose }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [processing, setProcessing] = useState(false)

  const onCropCompleteInternal = useCallback((_: unknown, croppedPixels: { x: number; y: number; width: number; height: number }) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  async function handleApply() {
    if (!croppedAreaPixels) return
    setProcessing(true)
    try {
      const file = await getCroppedImg(imageSrc, croppedAreaPixels)
      onCropComplete(file)
      onClose()
    } catch {
      // silently fail — user can retry
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Crop your photo" size="md">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-ink-900">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={1}
          cropShape="round"
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropCompleteInternal}
        />
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-3">
          <ZoomOut className="size-4 shrink-0 text-ink-400" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-ink-200 accent-brand-600"
          />
          <ZoomIn className="size-4 shrink-0 text-ink-400" />
        </div>
        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" size="sm" onClick={() => setRotation(r => (r + 90) % 360)}>
            <RotateCw className="size-4" aria-hidden />
            Rotate
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={processing}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={handleApply} disabled={processing}>
              {processing ? 'Processing…' : 'Apply'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

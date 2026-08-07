import { useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { cn } from '@/lib/utils'

export function UploadDropzone({ onFile }: { onFile: (file: File) => void }) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={e => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files?.[0]
        if (file) onFile(file)
      }}
      className={cn(
        'flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed bg-white px-6 py-12 text-center transition-colors',
        dragOver ? 'border-brand-500 bg-brand-50' : 'border-ink-300 hover:border-brand-400 hover:bg-brand-50/40',
      )}
    >
      <span className="grid size-14 place-items-center rounded-2xl bg-brand-100 text-brand-700">
        <UploadCloud className="size-7" aria-hidden />
      </span>
      <span className="mt-1 text-sm font-semibold text-ink-900">
        Drag &amp; drop a file here, or <span className="text-brand-700">browse</span>
      </span>
      <span className="text-xs text-ink-500">PDF, DOCX, or images up to 10 MB</span>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
          e.target.value = ''
        }}
      />
    </button>
  )
}

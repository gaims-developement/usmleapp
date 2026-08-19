import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const REPORT_REASONS = [
  { value: 'SPAM', label: 'Spam' },
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'MEDICAL_MISINFORMATION', label: 'Medical misinformation' },
  { value: 'OFFENSIVE_CONTENT', label: 'Offensive content' },
  { value: 'ADVERTISING', label: 'Advertising' },
  { value: 'PERSONAL_INFORMATION', label: 'Personal information' },
  { value: 'OTHER', label: 'Other' },
]

export function ForumReportModal({
  open,
  onClose,
  onSubmit,
  targetType,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (reason: string, description?: string) => void
  targetType: 'post' | 'comment'
}) {
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason) return
    onSubmit(reason, description || undefined)
    setReason('')
    setDescription('')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Report ${targetType === 'post' ? 'Post' : 'Comment'}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700">Reason</label>
          <select
            value={reason}
            onChange={e => setReason(e.target.value)}
            className={cn(
              'h-10 w-full cursor-pointer rounded-xl border border-ink-300 bg-white px-3 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
            )}
          >
            <option value="">Select a reason...</option>
            {REPORT_REASONS.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700">
            Description (optional)
          </label>
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Provide additional details..."
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!reason}>
            Submit Report
          </Button>
        </div>
      </form>
    </Modal>
  )
}

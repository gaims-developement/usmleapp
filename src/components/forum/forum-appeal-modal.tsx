import { useState } from 'react'
import { AlertCircle, CheckCircle, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSubmitBanAppeal } from '@/lib/forumQueries'
import { useToast } from '@/components/ui/toast'

interface ForumAppealModalProps {
  isOpen: boolean
  onClose: () => void
  banReason?: string | null
  bannedAt?: string | null
  banExpiresAt?: string | null
}

export function ForumAppealModal({
  isOpen,
  onClose,
  banReason,
  bannedAt,
  banExpiresAt,
}: ForumAppealModalProps) {
  const [appealMessage, setAppealMessage] = useState('')
  const submitAppeal = useSubmitBanAppeal()
  const toast = useToast()

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!appealMessage.trim() || appealMessage.trim().length < 10) {
      toast.error('Validation Error', 'Please provide an appeal message explaining your request (at least 10 characters).')
      return
    }

    submitAppeal.mutate(appealMessage.trim(), {
      onSuccess: () => {
        toast.success('Appeal Submitted', 'Your review request has been sent to forum moderators for review.')
        setAppealMessage('')
        onClose()
      },
      onError: (err: any) => {
        toast.error('Submission Failed', err.message || 'Failed to submit review request.')
      },
    })
  }

  const dateValue = bannedAt || banExpiresAt
  const dateFormatted = dateValue
    ? new Date(dateValue).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recent'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl border border-ink-200 bg-white p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="size-5" />
            <h3 className="font-display text-lg font-bold text-ink-900">Request Forum Ban Review</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 space-y-1">
          <p className="font-bold">Ban Details:</p>
          <p><span className="font-medium text-amber-800">Reason:</span> {banReason || 'Repeated guidelines violations'}</p>
          <p><span className="font-medium text-amber-800">Ban Started On:</span> {dateFormatted}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="appealMessage" className="block text-xs font-bold uppercase tracking-wider text-ink-700 mb-1">
              Why should your forum access be restored?
            </label>
            <textarea
              id="appealMessage"
              rows={4}
              value={appealMessage}
              onChange={e => setAppealMessage(e.target.value)}
              placeholder="Explain the context or why you believe your suspension should be reviewed..."
              className="w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={submitAppeal.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitAppeal.isPending}>
              <Send className="size-4 mr-1.5" />
              {submitAppeal.isPending ? 'Submitting...' : 'Submit Review Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

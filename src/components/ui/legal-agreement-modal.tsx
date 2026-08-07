import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, X } from 'lucide-react'
import type { LegalSection } from '@/data/legal'
import { Button } from '@/components/ui/button'
import { LegalSectionCard } from '@/components/legal-section-card'

interface LegalAgreementModalProps {
  open: boolean
  onClose: () => void
  onAgree: () => void
  title: string
  subtitle?: string
  sections: LegalSection[]
}

export function LegalAgreementModal({
  open,
  onClose,
  onAgree,
  title,
  subtitle,
  sections,
}: LegalAgreementModalProps) {
  const [reachedEnd, setReachedEnd] = useState(false)
  const [hasRead, setHasRead] = useState(false)
  const [accept, setAccept] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    setReachedEnd(false)
    setHasRead(false)
    setAccept(false)
    const el = scrollRef.current
    if (el) {
      el.scrollTo({ top: 0 })
      requestAnimationFrame(() => {
        if (el.scrollHeight <= el.clientHeight + 1) setReachedEnd(true)
      })
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  function handleScroll() {
    const el = scrollRef.current
    if (!el || reachedEnd) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 12) {
      setReachedEnd(true)
    }
  }

  function handleConfirm() {
    onAgree()
    onClose()
  }

  const confirmed = hasRead && accept

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-lift"
          >
            <div className="flex items-start justify-between gap-4 border-b border-ink-200 px-6 py-5">
              <div>
                <h2 className="font-display text-lg font-bold text-ink-900">{title}</h2>
                {subtitle && <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border border-ink-200 text-ink-600 transition-colors hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="space-y-4 overflow-y-auto px-6 py-6"
            >
              {sections.map((section) => (
                <LegalSectionCard key={section.title} section={section} />
              ))}
            </div>

            <div className="border-t border-ink-200 bg-ink-50/60 px-6 py-4">
              {!reachedEnd ? (
                <p className="flex items-center gap-2 text-sm text-ink-600">
                  <ArrowDown className="size-4 shrink-0 text-brand-600" aria-hidden />
                  Scroll to the bottom of the document to continue
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-ink-900">
                    Review complete — please confirm your agreement
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-ink-200 bg-white px-4 py-3">
                      <input
                        type="checkbox"
                        checked={hasRead}
                        onChange={(e) => setHasRead(e.target.checked)}
                        className="mt-0.5 size-4 cursor-pointer accent-brand-600"
                      />
                      <span className="text-sm text-ink-700">
                        I have read and understood the {title}.
                      </span>
                    </label>
                    <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-ink-200 bg-white px-4 py-3">
                      <input
                        type="checkbox"
                        checked={accept}
                        onChange={(e) => setAccept(e.target.checked)}
                        disabled={!hasRead}
                        className="mt-0.5 size-4 cursor-pointer accent-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      <span className="text-sm text-ink-700">
                        I accept the terms described in this document.
                      </span>
                    </label>
                  </div>
                  <Button size="sm" disabled={!confirmed} onClick={handleConfirm}>
                    I Confirm and Accept
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

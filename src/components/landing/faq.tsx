import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { faqs } from '@/data/site'
import { cn } from '@/lib/utils'
import { Container } from '@/components/ui/container'
import { Reveal } from '@/components/ui/motion'
import { SectionHeading } from '@/components/ui/section-heading'

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="bg-white py-20 lg:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="FAQ"
            title="Frequently asked questions"
            description="Quick answers to the questions IMGs ask us most."
          />
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {faqs.map((faq, i) => {
            const open = openIndex === i
            return (
              <Reveal key={faq.question} delay={(i % 3) * 0.05}>
                <div
                  className={cn(
                    'h-full overflow-hidden rounded-2xl border transition-colors',
                    open ? 'border-brand-300 bg-brand-50/40' : 'border-ink-200 bg-ink-50/60',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : i)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="font-semibold text-ink-900">{faq.question}</span>
                    <motion.span
                      animate={{ rotate: open ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        'grid size-8 shrink-0 place-items-center rounded-full border transition-colors',
                        open
                          ? 'border-brand-500 bg-brand-600 text-white'
                          : 'border-ink-300 text-ink-600',
                      )}
                    >
                      <Plus className="size-4" aria-hidden />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <p className="px-6 pb-5 text-sm leading-relaxed text-ink-600 sm:text-base">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

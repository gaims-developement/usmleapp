import type { LegalSection } from '@/data/legal'

export function LegalSectionCard({ section }: { section: LegalSection }) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-ink-50/60 p-7">
      <h2 className="font-display text-lg font-semibold text-ink-900">{section.title}</h2>
      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph} className="mt-3 text-sm leading-relaxed text-ink-600 sm:text-base">
          {paragraph}
        </p>
      ))}
      {section.items && (
        <ul className="mt-4 space-y-2">
          {section.items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 text-sm leading-relaxed text-ink-600 sm:text-base"
            >
              <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

import { cn } from '@/lib/utils'

const categoryColors: Record<string, string> = {
  general: 'bg-ink-100 text-ink-700',
  usmile: 'bg-blue-100 text-blue-700',
  residency: 'bg-violet-100 text-violet-700',
  'clinical-questions': 'bg-rose-100 text-rose-700',
  'electives-rotations': 'bg-emerald-100 text-emerald-700',
  'hospital-reviews': 'bg-amber-100 text-amber-700',
  research: 'bg-cyan-100 text-cyan-700',
  'img-life': 'bg-pink-100 text-pink-700',
  career: 'bg-indigo-100 text-indigo-700',
  resources: 'bg-teal-100 text-teal-700',
}

export function ForumCategoryBadge({
  name,
  slug,
  className,
}: {
  name: string
  slug: string
  className?: string
}) {
  const colorClass = categoryColors[slug] ?? 'bg-ink-100 text-ink-700'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide',
        colorClass,
        className,
      )}
    >
      {name}
    </span>
  )
}

import { useState } from 'react'
import {
  BookOpen,
  ExternalLink,
  FileText,
  GraduationCap,
  ListChecks,
  Search,
  Sparkles,
  Video,
} from 'lucide-react'
import type { ResourceType, StudyResource } from '@/mocks/study-resources'
import { resourceCategories, resourceTypeMeta } from '@/mocks/study-resources'
import { useStudyResources } from '@/lib/studentQueries'
import { PageHeader } from '@/components/ui/page-header'
import { PageLoader } from '@/components/ui/spinner'
import { StatusBadge } from '@/components/ui/status-badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const typeIcons: Record<ResourceType, typeof BookOpen> = {
  guide: BookOpen,
  checklist: ListChecks,
  course: GraduationCap,
  article: FileText,
  video: Video,
}

const typeTone: Record<ResourceType, 'neutral' | 'brand' | 'amber' | 'sky' | 'violet'> = {
  guide: 'brand',
  checklist: 'amber',
  course: 'violet',
  article: 'sky',
  video: 'neutral',
}

export function StudyResourcesPage() {
  const { data, isPending } = useStudyResources()
  const [category, setCategory] = useState<string>('All')
  const [query, setQuery] = useState('')

  if (isPending) return <PageLoader label="Loading study resources…" />

  const resources = data ?? []
  const freeCount = resources.filter(r => r.free).length
  const recommendedCount = resources.filter(r => r.recommended).length

  const filtered = resources.filter(r => {
    if (category !== 'All' && r.category !== category) return false
    if (query) {
      const q = query.toLowerCase()
      const inText = `${r.title} ${r.description} ${r.tags.join(' ')}`.toLowerCase()
      if (!inText.includes(q)) return false
    }
    return true
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Study Resources"
        subtitle="Curated guides, checklists, and courses to support every stage of your residency journey."
      />

      <div className="grid grid-cols-3 gap-4">
        <StatChip icon={BookOpen} label="Resources available" value={resources.length} />
        <StatChip icon={Sparkles} label="Free resources" value={freeCount} />
        <StatChip icon={GraduationCap} label="Recommended for you" value={recommendedCount} tone="violet" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {['All', ...resourceCategories].map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                category === c
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-ink-300 bg-white text-ink-700 hover:border-brand-400',
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search resources…"
            className="pl-10"
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(resource => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-ink-300 bg-white/60 px-6 py-16 text-center">
          <p className="font-display text-lg font-bold text-ink-900">No resources found</p>
          <p className="mt-1 text-sm text-ink-600">
            Try a different category or search term to find what you need.
          </p>
        </div>
      )}
    </div>
  )
}

function StatChip({
  icon: Icon,
  label,
  value,
  tone = 'neutral',
}: {
  icon: typeof BookOpen
  label: string
  value: number
  tone?: 'neutral' | 'violet'
}) {
  const tones = {
    neutral: 'bg-ink-100 text-ink-700',
    violet: 'bg-violet-100 text-violet-700',
  }
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-white p-4 shadow-soft">
      <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', tones[tone])}>
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="font-display text-xl font-bold leading-tight text-ink-900">{value}</p>
        <p className="truncate text-xs font-medium text-ink-500">{label}</p>
      </div>
    </div>
  )
}

function ResourceCard({ resource }: { resource: StudyResource }) {
  const Icon = typeIcons[resource.type]
  return (
    <div className="flex flex-col rounded-3xl border border-ink-200 bg-white p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          <StatusBadge label={resourceTypeMeta[resource.type].label} tone={typeTone[resource.type]} />
          {resource.free ? (
            <StatusBadge label="Free" tone="emerald" />
          ) : (
            <StatusBadge label="Premium" tone="neutral" />
          )}
        </div>
      </div>

      <h3 className="mt-4 font-display text-lg font-bold leading-snug text-ink-900">{resource.title}</h3>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-400">{resource.category}</p>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-600">{resource.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {resource.tags.map(tag => (
          <span key={tag} className="rounded-full bg-ink-100 px-2.5 py-1 text-[11px] font-semibold text-ink-600">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-4">
        <span className="text-xs font-medium text-ink-500">{resource.duration}</span>
        <a
          href={resource.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          {resource.recommended ? 'Recommended' : 'Open resource'} <ExternalLink className="size-3.5" aria-hidden />
        </a>
      </div>
    </div>
  )
}

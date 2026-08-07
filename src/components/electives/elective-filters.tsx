import { Search } from 'lucide-react'
import { electiveCities, electiveDurations, electiveSpecialties } from '@/mocks/electives'
import type { ElectiveFilters } from '@/lib/api'
import { cn } from '@/lib/utils'

const selectClass =
  'w-full cursor-pointer rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm font-medium text-ink-800 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

export function ElectiveFilters({
  filters,
  onChange,
}: {
  filters: ElectiveFilters
  onChange: (next: ElectiveFilters) => void
}) {
  const set = (patch: Partial<ElectiveFilters>) => onChange({ ...filters, ...patch })

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-ink-200 bg-white p-4 shadow-soft">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-ink-400" aria-hidden />
        <input
          type="search"
          value={filters.search ?? ''}
          onChange={e => set({ search: e.target.value || undefined })}
          placeholder="Search specialty, hospital, or city"
          className={cn(selectClass, 'pl-10')}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <select
          aria-label="Filter by specialty"
          value={filters.specialty ?? ''}
          onChange={e => set({ specialty: e.target.value || undefined })}
          className={selectClass}
        >
          <option value="">All specialties</option>
          {electiveSpecialties.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by location"
          value={filters.city ?? ''}
          onChange={e => set({ city: e.target.value || undefined })}
          className={selectClass}
        >
          <option value="">All locations</option>
          {electiveCities.map(c => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by duration"
          value={filters.duration ?? ''}
          onChange={e => set({ duration: e.target.value ? Number(e.target.value) : undefined })}
          className={selectClass}
        >
          <option value="">Any duration</option>
          {electiveDurations.map(d => (
            <option key={d} value={d}>
              {d} weeks
            </option>
          ))}
        </select>
        <select
          aria-label="Sort electives"
          value={filters.sort ?? 'rating'}
          onChange={e => set({ sort: e.target.value as ElectiveFilters['sort'] })}
          className={selectClass}
        >
          <option value="rating">Top rated</option>
          <option value="soonest">Earliest start</option>
          <option value="fee">Lowest fee</option>
        </select>
      </div>
    </div>
  )
}

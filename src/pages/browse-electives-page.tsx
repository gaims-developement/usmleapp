import { useSearchParams } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { useElectives } from '@/lib/queries'
import type { ElectiveFilters } from '@/lib/mocks'
import { PageHeader } from '@/components/ui/page-header'
import { PageLoader } from '@/components/ui/spinner'
import { ElectiveFilters as Filters } from '@/components/electives/elective-filters'
import { ElectiveCard } from '@/components/electives/elective-card'
import { EmptyState } from '@/components/ui/empty-state'
import { Spinner } from '@/components/ui/spinner'

export function BrowseElectivesPage() {
  const [params, setParams] = useSearchParams()

  const filters: ElectiveFilters = {
    search: params.get('q') ?? undefined,
    specialty: params.get('specialty') ?? undefined,
    city: params.get('city') ?? undefined,
    duration: params.get('duration') ? Number(params.get('duration')) : undefined,
    sort: (params.get('sort') as ElectiveFilters['sort']) ?? 'rating',
  }

  const { data, isPending, isFetching } = useElectives(filters)

  function handleChange(next: ElectiveFilters) {
    const sp = new URLSearchParams()
    if (next.search) sp.set('q', next.search)
    if (next.specialty) sp.set('specialty', next.specialty)
    if (next.city) sp.set('city', next.city)
    if (next.duration) sp.set('duration', String(next.duration))
    if (next.sort && next.sort !== 'rating') sp.set('sort', next.sort)
    setParams(sp, { replace: true })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Browse electives"
        subtitle="See every verified U.S. rotation. Use filters to narrow down, then apply to any program you like."
      />

      <Filters filters={filters} onChange={handleChange} />

      {isPending ? (
        <PageLoader label="Finding electives…" />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-600">
              <span className="font-semibold text-ink-900">{data?.length ?? 0}</span> elective
              {data?.length === 1 ? '' : 's'} found
            </p>
            {isFetching && <Spinner className="size-4" />}
          </div>

          {data && data.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {data.map(e => (
                <ElectiveCard key={e.id} elective={e} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<SearchX className="size-7" />}
              title="No electives match your filters"
              description="Try widening your specialty, location, or duration filters."
              actionLabel="Clear filters"
              actionTo="/electives"
            />
          )}
        </>
      )}
    </div>
  )
}

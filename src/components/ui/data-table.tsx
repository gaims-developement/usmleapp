import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  SearchX,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DataTableColumn<T> {
  key: string
  header: string
  cell: (row: T) => ReactNode
  align?: 'left' | 'right' | 'center'
  sortValue?: (row: T) => string | number
  className?: string
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  keyField: keyof T
  loading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  pageSize?: number
  rowClassName?: (row: T) => string | undefined
  bare?: boolean
  tableClassName?: string
}

export function DataTable<T>({
  columns,
  data,
  keyField,
  loading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your filters or search.',
  pageSize,
  rowClassName,
  bare = false,
  tableClassName,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null)
  const [page, setPage] = useState(0)

  const sorted = useMemo(() => {
    if (!sort) return data
    const col = columns.find(c => c.key === sort.key)
    if (!col?.sortValue) return data
    const arr = [...data].sort((a, b) => {
      const av = col.sortValue!(a)
      const bv = col.sortValue!(b)
      const cmp =
        typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv))
      return sort.dir === 'asc' ? cmp : -cmp
    })
    return arr
  }, [data, sort, columns])

  const pageCount = pageSize ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1
  const safePage = Math.min(page, pageCount - 1)
  const rows = pageSize ? sorted.slice(safePage * pageSize, safePage * pageSize + pageSize) : sorted
  const skeletonCount = pageSize ? Math.min(pageSize, 6) : 6

  function toggleSort(key: string) {
    setSort(prev => {
      if (!prev || prev.key !== key) return { key, dir: 'asc' }
      if (prev.dir === 'asc') return { key, dir: 'desc' }
      return null
    })
    setPage(0)
  }

  return (
    <div className={cn('flex flex-col', tableClassName)}>
      <div
        className={cn(
          'overflow-x-auto',
          !bare && 'rounded-3xl border border-ink-200 bg-white shadow-soft',
        )}
      >
        <table className="min-w-full divide-y divide-ink-200 text-left">
          <thead>
            <tr>
              {columns.map(col => {
                const sortable = Boolean(col.sortValue)
                const active = sort?.key === col.key
                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={cn(
                      'whitespace-nowrap px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-500',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                    )}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className={cn(
                          'inline-flex cursor-pointer items-center gap-1 uppercase transition-colors hover:text-ink-800',
                          active && 'text-brand-700',
                        )}
                      >
                        {col.header}
                        {active ? (
                          sort!.dir === 'asc' ? (
                            <ChevronUp className="size-3.5" aria-hidden />
                          ) : (
                            <ChevronDown className="size-3.5" aria-hidden />
                          )
                        ) : (
                          <ChevronsUpDown className="size-3.5" aria-hidden />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {loading
              ? Array.from({ length: skeletonCount }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse">
                    {columns.map(col => (
                      <td key={col.key} className="px-5 py-4">
                        <div className="h-3.5 w-3/4 rounded bg-ink-100" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map(row => (
                  <tr
                    key={String(row[keyField])}
                    className={cn(
                      'transition-colors hover:bg-ink-50/70',
                      rowClassName?.(row),
                    )}
                  >
                    {columns.map(col => (
                      <td
                        key={col.key}
                        className={cn(
                          'whitespace-nowrap px-5 py-4 text-sm text-ink-700',
                          col.align === 'right' && 'text-right',
                          col.align === 'center' && 'text-center',
                          col.className,
                        )}
                      >
                        {col.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-5 py-16 text-center">
                  <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-ink-100 text-ink-400">
                    <SearchX className="size-6" aria-hidden />
                  </div>
                  <p className="mt-3 font-display text-sm font-bold text-ink-800">{emptyTitle}</p>
                  <p className="mt-1 text-sm text-ink-500">{emptyDescription}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {pageSize && sorted.length > pageSize && (
        <div
          className={cn(
            'flex items-center justify-between gap-3 py-4',
            bare ? '' : 'px-2',
          )}
        >
          <p className="text-sm text-ink-500">
            Showing{' '}
            <span className="font-semibold text-ink-800">
              {safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, sorted.length)}
            </span>{' '}
            of {sorted.length}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage === 0}
              onClick={() => setPage(p => Math.max(0, p - 1))}
              className="grid size-9 cursor-pointer place-items-center rounded-xl border border-ink-200 text-ink-600 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <span className="px-2 text-sm font-semibold text-ink-700">
              {safePage + 1} / {pageCount}
            </span>
            <button
              type="button"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
              className="grid size-9 cursor-pointer place-items-center rounded-xl border border-ink-200 text-ink-600 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

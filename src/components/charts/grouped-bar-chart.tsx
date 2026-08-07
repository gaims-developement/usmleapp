import { cn } from '@/lib/utils'

export interface BarSeriesDef {
  name: string
  color: string
}

export interface GroupedBarDatum {
  label: string
  values: number[]
}

interface GroupedBarChartProps {
  labels: BarSeriesDef[]
  data: GroupedBarDatum[]
  height?: number
  valueFormat?: (value: number) => string
  className?: string
}

export function GroupedBarChart({
  labels,
  data,
  height = 176,
  valueFormat = v => `${v}`,
  className,
}: GroupedBarChartProps) {
  if (data.length === 0 || labels.length === 0) return null
  const max = Math.max(...data.flatMap(d => d.values), 1) * 1.1

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-3 flex flex-wrap justify-end gap-4">
        {labels.map(l => (
          <span
            key={l.name}
            className="flex items-center gap-1.5 text-xs font-medium text-ink-500"
          >
            <span className="size-2.5 rounded-sm" style={{ background: l.color }} />
            {l.name}
          </span>
        ))}
      </div>
      <div className="flex items-end gap-2 sm:gap-3">
        {data.map(g => (
          <div
            key={g.label}
            className="flex flex-1 flex-col items-center gap-2"
            style={{ height }}
          >
            <div className="flex w-full flex-1 items-end justify-center gap-1.5 sm:gap-2">
              {g.values.map((v, i) => (
                <div
                  key={`${g.label}-${i}`}
                  title={`${g.label} · ${labels[i]?.name}: ${valueFormat(v)}`}
                  className="w-4 rounded-t-md sm:w-7"
                  style={{
                    height: `${Math.max((v / max) * 100, 0)}%`,
                    minHeight: v > 0 ? 4 : 0,
                    background: labels[i]?.color,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div
        className="mt-2 grid"
        style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}
      >
        {data.map(g => (
          <span key={g.label} className="truncate text-center text-[11px] font-medium text-ink-400">
            {g.label}
          </span>
        ))}
      </div>
    </div>
  )
}

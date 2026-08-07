import { cn } from '@/lib/utils'

export interface DonutSlice {
  label: string
  value: number
  color: string
}

interface DonutChartProps {
  data: DonutSlice[]
  size?: number
  thickness?: number
  valueFormat?: (value: number) => string
  centerLabel?: string
  centerValue?: string
  className?: string
}

export function DonutChart({
  data,
  size = 168,
  thickness = 20,
  valueFormat = v => `${v}`,
  centerLabel = 'Total',
  centerValue,
  className,
}: DonutChartProps) {
  if (data.length === 0) return null

  const total = data.reduce((sum, d) => sum + d.value, 0)
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  let offset = 0

  return (
    <div className={cn('flex flex-col items-center gap-5 sm:flex-row sm:gap-6', className)}>
      <div className="relative shrink-0">
        <svg width={size} height={size} className="-rotate-90" role="img" aria-label="Donut chart">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={thickness}
          />
          {data.map(d => {
            const len = (d.value / total) * c
            const el = (
              <circle
                key={d.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={d.color}
                strokeWidth={thickness}
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
              >
                <title>{`${d.label}: ${valueFormat(d.value)}`}</title>
              </circle>
            )
            offset += len
            return el
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl font-bold text-ink-900">
            {centerValue ?? valueFormat(total)}
          </span>
          <span className="text-xs text-ink-500">{centerLabel}</span>
        </div>
      </div>
      <ul className="w-full flex-1 space-y-2.5">
        {data.map(d => (
          <li key={d.label} className="flex items-center gap-2 text-sm">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
            <span className="min-w-0 flex-1 truncate text-ink-600">{d.label}</span>
            <span className="font-semibold text-ink-800">{valueFormat(d.value)}</span>
            <span className="w-11 text-right text-xs text-ink-400">
              {((d.value / total) * 100).toFixed(0)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

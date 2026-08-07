import { useId } from 'react'
import { cn } from '@/lib/utils'

export interface LineChartPoint {
  label: string
  value: number
}

interface LineChartProps {
  data: LineChartPoint[]
  color?: string
  valueFormat?: (value: number) => string
  className?: string
}

const W = 600
const H = 200
const PAD = 12

export function LineChart({
  data,
  color = '#0d9488',
  valueFormat = v => `${v}`,
  className,
}: LineChartProps) {
  const gradId = useId().replace(/[^a-zA-Z0-9]/g, '')
  if (data.length === 0) return null

  const max = Math.max(...data.map(d => d.value), 1) * 1.15
  const innerW = W - PAD * 2
  const innerH = H - PAD * 2
  const step = innerW / (data.length - 1)
  const pts = data.map((d, i) => ({
    x: PAD + i * step,
    y: PAD + innerH - (d.value / max) * innerH,
    d,
  }))
  const line = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ')
  const area = `${line} L${pts[pts.length - 1].x.toFixed(1)},${PAD + innerH} L${PAD},${PAD + innerH} Z`

  return (
    <div className={cn('w-full', className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Line chart">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map(t => (
          <line
            key={t}
            x1={PAD}
            x2={W - PAD}
            y1={PAD + innerH * (1 - t)}
            y2={PAD + innerH * (1 - t)}
            stroke="#e2e8f0"
            strokeDasharray="4 4"
          />
        ))}
        <path d={area} fill={`url(#${gradId})`} />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pts.map((p, i) => (
          <g key={`${p.d.label}-${i}`}>
            <circle cx={p.x} cy={p.y} r="8" fill="transparent">
              <title>{`${p.d.label}: ${valueFormat(p.d.value)}`}</title>
            </circle>
            <circle cx={p.x} cy={p.y} r="3" fill={color} />
            {i === pts.length - 1 && (
              <>
                <circle cx={p.x} cy={p.y} r="6.5" fill="white" stroke={color} strokeWidth="2" />
                <circle cx={p.x} cy={p.y} r="3" fill={color} />
              </>
            )}
          </g>
        ))}
      </svg>
      <div
        className="mt-2 grid"
        style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}
      >
        {data.map(d => (
          <span key={d.label} className="truncate text-center text-[11px] font-medium text-ink-400">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}

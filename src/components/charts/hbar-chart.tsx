import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface HBarDatum {
  label: string
  value: number
  color?: string
}

interface HBarChartProps {
  data: HBarDatum[]
  max?: number
  valueFormat?: (value: number) => string
  className?: string
}

export function HBarChart({
  data,
  max,
  valueFormat = v => `${v}`,
  className,
}: HBarChartProps) {
  if (data.length === 0) return null
  const ceiling = max ?? Math.max(...data.map(d => d.value), 1) * 1.05

  return (
    <div className={cn('space-y-3.5', className)}>
      {data.map(d => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-36 shrink-0 truncate text-right text-sm font-medium text-ink-600">
            {d.label}
          </span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink-100">
            <motion.div
              className="h-full rounded-full"
              style={{ background: d.color ?? '#0d9488' }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((d.value / ceiling) * 100, 100)}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <span className="w-14 shrink-0 text-right text-sm font-semibold text-ink-800">
            {valueFormat(d.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

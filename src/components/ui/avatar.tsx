import { initialsOf } from '@/lib/utils'
import { cn } from '@/lib/utils'

const palettes = [
  'bg-brand-100 text-brand-800',
  'bg-accent-100 text-accent-800',
  'bg-amber-100 text-amber-800',
  'bg-violet-100 text-violet-800',
  'bg-sky-100 text-sky-800',
  'bg-rose-100 text-rose-700',
]

export function Avatar({
  name,
  src,
  className,
}: {
  name: string
  src?: string | null
  className?: string
}) {
  const index = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % palettes.length

  if (src) {
    return (
      <span
        className={cn('grid size-9 shrink-0 place-items-center overflow-hidden rounded-full', className)}
        aria-hidden
      >
        <img
          src={src}
          alt=""
          className="size-full rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
      </span>
    )
  }

  return (
    <span
      className={cn(
        'grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold',
        palettes[index],
        className,
      )}
      aria-hidden
    >
      {initialsOf(name)}
    </span>
  )
}

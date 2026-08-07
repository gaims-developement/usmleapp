import { cn } from '@/lib/utils'

interface ContainerProps {
  className?: string
  children: React.ReactNode
}

export function Container({ className, children }: ContainerProps) {
  return <div className={cn('container-px', className)}>{children}</div>
}

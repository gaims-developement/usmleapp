import { forwardRef } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { buttonClass, type Variant, type Size } from '@/components/ui/button-styles'

interface BaseButtonProps {
  variant?: Variant
  size?: Size
  className?: string
  children: React.ReactNode
}

export const Button = forwardRef<
  HTMLButtonElement,
  BaseButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ variant = 'primary', size = 'md', className, children, ...props }, ref) => (
  <button ref={ref} className={buttonClass(variant, size, className)} {...props}>
    {children}
  </button>
))
Button.displayName = 'Button'

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: BaseButtonProps & LinkProps) {
  return (
    <Link className={buttonClass(variant, size, className)} {...props}>
      {children}
    </Link>
  )
}

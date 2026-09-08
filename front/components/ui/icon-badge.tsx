import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface IconBadgeProps {
  children: React.ReactNode
  badge?: string
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  className?: string
  badgeClassName?: string
}

const positionClasses = {
  'top-right': 'top-0 right-0 translate-x-1/2 -translate-y-1/2',
  'top-left': 'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
  'bottom-right': 'bottom-0 right-0 translate-x-1/2 translate-y-1/2',
  'bottom-left': 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
}

export function IconBadge({
  children,
  badge,
  position = 'top-right',
  className,
  badgeClassName,
}: IconBadgeProps) {
  return (
    <div className={cn('relative inline-flex', className)}>
      {children}
      {badge && (
        <Badge
          className={cn(
            'absolute inline-flex h-4 px-1 rounded-full justify-center font-mono tabular-nums pointer-events-none',
            positionClasses[position],
            badgeClassName
          )}
        >
          {badge}
        </Badge>
      )}
    </div>
  )
}

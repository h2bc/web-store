'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CartEmptyStateProps {
  onNavigate?: () => void
  className?: string
  buttonClassName?: string
}

export default function CartEmptyState({
  onNavigate,
  className,
  buttonClassName,
}: CartEmptyStateProps) {
  return (
    <div className={cn('text-center', className)}>
      <span className="font-script text-foreground/90 text-5xl select-none">
        Cart empty
      </span>

      <div className="mt-6">
        <Button asChild variant="outline" className={buttonClassName}>
          <Link href="/shop" onClick={() => onNavigate?.()}>
            Continue shopping
          </Link>
        </Button>
      </div>
    </div>
  )
}

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
    <div className={cn('flex flex-col items-center text-center', className)}>
      <span className="font-script text-foreground/90 text-5xl select-none mb-6">
        Cart empty
      </span>
      <p className="text-sm text-muted-foreground">
        Looks like you have not added anything yet.
      </p>
      <Button
        asChild
        size="lg"
        className={cn('mt-6 w-full max-w-xs', buttonClassName)}
      >
        <Link href="/shop" onClick={() => onNavigate?.()}>
          Continue shopping
        </Link>
      </Button>
    </div>
  )
}

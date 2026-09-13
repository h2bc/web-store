'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  children: ReactNode
  description: string
  onNavigate?: () => void
}

export const EmptyStateTitle = ({ children }: { children: ReactNode }) => (
  <span className="font-script text-foreground/90 text-5xl select-none">
    {children}
  </span>
)

const EmptyState = ({ children, description, onNavigate }: EmptyStateProps) => (
  <div className="w-full flex flex-col items-center text-center">
    <div className="mb-6">{children}</div>
    <p className="text-sm text-muted-foreground">{description}</p>
    <Button asChild size="lg" className="mt-6 w-full max-w-xs">
      <Link href="/shop" onClick={() => onNavigate?.()}>
        Continue shopping
      </Link>
    </Button>
  </div>
)

export default EmptyState

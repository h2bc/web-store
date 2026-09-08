import Link from 'next/link'
import { Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface CheckoutStepSectionProps {
  step: number
  title: string
  isActive: boolean
  isComplete: boolean
  summary?: React.ReactNode
  editHref?: string
  children?: React.ReactNode
}

export default function CheckoutStepSection({
  step,
  title,
  isActive,
  isComplete,
  summary,
  editHref,
  children,
}: CheckoutStepSectionProps) {
  return (
    <Card className={cn(!isActive && 'opacity-90')}>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <span
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-full border text-xs',
              isComplete && 'bg-foreground text-background border-foreground'
            )}
          >
            {isComplete ? <Check className="h-3 w-3" /> : step}
          </span>
          {title}
        </CardTitle>

        {!isActive && isComplete && editHref && (
          <Link
            href={editHref}
            className="text-sm underline text-muted-foreground hover:text-foreground"
          >
            Edit
          </Link>
        )}
      </CardHeader>

      <CardContent>
        {isActive ? children : isComplete ? summary : null}
      </CardContent>
    </Card>
  )
}

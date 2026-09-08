import Link from 'next/link'
import { Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

interface ShippingInfoAlertProps {
  className?: string
  descriptionClassName?: string
  onLearnMoreClick?: () => void
}

export default function ShippingInfoAlert({
  className,
  descriptionClassName,
  onLearnMoreClick,
}: ShippingInfoAlertProps) {
  const learnMoreProps = onLearnMoreClick ? { onClick: onLearnMoreClick } : {}

  return (
    <Alert className={className}>
      <Info className="h-4 w-4" />
      <AlertDescription className={cn(descriptionClassName)}>
        Free shipping above €30 (LT) / €60 (Europe).{' '}
        <Link
          href="/shipping-returns"
          className="underline hover:text-foreground"
          {...learnMoreProps}
        >
          Learn more
        </Link>
      </AlertDescription>
    </Alert>
  )
}

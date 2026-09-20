import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

interface ConsentBannerProps {
  onAccept: () => void
  onDecline: () => void
}

export default function ConsentBanner({
  onAccept,
  onDecline,
}: ConsentBannerProps) {
  return (
    <Card
      role="region"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:max-w-sm"
    >
      <CardContent className="pt-6 text-sm">
        We use cookies for analytics. You can change your choice any time from
        the footer.{' '}
        <Link href="/privacy" className="underline hover:text-foreground">
          Privacy Policy
        </Link>
      </CardContent>
      <CardFooter className="gap-3">
        <Button variant="outline" className="flex-1" onClick={onDecline}>
          Decline
        </Button>
        <Button className="flex-1" onClick={onAccept}>
          Accept
        </Button>
      </CardFooter>
    </Card>
  )
}

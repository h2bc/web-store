import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col self-stretch items-center justify-center text-center">
      <Image
        src="/404.gif"
        alt=""
        width={320}
        height={256}
        priority
        className="mb-6"
        unoptimized
      />
      <p className="text-base font-semibold">Page not found</p>
      <p className="mt-1 text-sm text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <Button asChild size="lg" className="mt-6 w-full max-w-xs">
        <Link href="/shop">Continue shopping</Link>
      </Button>
    </div>
  )
}

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col self-stretch items-center justify-center">
      <Image
        src="/404.gif"
        alt="404 Not Found gif"
        width={320}
        height={256}
        preload
        className="mb-8"
        unoptimized
      />
      <Button variant="link" className="uppercase text-md">
        <Link href="/shop">{'<'} Go back home</Link>
      </Button>
    </div>
  )
}

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function HeaderLogo({
  position,
}: {
  position: 'left' | 'center'
}) {
  const isCheckout = usePathname().startsWith('/checkout')

  if (isCheckout ? position === 'left' : false) {
    return null
  }

  const className = isCheckout
    ? 'inline-flex'
    : position === 'left'
      ? 'hidden md:inline-flex'
      : 'md:hidden inline-flex'

  return (
    <Link href="/" aria-label="Home" className={cn(className)}>
      <Image
        src="/bw-logo.svg"
        alt="h2bc"
        width={200}
        height={80}
        className="h-12 md:h-18 w-auto"
        preload
      />
    </Link>
  )
}

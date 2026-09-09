'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAV_LINKS } from '@/lib/routes'

interface NavLinksProps {
  ulClassName?: string
  linkClassName?: string
  onNavigate?: () => void
}

export default function NavLinks({
  ulClassName = '',
  linkClassName = '',
  onNavigate,
}: NavLinksProps) {
  const pathname = usePathname()
  const isCheckout = pathname.startsWith('/checkout')

  if (isCheckout) {
    return null
  }

  return (
    <ul className={ulClassName}>
      {NAV_LINKS.map(({ href, label }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/')

        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              className={cn(
                'font-blackletter hover:text-shadow-xl hover:text-shadow-pink-500 transition-all duration-300',
                linkClassName,
                isActive && 'text-pink-500'
              )}
            >
              {label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

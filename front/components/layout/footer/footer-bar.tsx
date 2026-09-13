'use client'

import SocialIcons from './social-icons'
import RightsNotice from './rights-notice'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { POLICY_PAGES } from '@/lib/routes'

export default function FooterBar() {
  const isCheckout = usePathname().startsWith('/checkout')

  return (
    <footer className="w-full px-4 sm:px-8 md:px-12 lg:px-18 pt-8 sm:pt-10 md:pt-12 pb-6 sm:pb-8 md:pb-10 lg:pb-10 text-sm">
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:justify-between w-full">
        {/* Left: policy links (stacked small, inline large) */}
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-6">
          {POLICY_PAGES.map((page) => (
            <Button
              key={page.path}
              variant="link"
              asChild
              className="uppercase text-xs p-0 h-auto"
            >
              <Link href={page.path}>{page.label}</Link>
            </Button>
          ))}
        </div>
        {/* Right group: rights notice + social icons */}
        <div className="flex items-center gap-4">
          <RightsNotice />
          {!isCheckout && <SocialIcons />}
        </div>
      </div>
    </footer>
  )
}

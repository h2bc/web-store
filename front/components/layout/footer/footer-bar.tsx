'use client'

import SocialIcons from './social-icons'
import RightsNotice from './rights-notice'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import MobileRegionSelector from './mobile-region-selector'
import { changeRegion } from '@/lib/data/cart'
import type { RegionSummary } from '@/lib/types/region'

const FOOTER_LINKS = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/shipping-returns', label: 'Shipping & Returns' },
  { href: '/terms', label: 'Terms & Conditions' },
]

interface FooterBarProps {
  regions: RegionSummary[]
  currentRegion: RegionSummary | null
  regionSelectorDisabled: boolean
}

export default function FooterBar({
  regions,
  currentRegion,
  regionSelectorDisabled,
}: FooterBarProps) {
  const isCheckout = usePathname().startsWith('/checkout')

  return (
    <footer className="w-full px-4 sm:px-8 md:px-12 lg:px-18 pt-8 sm:pt-10 md:pt-12 pb-6 sm:pb-8 md:pb-10 lg:pb-10 text-sm">
      <div className="flex justify-center pb-4 sm:hidden">
        <MobileRegionSelector
          regions={regions}
          currentRegion={currentRegion}
          disabled={regionSelectorDisabled}
          onRegionChange={changeRegion}
        />
      </div>

      <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:justify-between w-full">
        {/* Left: policy links (stacked small, inline large) */}
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-6">
          {FOOTER_LINKS.map((link) => (
            <Button
              key={link.href}
              variant="link"
              asChild
              className="uppercase text-xs p-0 h-auto"
            >
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </div>
        {/* Right group: rights notice + social icons */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex md:hidden">
            <MobileRegionSelector
              regions={regions}
              currentRegion={currentRegion}
              disabled={regionSelectorDisabled}
              onRegionChange={changeRegion}
            />
          </div>
          <RightsNotice />
          {!isCheckout && <SocialIcons />}
        </div>
      </div>
    </footer>
  )
}

import NavLinks from './nav-links'
import HeaderLogo from './header-logo'
import BurgerMenu from './burger-menu'
import RegionSelector from './region-selector'
import CartPreview from '@/components/cart/preview/cart-preview'
import ClientToastErrorHandler from '@/components/feedback/client-toast-error-handler'
import { changeRegion } from '@/lib/data/cart'
import { getCart } from '@/lib/data/cart'
import type { RegionSummary } from '@/lib/types/region'

interface SiteHeaderProps {
  regions: RegionSummary[]
  currentRegion: RegionSummary | null
  regionSelectorDisabled: boolean
  regionsError: string | null
  currentRegionError: string | null
}

export default async function SiteHeader({
  regions,
  currentRegion,
  regionSelectorDisabled,
  regionsError,
  currentRegionError,
}: SiteHeaderProps) {
  const { cart } = await getCart()

  return (
    <ClientToastErrorHandler errors={[regionsError, currentRegionError]}>
      <header className="relative z-50 w-full px-4 sm:px-8 md:px-12 lg:px-18 py-6 sm:py-8 md:py-10 lg:py-12">
        <div className="grid grid-cols-3 items-center">
          {/* LEFT */}
          <div className="flex items-center gap-2">
            {/* mobile: burger */}
            <div className="md:hidden">
              <BurgerMenu />
            </div>
            <HeaderLogo position="left" />
          </div>

          {/* CENTER */}
          <div className="flex items-center justify-center">
            <HeaderLogo position="center" />

            {/* desktop: nav links centered */}
            <nav
              aria-label="Primary"
              className="hidden md:flex items-center justify-center"
            >
              <NavLinks ulClassName="flex items-center gap-5 lg:gap-12 text-2xl leading-none tracking-wide" />
            </nav>
          </div>

          {/* RIGHT */}
          <nav
            aria-label="Shop"
            className="flex items-center justify-end gap-2"
          >
            {/* desktop: region dropdown on right */}
            <div className="hidden md:block">
              <RegionSelector
                regions={regions}
                currentRegion={currentRegion}
                disabled={regionSelectorDisabled}
                onRegionChange={changeRegion}
              />
            </div>

            <CartPreview cart={cart} />
          </nav>
        </div>
      </header>
    </ClientToastErrorHandler>
  )
}

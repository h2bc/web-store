import FooterBar from '@/components/layout/footer/footer-bar'
import SiteHeader from '@/components/layout/header/site-header'
import { getRegionId } from '@/lib/cookies'
import { getRegions } from '@/lib/data/regions'

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const regionId = await getRegionId()
  const currentRegionError = !regionId ? 'Failed to load region' : null
  const { regions, error: regionsError } = await getRegions()
  const currentRegion = regions.find((r) => r.id === regionId) || null
  const regionSelectorDisabled = !!regionsError || regions.length <= 1

  return (
    <>
      <SiteHeader
        regions={regions}
        currentRegion={currentRegion}
        regionSelectorDisabled={regionSelectorDisabled}
        regionsError={regionsError}
        currentRegionError={currentRegionError}
      />
      <main className="flex-1 flex flex-col max-w-7xl w-full px-6 sm:px-8 md:px-10">
        {children}
      </main>
      <FooterBar
        regions={regions}
        currentRegion={currentRegion}
        regionSelectorDisabled={regionSelectorDisabled}
      />
    </>
  )
}

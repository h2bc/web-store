'use server'

import { sdk } from '@/lib/medusa'
import { cached } from '@/lib/cache'
import type { HttpTypes } from '@medusajs/types'
import type { RegionSummary } from '@/lib/types/region'

const CACHE_REVALIDATE_TIME = 3600

const fetchRegionsFromAPI = cached(
  async (): Promise<RegionSummary[]> => {
    const { regions } = await sdk.store.region.list()
    return regions.map((r: HttpTypes.StoreRegion) => ({
      id: r.id,
      name: r.name,
      shortName:
        typeof r.metadata?.shortName === 'string'
          ? r.metadata.shortName
          : r.currency_code.toUpperCase(),
      currencyCode: r.currency_code,
    }))
  },
  ['regions'],
  { revalidate: CACHE_REVALIDATE_TIME, tags: ['regions'] }
)

export async function getRegions() {
  try {
    const regions = await fetchRegionsFromAPI()
    return {
      regions,
      error: null,
    }
  } catch (error) {
    console.error('Failed to fetch regions:', error)
    return {
      regions: [],
      error:
        'Failed to load regions. Using default region. Please refresh the page to try again.',
    }
  }
}

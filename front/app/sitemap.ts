import type { MetadataRoute } from 'next'
import { getProductHandles } from '@/lib/data/products'
import { productPath, siteUrl } from '@/lib/seo'

// Product entries come from the live catalog, never from a build-time snapshot.
export const dynamic = 'force-dynamic'

const STATIC_PATHS = [
  '/',
  '/shop',
  '/gallery',
  '/about',
  '/contact',
  '/shipping-returns',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteUrl()
  const staticEntries = STATIC_PATHS.map((path) => ({ url: origin + path }))

  const { handles } = await getProductHandles()
  const productEntries = handles.map(({ handle, updatedAt }) => ({
    url: origin + productPath(handle),
    ...(updatedAt ? { lastModified: updatedAt } : {}),
  }))

  return [...staticEntries, ...productEntries]
}

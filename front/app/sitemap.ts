import type { MetadataRoute } from 'next'
import { getProductHandles } from '@/lib/data/products'
import { PUBLIC_PATHS, productPath } from '@/lib/routes'
import { siteUrl } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteUrl()
  const staticEntries = PUBLIC_PATHS.map((path) => ({ url: origin + path }))

  const handles = await getProductHandles()
  const productEntries = handles.map(({ handle, updatedAt }) => ({
    url: origin + productPath(handle),
    ...(updatedAt ? { lastModified: updatedAt } : {}),
  }))

  return [...staticEntries, ...productEntries]
}

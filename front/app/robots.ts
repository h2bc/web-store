import type { MetadataRoute } from 'next'
import { isIndexable, siteUrl } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  if (!isIndexable()) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/cart', '/checkout', '/order'],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}

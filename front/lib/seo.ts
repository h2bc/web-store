import type { Metadata } from 'next'
import type { Organization, Product, WithContext } from 'schema-dts'
import type { ProductDetail } from '@/lib/types/product-detail'
import type { ContentPage } from '@/lib/types/content-page'
import { isVariantAvailable, selectDisplayVariant } from '@/lib/utils'
import { productPath, type ContentPageRoute } from '@/lib/routes'
import { INSTAGRAM_URL, YOUTUBE_URL } from '@/lib/social'

export const SITE_NAME = 'h2bc'
export const SITE_DESCRIPTION =
  'h2bc is a Lithuanian streetwear brand. Hoodies, tees, beanies and accessories shipped across Lithuania and the EU.'
export const HOME_HEADING = 'h2bc streetwear from Lithuania'
const DEFAULT_OG_IMAGE = '/opengraph-image.png'

export const OPEN_GRAPH_DEFAULTS = {
  siteName: SITE_NAME,
  type: 'website',
  locale: 'en_US',
} satisfies Metadata['openGraph']

export function siteUrl(): string {
  return process.env.SITE_URL?.replace(/\/+$/, '') || 'http://localhost:3000'
}

export function isIndexable(): boolean {
  return process.env.SEO_INDEXABLE === 'true'
}

function productTitle(product: ProductDetail): string {
  return product.seo.title || product.name
}

function productDescription(product: ProductDetail): string {
  return (
    product.seo.description ||
    product.subtitle ||
    product.description ||
    SITE_DESCRIPTION
  )
}

function productImage(product: ProductDetail): string {
  return product.images[0]?.url || product.thumbnail || DEFAULT_OG_IMAGE
}

export function productMetadata(product: ProductDetail): Metadata {
  const path = productPath(product.slug)

  return {
    title: productTitle(product),
    description: productDescription(product),
    alternates: { canonical: path },
    openGraph: {
      ...OPEN_GRAPH_DEFAULTS,
      url: path,
      images: [productImage(product)],
    },
  }
}

export function contentPageMetadata(
  contentPage: ContentPage | null,
  route: ContentPageRoute
): Metadata {
  if (!contentPage) return { title: route.label, robots: { index: false } }

  return {
    title: contentPage.title,
    description: contentPage.description,
    alternates: { canonical: route.path },
  }
}

export function productJsonLd(
  product: ProductDetail,
  url: string
): WithContext<Product> | null {
  const displayVariant = selectDisplayVariant(product.variants)

  if (!displayVariant) return null

  const images = product.images.map((img) => img.url)

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productTitle(product),
    description: productDescription(product),
    image: images.length
      ? images
      : [product.thumbnail || new URL(DEFAULT_OG_IMAGE, url).toString()],
    url,
    brand: { '@type': 'Brand', name: SITE_NAME },
    offers: {
      '@type': 'Offer',
      url,
      price: displayVariant.price,
      priceCurrency: displayVariant.currency.toUpperCase(),
      availability: product.variants.some(isVariantAvailable)
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  }
}

export function organizationJsonLd(): WithContext<Organization> {
  const origin = siteUrl()

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: origin,
    logo: `${origin}/bw-logo.svg`,
    sameAs: [INSTAGRAM_URL, YOUTUBE_URL],
  }
}

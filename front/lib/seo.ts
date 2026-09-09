import type { Metadata } from 'next'
import type { Organization, Product, WithContext } from 'schema-dts'
import type { ProductDetail } from '@/lib/types/product-detail'
import { INSTAGRAM_URL, YOUTUBE_URL } from '@/lib/social'

export const SITE_NAME = 'h2bc'
export const SITE_DESCRIPTION =
  'h2bc is a Lithuanian streetwear brand. Hoodies, tees, beanies and accessories shipped across Lithuania and the EU.'
export const HOME_HEADING = 'h2bc streetwear from Lithuania'
export const DEFAULT_OG_IMAGE = '/opengraph-image'

// Next overwrites `openGraph` per segment instead of merging, so pages that set
// their own Open Graph fields spread these back in.
export const OPEN_GRAPH_DEFAULTS = {
  siteName: SITE_NAME,
  type: 'website',
  locale: 'en_US',
} satisfies Metadata['openGraph']

const DESCRIPTION_MAX = 160

export function siteUrl(): string {
  const configured = process.env.SITE_URL?.replace(/\/+$/, '')
  if (configured) return configured

  // `next build` evaluates metadata without deploy env; only a running production server must fail.
  const building = process.env.NEXT_PHASE === 'phase-production-build'
  if (process.env.NODE_ENV === 'production' && !building) {
    throw new Error('SITE_URL is not set')
  }
  return 'http://localhost:3000'
}

export function isIndexable(): boolean {
  return process.env.SEO_INDEXABLE === 'true'
}

export function truncateDescription(
  markdown: string,
  max = DESCRIPTION_MAX
): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s*([-*+]|\d+\.)\s+/gm, '')
    .replace(/(\*\*|__|[*_~])/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length <= max) return text

  const cut = text.slice(0, max + 1)
  const lastSpace = cut.lastIndexOf(' ')
  const head = (lastSpace > 0 ? cut.slice(0, lastSpace) : cut.slice(0, max))
    .replace(/[\s,;:.!?-]+$/, '')
  return `${head}…`
}

function productDescription(product: ProductDetail): string {
  return (
    product.seo.description ||
    product.subtitle ||
    truncateDescription(product.description) ||
    SITE_DESCRIPTION
  )
}

function productTitle(product: ProductDetail): string {
  return product.seo.title || product.name
}

function productImage(product: ProductDetail): string {
  return product.images[0]?.url || product.thumbnail || DEFAULT_OG_IMAGE
}

export function productPath(handle: string): string {
  return `/shop/${handle}`
}

export function productMetadata(product: ProductDetail): Metadata {
  const title = productTitle(product)
  const description = productDescription(product)
  const path = productPath(product.slug)

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      ...OPEN_GRAPH_DEFAULTS,
      title: `${title} | ${SITE_NAME}`,
      description,
      url: path,
      images: [productImage(product)],
    },
  }
}

function purchasable(variant: ProductDetail['variants'][number]): boolean {
  return !variant.manage_inventory || variant.inventory_quantity > 0
}

export function productJsonLd(
  product: ProductDetail,
  url: string
): WithContext<Product> | null {
  const available = product.variants.filter(purchasable)
  const priced = (available.length ? available : product.variants).filter(
    (v) => v.currency
  )
  const cheapest = priced.reduce<ProductDetail['variants'][number] | null>(
    (best, v) => (best === null || v.price < best.price ? v : best),
    null
  )

  if (!cheapest) return null

  const images = product.images.map((img) => img.url)
  const image = images.length
    ? images
    : [product.thumbnail || new URL(DEFAULT_OG_IMAGE, url).toString()]

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productTitle(product),
    description: productDescription(product),
    image,
    url,
    brand: { '@type': 'Brand', name: SITE_NAME },
    offers: {
      '@type': 'Offer',
      url,
      price: cheapest.price,
      priceCurrency: cheapest.currency.toUpperCase(),
      availability: available.length
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

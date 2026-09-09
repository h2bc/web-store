import { afterEach, describe, expect, it } from 'vitest'
import {
  SITE_DESCRIPTION,
  isIndexable,
  organizationJsonLd,
  productJsonLd,
  productMetadata,
  siteUrl,
  truncateDescription,
} from './seo'
import type { ProductDetail, ProductVariant } from './types/product-detail'

const ORIGINAL_ENV = { ...process.env }

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
})

function setEnv(overrides: Record<string, string | undefined>) {
  const next: NodeJS.ProcessEnv = { ...ORIGINAL_ENV }
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) delete next[key]
    else next[key] = value
  }
  process.env = next
}

function variant(overrides: Partial<ProductVariant> = {}): ProductVariant {
  return {
    id: 'var_1',
    title: 'M',
    price: 45,
    currency: 'eur',
    manage_inventory: true,
    inventory_quantity: 3,
    options: [],
    ...overrides,
  }
}

function product(overrides: Partial<ProductDetail> = {}): ProductDetail {
  return {
    slug: 'meduza-hood',
    name: 'MEDUZA HOOD',
    subtitle: '',
    seo: {},
    thumbnail: null,
    images: [{ id: 'img_1', url: 'https://cdn.example/hood-1.png' }],
    sizes: [],
    description: '',
    variants: [variant()],
    options: [],
    ...overrides,
  }
}

describe('siteUrl', () => {
  it('returns the configured origin without a trailing slash', () => {
    setEnv({ SITE_URL: 'https://h2bcweb.com/' })
    expect(siteUrl()).toBe('https://h2bcweb.com')
  })

  it('defaults to localhost outside production', () => {
    setEnv({ SITE_URL: undefined, NODE_ENV: 'development' })
    expect(siteUrl()).toBe('http://localhost:3000')
  })

  it('throws in production when unset', () => {
    setEnv({ SITE_URL: undefined, NODE_ENV: 'production', NEXT_PHASE: undefined })
    expect(() => siteUrl()).toThrow('SITE_URL is not set')
  })

  it('does not throw during the production build', () => {
    setEnv({
      SITE_URL: undefined,
      NODE_ENV: 'production',
      NEXT_PHASE: 'phase-production-build',
    })
    expect(siteUrl()).toBe('http://localhost:3000')
  })
})

describe('isIndexable', () => {
  it('is true only when SEO_INDEXABLE is exactly "true"', () => {
    setEnv({ SEO_INDEXABLE: 'true' })
    expect(isIndexable()).toBe(true)
    setEnv({ SEO_INDEXABLE: '1' })
    expect(isIndexable()).toBe(false)
    setEnv({ SEO_INDEXABLE: undefined })
    expect(isIndexable()).toBe(false)
  })
})

describe('truncateDescription', () => {
  it('strips headings', () => {
    expect(truncateDescription('# Heavy hood\n\nMade in Vilnius.')).toBe(
      'Heavy hood Made in Vilnius.'
    )
  })

  it('strips links, emphasis and lists', () => {
    expect(
      truncateDescription(
        '- **400gsm** cotton\n- see [size guide](https://x.y/guide)\n- *unisex*'
      )
    ).toBe('400gsm cotton see size guide unisex')
  })

  it('truncates long text at a word boundary with an ellipsis', () => {
    const words = Array.from({ length: 60 }, (_, i) => `word${i}`).join(' ')
    const out = truncateDescription(words, 50)
    expect(out.length).toBeLessThanOrEqual(51)
    expect(out.endsWith('…')).toBe(true)
    const kept = out.slice(0, -1)
    expect(words.startsWith(kept)).toBe(true)
    expect(kept.split(' ').every((w) => /^word\d+$/.test(w))).toBe(true)
  })

  it('returns short text untouched', () => {
    expect(truncateDescription('Short and sweet.')).toBe('Short and sweet.')
  })

  it('returns an empty string for empty input', () => {
    expect(truncateDescription('')).toBe('')
    expect(truncateDescription('   \n  ')).toBe('')
  })
})

describe('productMetadata', () => {
  it('uses seo_title and seo_description overrides', () => {
    const meta = productMetadata(
      product({
        seo: { title: 'Meduza Hoodie', description: 'Hand-drawn jellyfish.' },
        subtitle: 'ignored',
        description: 'ignored too',
      })
    )
    expect(meta.title).toBe('Meduza Hoodie')
    expect(meta.description).toBe('Hand-drawn jellyfish.')
    expect(meta.openGraph?.title).toBe('Meduza Hoodie | h2bc')
  })

  it('falls back to the product title and subtitle', () => {
    const meta = productMetadata(
      product({ subtitle: 'Heavyweight hood', description: 'ignored' })
    )
    expect(meta.title).toBe('MEDUZA HOOD')
    expect(meta.description).toBe('Heavyweight hood')
  })

  it('falls back to the stripped, truncated description', () => {
    const long = '## Story\n\n' + 'Jellyfish drift. '.repeat(20)
    const meta = productMetadata(product({ description: long }))
    expect(meta.description).not.toContain('#')
    expect((meta.description as string).length).toBeLessThanOrEqual(161)
    expect(meta.description).toMatch(/^Story Jellyfish drift\./)
  })

  it('falls back to the site description when nothing else exists', () => {
    expect(productMetadata(product()).description).toBe(SITE_DESCRIPTION)
  })

  it('sets canonical and og:url to the product path', () => {
    const meta = productMetadata(product())
    expect(meta.alternates?.canonical).toBe('/shop/meduza-hood')
    expect(meta.openGraph?.url).toBe('/shop/meduza-hood')
    expect(meta.openGraph?.images).toEqual(['https://cdn.example/hood-1.png'])
  })

  it('uses the default image when the product has none', () => {
    const meta = productMetadata(product({ images: [] }))
    expect(meta.openGraph?.images).toEqual(['/opengraph-image'])
  })
})

describe('productJsonLd', () => {
  const url = 'https://h2bcweb.com/shop/meduza-hood'

  it('marks in-stock products and picks the lowest purchasable price', () => {
    const ld = productJsonLd(
      product({
        variants: [
          variant({ id: 'a', price: 40, inventory_quantity: 0 }),
          variant({ id: 'b', price: 55 }),
          variant({ id: 'c', price: 50 }),
        ],
      }),
      url
    )!
    expect(ld['@type']).toBe('Product')
    expect(ld.name).toBe('MEDUZA HOOD')
    expect(ld.url).toBe(url)
    expect(ld.brand).toEqual({ '@type': 'Brand', name: 'h2bc' })
    expect(ld.offers).toMatchObject({
      '@type': 'Offer',
      price: 50,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    })
  })

  it('marks sold-out products', () => {
    const ld = productJsonLd(
      product({
        variants: [
          variant({ id: 'a', price: 40, inventory_quantity: 0 }),
          variant({ id: 'b', price: 30, inventory_quantity: 0 }),
        ],
      }),
      url
    )!
    expect(ld.offers).toMatchObject({
      price: 30,
      availability: 'https://schema.org/OutOfStock',
    })
  })

  it('treats untracked inventory as in stock', () => {
    const ld = productJsonLd(
      product({
        variants: [variant({ manage_inventory: false, inventory_quantity: 0 })],
      }),
      url
    )!
    expect(ld.offers).toMatchObject({
      availability: 'https://schema.org/InStock',
    })
  })

  it('lists every product image, or the default image', () => {
    expect(
      productJsonLd(
        product({
          images: [
            { id: '1', url: 'https://cdn.example/1.png' },
            { id: '2', url: 'https://cdn.example/2.png' },
          ],
        }),
        url
      )!.image
    ).toEqual(['https://cdn.example/1.png', 'https://cdn.example/2.png'])
    expect(productJsonLd(product({ images: [] }), url)!.image).toEqual([
      'https://h2bcweb.com/opengraph-image',
    ])
  })

  it('returns null when no variant carries a price', () => {
    expect(productJsonLd(product({ variants: [] }), url)).toBeNull()
  })
})

describe('organizationJsonLd', () => {
  it('links the brand accounts', () => {
    setEnv({ SITE_URL: 'https://h2bcweb.com' })
    expect(organizationJsonLd()).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'h2bc',
      url: 'https://h2bcweb.com',
      logo: 'https://h2bcweb.com/bw-logo.svg',
      sameAs: ['https://instagram.com/_h2bc', 'https://youtube.com/@_h2bc'],
    })
  })
})

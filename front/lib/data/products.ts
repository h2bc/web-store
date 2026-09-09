'use server'

import { cache } from 'react'
import { sdk } from '@/lib/medusa'
import type { HttpTypes } from '@medusajs/types'
import { getRegionId } from '@/lib/cookies'
import { cached } from '@/lib/cache'
import type { ProductHandle, ProductItem } from '@/lib/types/product'
import type {
  ProductDetail,
  ProductOption,
  ProductSeo,
  ProductVariant,
  SizeOption,
} from '@/lib/types/product-detail'

const CACHE_REVALIDATE_TIME = 60

type ProductsResult = {
  products: ProductItem[]
  error: string | null
}

type ProductByHandleResult = {
  product: ProductDetail | null
  error: string | null
  notFound: boolean
}

type ProductHandlesResult = {
  handles: ProductHandle[]
  error: string | null
}

const fetchProducts = async (regionId: string): Promise<ProductItem[]> => {
  return cached(
    async (): Promise<ProductItem[]> => {
      const { products } = await sdk.store.product.list({
        region_id: regionId,
        order: '-created_at',
        fields:
          'id,handle,title,' +
          'images,images.url,' +
          'categories,categories.name,' +
          '*variants, *variants.options, *variants.inventory_quantity',
      })

      return products.map((p: HttpTypes.StoreProduct): ProductItem => {
        const allVariantsManaged =
          p.variants?.every((v) => v.manage_inventory) ?? false
        const totalQty =
          p.variants?.reduce(
            (sum, v) => sum + (v.inventory_quantity ?? 0),
            0
          ) ?? 0

        const firstVariant = p.variants?.[0]

        return {
          slug: p.handle,
          name: p.title,
          price: firstVariant?.calculated_price?.calculated_amount ?? null,
          currencyCode: firstVariant?.calculated_price?.currency_code ?? null,
          image: p.images?.[0]?.url ?? '',
          hoverImage: p.images?.[1]?.url,
          soldOut: allVariantsManaged && totalQty <= 0,
          category: p.categories?.[0]?.name ?? '',
        }
      })
    },
    [`products-${regionId}`],
    {
      revalidate: CACHE_REVALIDATE_TIME,
      tags: ['products', `products-${regionId}`],
    }
  )()
}

// React cache() dedupes across generateMetadata and the page body within one request.
const getProductsOnce = cache(async (): Promise<ProductsResult> => {
  const regionId = await getRegionId()

  if (!regionId) {
    return {
      products: [],
      error: 'Region is not set',
    }
  }

  try {
    const products = await fetchProducts(regionId)

    return {
      products,
      error: null,
    }
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return {
      products: [],
      error: 'Failed to fetch products',
    }
  }
})

export async function getProducts(): Promise<ProductsResult> {
  return getProductsOnce()
}

const fetchProductDetails = async (
  handle: string,
  regionId: string
): Promise<ProductDetail | null> => {
  return cached(
    async (): Promise<ProductDetail | null> => {
      const { products } = await sdk.store.product.list({
        handle,
        region_id: regionId,
        fields:
          'id,handle,title,subtitle,description,thumbnail,*categories,*options,metadata,' +
          'images,images.url,' +
          '*variants, *variants.options, *variants.inventory_quantity',
      })

      if (!products || products.length === 0) {
        return null
      }

      const product = products[0]

      const sizeOption = product.options?.find(
        (o) => o.title?.toLowerCase() === 'size'
      )

      const sizeVariants: {
        size: string | undefined
        rank: number | null | undefined
        available: boolean
      }[] =
        product.variants
          ?.map((v) => ({
            size: v.options?.find((o) => o.option_id === sizeOption?.id)?.value,
            rank: v.variant_rank,
            available: v.manage_inventory
              ? (v.inventory_quantity ?? 0) > 0
              : true,
          }))
          .filter((item) => item.size) ?? []

      const sizeAvailabilityMap = new Map<string, boolean>()
      sizeVariants.forEach((item) => {
        const current = sizeAvailabilityMap.get(item.size!)
        sizeAvailabilityMap.set(
          item.size!,
          current === undefined ? item.available : current || item.available
        )
      })

      const sizes: SizeOption[] = [
        ...new Map(
          sizeVariants.map((item) => [item.size, item.rank])
        ).entries(),
      ]
        .filter((entry): entry is [string, number] => entry[1] != null)
        .sort((a, b) => a[1] - b[1])
        .map(([size]) => ({
          value: size!,
          available: sizeAvailabilityMap.get(size!) ?? true,
          option_id: sizeOption?.id ?? '',
        }))

      const categoryAlertValue = product.categories?.[0]?.metadata?.alert
      const categoryAlert =
        typeof categoryAlertValue === 'string' ? categoryAlertValue : undefined

      const variants: ProductVariant[] =
        product.variants?.map((v) => ({
          id: v.id,
          title: v.title ?? '',
          price: v.calculated_price?.calculated_amount ?? 0,
          currency: v.calculated_price?.currency_code ?? '',
          inventory_quantity: v.inventory_quantity ?? 0,
          manage_inventory: v.manage_inventory ?? false,
          options:
            v.options?.map((o) => ({
              option_id: o.option_id ?? '',
              value: o.value,
            })) ?? [],
        })) ?? []

      const options: ProductOption[] =
        product.options?.map((o) => ({
          id: o.id,
          title: o.title,
        })) ?? []

      const seo: ProductSeo = {}
      if (typeof product.metadata?.seo_title === 'string') {
        seo.title = product.metadata.seo_title.trim() || undefined
      }
      if (typeof product.metadata?.seo_description === 'string') {
        seo.description = product.metadata.seo_description.trim() || undefined
      }

      return {
        slug: product.handle,
        name: product.title,
        subtitle: product.subtitle ?? '',
        seo,
        thumbnail: product.thumbnail ?? null,
        images:
          product.images
            ?.filter((img) => img.url)
            .map((img) => ({ id: img.id, url: img.url })) ?? [],
        sizes,
        description: product.description ?? '',
        alert: categoryAlert,
        variants,
        options,
      }
    },
    [`product-${handle}-${regionId}`],
    {
      revalidate: CACHE_REVALIDATE_TIME,
      tags: ['products', `product-${handle}`, `products-${regionId}`],
    }
  )()
}

const getProductByHandleOnce = cache(
  async (handle: string): Promise<ProductByHandleResult> => {
    const regionId = await getRegionId()

    if (!regionId) {
      return {
        product: null,
        error: 'Region is not set',
        notFound: false,
      }
    }

    try {
      const product = await fetchProductDetails(handle, regionId)

      return {
        product,
        error: null,
        notFound: !product,
      }
    } catch (error) {
      console.error('Failed to fetch product:', error)
      return {
        product: null,
        error: 'Failed to fetch product',
        notFound: false,
      }
    }
  }
)

export async function getProductByHandle(
  handle: string
): Promise<ProductByHandleResult> {
  return getProductByHandleOnce(handle)
}

const HANDLES_PAGE_SIZE = 100

const fetchProductHandles = cached(
  async (): Promise<ProductHandle[]> => {
    const handles: ProductHandle[] = []
    let offset = 0

    while (true) {
      const { products, count } = await sdk.store.product.list({
        fields: 'handle,updated_at',
        limit: HANDLES_PAGE_SIZE,
        offset,
      })

      for (const p of products) {
        if (p.handle) {
          handles.push({ handle: p.handle, updatedAt: p.updated_at ?? null })
        }
      }

      offset += products.length
      if (products.length === 0 || offset >= count) break
    }

    return handles
  },
  ['product-handles'],
  { revalidate: CACHE_REVALIDATE_TIME, tags: ['products'] }
)

export async function getProductHandles(): Promise<ProductHandlesResult> {
  try {
    return { handles: await fetchProductHandles(), error: null }
  } catch (error) {
    console.error('Failed to fetch product handles:', error)
    return { handles: [], error: 'Failed to fetch product handles' }
  }
}

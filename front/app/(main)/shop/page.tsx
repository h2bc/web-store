import type { Metadata } from 'next'
import CategoryFilter from '@/components/shop/category-filter'
import ProductGrid from '@/components/shop/product-grid'
import ClientToastErrorHandler from '@/components/feedback/client-toast-error-handler'
import ErrorAlert from '@/components/feedback/error-alert'
import { headers } from 'next/headers'
import { userAgent } from 'next/server'
import { getCategories } from '@/lib/data/categories'
import { getProducts } from '@/lib/data/products'

const SHOP_METADATA: Metadata = {
  title: 'Shop',
  description: 'Shop h2bc hoodies, tees, beanies and accessories.',
}

export async function generateMetadata(): Promise<Metadata> {
  const { error } = await getProducts()

  if (error) {
    return { ...SHOP_METADATA, robots: { index: false } }
  }

  return { ...SHOP_METADATA, alternates: { canonical: '/shop' } }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const requestHeaders = await headers()
  const { device } = userAgent({ headers: requestHeaders })
  const enableHoverImages = device.type !== 'mobile' && device.type !== 'tablet'
  const productPriorityCount = device.type === 'mobile' ? 1 : 4

  const { products, error: productsError } = await getProducts()

  if (productsError) {
    return (
      <div className="flex justify-center pt-15">
        <ErrorAlert message={productsError} />
      </div>
    )
  }

  const { categories, error: categoriesError } = await getCategories()

  const params = await searchParams
  const activeCategory = params.category || 'ALL'

  // Sort: in-stock first, sold out last
  const sorted = [
    ...products.filter((p) => !p.soldOut),
    ...products.filter((p) => p.soldOut),
  ]

  // Filter by category
  const filtered =
    activeCategory === 'ALL'
      ? sorted
      : sorted.filter((p) => p.category === activeCategory)

  return (
    <ClientToastErrorHandler errors={[categoriesError]}>
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
        <CategoryFilter
          categories={['ALL', ...categories]}
          active={activeCategory}
        />
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 sm:gap-12">
          <ProductGrid
            products={filtered}
            enableHoverImages={enableHoverImages}
            priorityCount={productPriorityCount}
          />
        </section>
      </div>
    </ClientToastErrorHandler>
  )
}

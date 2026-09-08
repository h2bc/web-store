'use server'

import { sdk } from '@/lib/medusa'
import { cached } from '@/lib/cache'

const CACHE_REVALIDATE_TIME = 3600

const fetchCategoriesFromAPI = cached(
  async () => {
    const { product_categories } = await sdk.store.category.list()
    return product_categories.map((c) => c.name)
  },
  ['categories'],
  { revalidate: CACHE_REVALIDATE_TIME, tags: ['categories'] }
)

export async function getCategories() {
  try {
    const categories = await fetchCategoriesFromAPI()

    return {
      categories,
      error: null,
    }
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return {
      categories: [],
      error: 'Failed to fetch categories',
    }
  }
}

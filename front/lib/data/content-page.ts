import 'server-only'
import { cache } from 'react'
import { sdk } from '@/lib/medusa'
import { cached } from '@/lib/cache'
import type { ContentPage } from '@/lib/types/content-page'

const CACHE_REVALIDATE_TIME = 60

type StoreContentPage = {
  slug: string
  title: string
  description: string
  body: string
  updated_at: string
}

type ContentPageResult = {
  contentPage: ContentPage | null
  error: string | null
  notFound: boolean
}

function toContentPage(item: StoreContentPage): ContentPage {
  return {
    slug: item.slug,
    title: item.title,
    description: item.description,
    body: item.body,
    updatedAt: item.updated_at,
  }
}

function isNotFound(error: unknown): boolean {
  return error instanceof Error && 'status' in error && error.status === 404
}

const fetchContentPage = (slug: string): Promise<ContentPage | null> =>
  cached(
    async (): Promise<ContentPage | null> => {
      try {
        const { content_page } = await sdk.client.fetch<{
          content_page: StoreContentPage
        }>(`/store/${slug}`)

        return toContentPage(content_page)
      } catch (error) {
        if (isNotFound(error)) return null

        throw error
      }
    },
    ['content-page', slug],
    { revalidate: CACHE_REVALIDATE_TIME, tags: [`content-page-${slug}`] }
  )()

export const getContentPage = cache(
  async (slug: string): Promise<ContentPageResult> => {
    try {
      const contentPage = await fetchContentPage(slug)

      return { contentPage, error: null, notFound: !contentPage }
    } catch (error) {
      console.error('Failed to fetch contentPage page:', error)

      return {
        contentPage: null,
        error: 'Failed to load the page',
        notFound: false,
      }
    }
  }
)
